import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';
import kbn from 'app/core/utils/kbn';
import {appEvents, contextSrv} from 'app/core/core';
import {tickStep, getScaledDecimals, getFlotTickSize} from 'app/core/utils/ticks';
import d3 from 'd3';
import * as d3ScaleChromatic from './libs/d3-scale-chromatic/index';
import {StatusHeatmapTooltip} from './tooltip';

let MIN_CARD_SIZE = 5,
    CARD_SPACING = 2,
    CARD_ROUND = 0,
    DATA_RANGE_WIDING_FACTOR = 1.2,
    DEFAULT_X_TICK_SIZE_PX = 100,
    DEFAULT_Y_TICK_SIZE_PX = 50,
    X_AXIS_TICK_PADDING = 10,
    Y_AXIS_TICK_PADDING = 5,
    MIN_SELECTION_WIDTH = 2;

export default function link(scope, elem, attrs, ctrl) {
  let data, cardsData, timeRange, panel, heatmap;

  // $heatmap is JQuery object, but heatmap is D3
  let $heatmap = elem.find('.status-heatmap-panel');
  let tooltip = new StatusHeatmapTooltip($heatmap, scope);

  let width, height,
      yScale, xScale,
      chartWidth, chartHeight,
      chartTop, chartBottom,
      yAxisWidth, xAxisHeight,
      cardSpacing, cardRound,
      cardWidth, cardHeight,
      colorScale, opacityScale,
      mouseUpHandler,
      xGridSize, yGridSize;

  let yOffset = 0;

  let selection = {
    active: false,
    x1: -1,
    x2: -1
  };

  let padding = {left: 0, right: 0, top: 0, bottom: 0},
      margin = {left: 25, right: 15, top: 10, bottom: 20},
      dataRangeWidingFactor = DATA_RANGE_WIDING_FACTOR;

  ctrl.events.on('render', () => {
    render();
  });

  function setElementHeight() {
    try {
      var height = ctrl.height || panel.height || ctrl.row.height;
      if (_.isString(height)) {
        height = parseInt(height.replace('px', ''), 10);
      }

      height -= panel.legend.show ? 32 : 10; // bottom padding and space for legend. Change margin in .status-heatmap-color-legend !

      $heatmap.css('height', height + 'px');

      return true;
    } catch (e) { // IE throws errors sometimes
      return false;
    }
  }

  function getYAxisWidth(elem) {
    let axis_text = elem.selectAll(".axis-y text").nodes();
    let max_text_width = _.max(_.map(axis_text, text => {
      // Use SVG getBBox method
      return text.getBBox().width;
    }));

    return max_text_width;
  }

  function getXAxisHeight(elem) {
    let axis_line = elem.select(".axis-x line");
    if (!axis_line.empty()) {
      let axis_line_position = parseFloat(elem.select(".axis-x line").attr("y2"));
      let canvas_width = parseFloat(elem.attr("height"));
      return canvas_width - axis_line_position;
    } else {
      // Default height
      return 30;
    }
  }

  function addXAxis() {
    // Scale timestamps to cards centers
    scope.xScale = xScale = d3.scaleTime()
      .domain([timeRange.from, timeRange.to])
      .range([xGridSize/2, chartWidth-xGridSize/2]);

    let ticks = chartWidth / DEFAULT_X_TICK_SIZE_PX;
    let grafanaTimeFormatter = grafanaTimeFormat(ticks, timeRange.from, timeRange.to);
    let timeFormat;
    let dashboardTimeZone = ctrl.dashboard.getTimezone();
    if (dashboardTimeZone === 'utc') {
      timeFormat = d3.utcFormat(grafanaTimeFormatter);
    } else {
      timeFormat = d3.timeFormat(grafanaTimeFormatter);
    }

    let xAxis = d3.axisBottom(xScale)
      .ticks(ticks)
      .tickFormat(timeFormat)
      .tickPadding(X_AXIS_TICK_PADDING)
      .tickSize(chartHeight);

    let posY = chartTop;
    let posX = yAxisWidth;

    heatmap.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", "translate(" + posX + "," + posY + ")")
      .call(xAxis);

    // Remove horizontal line in the top of axis labels (called domain in d3)
    heatmap.select(".axis-x").select(".domain").remove();
  }

  // divide chart height by ticks for cards drawing
  function getYScale(ticks) {
    let range = [];
    let step = chartHeight / ticks.length;
    range.push(chartHeight);
    for (let i = 1; i < ticks.length; i++) {
      range.push(chartHeight - step * i);
    }
    return d3.scaleOrdinal()
      .domain(ticks)
      .range(range);
  }

  // divide chart height by ticks with offset for ticks drawing
  function getYAxisScale(ticks) {
    let range = [];
    let step = chartHeight / ticks.length;
    range.push(chartHeight - yOffset);
    for (let i = 1; i < ticks.length; i++) {
      range.push(chartHeight - step * i - yOffset);
    }
    return d3.scaleOrdinal()
      .domain(ticks)
      .range(range);
  }

  function addYAxis() {
    let ticks = _.uniq(_.map(data, d => d.target));

    // Set default Y min and max if no data
    if (_.isEmpty(data)) {
      ticks = [''];
    }

    let yAxisScale = getYAxisScale(ticks);
    scope.yScale = yScale = getYScale(ticks);

    let yAxis = d3.axisLeft(yAxisScale)
      .tickValues(ticks)
      .tickSizeInner(0 - width)
      .tickPadding(Y_AXIS_TICK_PADDING);

    heatmap.append("g")
      .attr("class", "axis axis-y")
      .call(yAxis);

    // Calculate Y axis width first, then move axis into visible area
    let posY = margin.top;
    let posX = getYAxisWidth(heatmap) + Y_AXIS_TICK_PADDING;
    heatmap.select(".axis-y").attr("transform", "translate(" + posX + "," + posY + ")");

    // Remove vertical line in the right of axis labels (called domain in d3)
    heatmap.select(".axis-y").select(".domain").remove();
    heatmap.select(".axis-y").selectAll(".tick line").remove();
  }

  // Wide Y values range and adjust to bucket size
  function wideYAxisRange(min, max, tickInterval) {
    let y_widing = (max * (dataRangeWidingFactor - 1) - min * (dataRangeWidingFactor - 1)) / 2;
    let y_min, y_max;

    if (tickInterval === 0) {
      y_max = max * dataRangeWidingFactor;
      y_min = min - min * (dataRangeWidingFactor - 1);
      tickInterval = (y_max - y_min) / 2;
    } else {
      y_max = Math.ceil((max + y_widing) / tickInterval) * tickInterval;
      y_min = Math.floor((min - y_widing) / tickInterval) * tickInterval;
    }

    // Don't wide axis below 0 if all values are positive
    if (min >= 0 && y_min < 0) {
      y_min = 0;
    }

    return {y_min, y_max};
  }

  function tickValueFormatter(decimals, scaledDecimals = null) {
    let format = panel.yAxis.format;
    return function(value) {
      return kbn.valueFormats[format](value, decimals, scaledDecimals);
    };
  }

  // Create svg element, add axes and
  // calculate sizes for cards drawing
  function addHeatmapCanvas() {
    let heatmap_elem = $heatmap[0];

    width = Math.floor($heatmap.width()) - padding.right;
    height = Math.floor($heatmap.height()) - padding.bottom;

    if (heatmap) {
      heatmap.remove();
    }

    heatmap = d3.select(heatmap_elem)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    chartHeight = height - margin.top - margin.bottom;
    chartTop = margin.top;
    chartBottom = chartTop + chartHeight;

    cardSpacing = panel.cards.cardSpacing !== null ? panel.cards.cardSpacing : CARD_SPACING;
    cardRound = panel.cards.cardRound !== null ? panel.cards.cardRound : CARD_ROUND;

    // calculate yOffset for YAxis
    yGridSize = Math.floor(chartHeight / cardsData.yBucketSize);
    cardHeight = yGridSize ? yGridSize - cardSpacing : 0;
    yOffset = cardHeight / 2;

    addYAxis();

    yAxisWidth = getYAxisWidth(heatmap) + Y_AXIS_TICK_PADDING;
    chartWidth = width - yAxisWidth - margin.right;

    // we need to fill chartWidth with xBucketSize cards.
    xGridSize = chartWidth / (cardsData.xBucketSize+1);
    cardWidth = xGridSize - cardSpacing;

    addXAxis();
    xAxisHeight = getXAxisHeight(heatmap);

    if (!panel.yAxis.show) {
      heatmap.select(".axis-y").selectAll("line").style("opacity", 0);
    }

    if (!panel.xAxis.show) {
      heatmap.select(".axis-x").selectAll("line").style("opacity", 0);
    }
  }

  function addHeatmap() {
    addHeatmapCanvas();

    let maxValue = panel.color.max || cardsData.maxValue;
    let minValue = panel.color.min || cardsData.minValue;

    if (panel.color.mode !== 'discrete') {
      colorScale = getColorScale(maxValue, minValue);
    }
    setOpacityScale(maxValue);

    let cards = heatmap.selectAll(".status-heatmap-card").data(cardsData.cards);
    cards.append("title");
    cards = cards.enter().append("rect")
    .attr("cardId", c => c.id)
    .attr("x", getCardX)
    .attr("width", getCardWidth)
    .attr("y", getCardY)
    .attr("height", getCardHeight)
    .attr("rx", cardRound)
    .attr("ry", cardRound)
    .attr("class", "bordered status-heatmap-card")
    .style("fill", getCardColor)
    .style("stroke", getCardColor)
    .style("stroke-width", 0)
    //.style("stroke-width", getCardStrokeWidth)
    //.style("stroke-dasharray", "3,3")
    .style("opacity", getCardOpacity);

    let $cards = $heatmap.find(".status-heatmap-card");
    $cards.on("mouseenter", (event) => {
      tooltip.mouseOverBucket = true;
      highlightCard(event);
    })
    .on("mouseleave", (event) => {
      tooltip.mouseOverBucket = false;
      resetCardHighLight(event);
    });

    ctrl.events.emit('render-complete', {
      "chartWidth": chartWidth
    });
  }

  function highlightCard(event) {
    let color = d3.select(event.target).style("fill");
    let highlightColor = d3.color(color).darker(2);
    let strokeColor = d3.color(color).brighter(4);
    let current_card = d3.select(event.target);
    tooltip.originalFillColor = color;
    current_card.style("fill", highlightColor)
    .style("stroke", strokeColor)
    .style("stroke-width", 1);
  }

  function resetCardHighLight(event) {
    d3
      .select(event.target)
      .style("fill", tooltip.originalFillColor)
      .style("stroke", tooltip.originalFillColor)
      .style("stroke-width", 0);
  }

  function getColorScale(maxValue, minValue = 0) {
    let colorScheme = _.find(ctrl.colorSchemes, {value: panel.color.colorScheme});
    let colorInterpolator = d3ScaleChromatic[colorScheme.value];
    let colorScaleInverted = colorScheme.invert === 'always' ||
      (colorScheme.invert === 'dark' && !contextSrv.user.lightTheme);

    if (maxValue == minValue)
      maxValue = minValue + 1;

    let start = colorScaleInverted ? maxValue : minValue;
    let end = colorScaleInverted ? minValue : maxValue;

    return d3.scaleSequential(colorInterpolator).domain([start, end]);
  }

  function setOpacityScale(maxValue) {
    if (panel.color.colorScale === 'linear') {
      opacityScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, 1]);
    } else if (panel.color.colorScale === 'sqrt') {
      opacityScale = d3.scalePow().exponent(panel.color.exponent)
      .domain([0, maxValue])
      .range([0, 1]);
    }
  }

  function getCardX(d) {
    let x;
    // cx is the center of the card. Card should be placed to the left.
    let cx = xScale(d.x);

    if (cx - cardWidth/2 < 0) {
      x = yAxisWidth + cardSpacing/2;
    } else {
      x = yAxisWidth + cx - cardWidth/2;
    }

    return x;
  }

  // xScale returns card center. Adjust cardWidth in case of overlaping.
  function getCardWidth(d) {
    let w;
    let cx = xScale(d.x);

    if (cx < cardWidth/2) {
      // Center should not exceed half of card.
      // Cut card to the left to prevent overlay of y axis.
      let cutted_width = (cx - cardSpacing/2) + cardWidth/2;
      w = cutted_width > 0 ? cutted_width : 0;
    } else if (chartWidth - cx < cardWidth/2) {
      // Cut card to the right to prevent overlay of right graph edge.
      w = cardWidth/2 + (chartWidth - cx - cardSpacing/2);
    } else {
      w = cardWidth;
    }

    // Card width should be MIN_CARD_SIZE at least
    w = Math.max(w, MIN_CARD_SIZE);

    return w;
  }

  function getCardY(d) {
    return yScale(d.y) + chartTop - cardHeight - cardSpacing/2;
  }

  function getCardHeight(d) {
    let ys = yScale(d.y);
    let y = ys + chartTop - cardHeight - cardSpacing/2;
    let h = cardHeight;

    // Cut card height to prevent overlay
    if (y < chartTop) {
      h = ys - cardSpacing/2;
    } else if (ys > chartBottom) {
      h = chartBottom - y;
    } else if (y + cardHeight > chartBottom) {
      h = chartBottom - y;
    }

    // Height can't be more than chart height
    h = Math.min(h, chartHeight);
    // Card height should be MIN_CARD_SIZE at least
    h = Math.max(h, MIN_CARD_SIZE);

    return h;
  }

  function getCardColor(d) {
    if (panel.color.mode === 'opacity') {
      return panel.color.cardColor;
    } else if (panel.color.mode === 'spectrum') {
      return colorScale(d.value);
    } else if (panel.color.mode === 'discrete') {
      return ctrl.discreteHelper.getBucketColor(d.values);
    }
  }

  function getCardOpacity(d) {
    if (panel.nullPointMode === 'as empty' && d.value == null ) {
      return 0;
    }
    if (panel.color.mode === 'opacity') {
      return opacityScale(d.value);
    } else {
      return 1;
    }
  }

  function getCardStrokeWidth(d) {
    if (panel.color.mode === 'discrete') {
      return '1';
    }
    return '0';
  }

  /////////////////////////////
  // Selection and crosshair //
  /////////////////////////////

  // Shared crosshair and tooltip
  appEvents.on('graph-hover', event => {
    drawSharedCrosshair(event.pos);
  }, scope);

  appEvents.on('graph-hover-clear', () => {
    clearCrosshair();
  }, scope);

  function onMouseDown(event) {
    selection.active = true;
    selection.x1 = event.offsetX;

    mouseUpHandler = function() {
      onMouseUp();
    };

    $(document).one("mouseup", mouseUpHandler);
  }

  function onMouseUp() {
    $(document).unbind("mouseup", mouseUpHandler);
    mouseUpHandler = null;
    selection.active = false;

    let selectionRange = Math.abs(selection.x2 - selection.x1);
    if (selection.x2 >= 0 && selectionRange > MIN_SELECTION_WIDTH) {
      let timeFrom = xScale.invert(Math.min(selection.x1, selection.x2) - yAxisWidth - xGridSize/2);
      let timeTo = xScale.invert(Math.max(selection.x1, selection.x2) - yAxisWidth - xGridSize/2);

      ctrl.timeSrv.setTime({
        from: moment.utc(timeFrom),
        to: moment.utc(timeTo)
      });
    }

    clearSelection();
  }

  function onMouseLeave() {
    appEvents.emit('graph-hover-clear');
    clearCrosshair();
  }

  function onMouseMove(event) {
    if (!heatmap) { return; }

    if (selection.active) {
      // Clear crosshair and tooltip
      clearCrosshair();
      tooltip.destroy();

      selection.x2 = limitSelection(event.offsetX);
      drawSelection(selection.x1, selection.x2);
    } else {
      emitGraphHoverEvet(event);
      drawCrosshair(event.offsetX);
      tooltip.show(event); //, data);
    }
  }

  function emitGraphHoverEvet(event) {
    let x = xScale.invert(event.offsetX - yAxisWidth - xGridSize/2).valueOf();
    let y = yScale(event.offsetY);
    let pos = {
      pageX: event.pageX,
      pageY: event.pageY,
      x: x, x1: x,
      y: y, y1: y,
      panelRelY: null
    };

    // Set minimum offset to prevent showing legend from another panel
    pos.panelRelY = Math.max(event.offsetY / height, 0.001);

    // broadcast to other graph panels that we are hovering
    appEvents.emit('graph-hover', {pos: pos, panel: panel});
  }

  function limitSelection(x2) {
    x2 = Math.max(x2, yAxisWidth);
    x2 = Math.min(x2, chartWidth + yAxisWidth);
    return x2;
  }

  function drawSelection(posX1, posX2) {
    if (heatmap) {
      heatmap.selectAll(".status-heatmap-selection").remove();
      let selectionX = Math.min(posX1, posX2);
      let selectionWidth = Math.abs(posX1 - posX2);

      if (selectionWidth > MIN_SELECTION_WIDTH) {
        heatmap.append("rect")
        .attr("class", "status-heatmap-selection")
        .attr("x", selectionX)
        .attr("width", selectionWidth)
        .attr("y", chartTop)
        .attr("height", chartHeight);
      }
    }
  }

  function clearSelection() {
    selection.x1 = -1;
    selection.x2 = -1;

    if (heatmap) {
      heatmap.selectAll(".status-heatmap-selection").remove();
    }
  }

  function drawCrosshair(position) {
    if (heatmap) {
      heatmap.selectAll(".status-heatmap-crosshair").remove();

      let posX = position;
      posX = Math.max(posX, yAxisWidth);
      posX = Math.min(posX, chartWidth + yAxisWidth);

      heatmap.append("g")
      .attr("class", "status-heatmap-crosshair")
      .attr("transform", "translate(" + posX + ",0)")
      .append("line")
      .attr("x1", 1)
      .attr("y1", chartTop)
      .attr("x2", 1)
      .attr("y2", chartBottom)
      .attr("stroke-width", 1);
    }
  }

  // map time to X
  function drawSharedCrosshair(pos) {
    if (heatmap && ctrl.dashboard.graphTooltip !== 0) {
      let posX = xScale(pos.x) + yAxisWidth;
      drawCrosshair(posX);
    }
  }

  function clearCrosshair() {
    if (heatmap) {
      heatmap.selectAll(".status-heatmap-crosshair").remove();
    }
  }

  function render() {
    data = ctrl.data;
    panel = ctrl.panel;
    timeRange = ctrl.range;
    cardsData = ctrl.cardsData;

    if (!data || !cardsData || !setElementHeight()) {
      return;
    }

    // Draw default axes and return if no data
    if (_.isEmpty(cardsData.cards)) {
      addHeatmapCanvas();
      return;
    }

    addHeatmap();
    scope.yAxisWidth = yAxisWidth;
    scope.xAxisHeight = xAxisHeight;
    scope.chartHeight = chartHeight;
    scope.chartWidth = chartWidth;
    scope.chartTop = chartTop;
  }

  // Register selection listeners
  $heatmap.on("mousedown", onMouseDown);
  $heatmap.on("mousemove", onMouseMove);
  $heatmap.on("mouseleave", onMouseLeave);
}

function grafanaTimeFormat(ticks, min, max) {
  if (min && max && ticks) {
    let range = max - min;
    let secPerTick = (range/ticks) / 1000;
    let oneDay = 86400000;
    let oneYear = 31536000000;

    if (secPerTick <= 45) {
      return "%H:%M:%S";
    }
    if (secPerTick <= 7200 || range <= oneDay) {
      return "%H:%M";
    }
    if (secPerTick <= 80000) {
      return "%m/%d %H:%M";
    }
    if (secPerTick <= 2419200 || range <= oneYear) {
      return "%m/%d";
    }
    return "%Y-%m";
  }

  return "%H:%M";
}

import _ from 'lodash';
import $ from 'jquery';

// TODO moment is used instead of @grafana/data to run in 6.2 and earlier.
/* eslint-disable id-blacklist, no-restricted-imports, @typescript-eslint/ban-types */
import moment from 'moment';

import kbn from 'grafana/app/core/utils/kbn';
import { appEvents, contextSrv } from 'grafana/app/core/core';
import * as d3 from 'd3';
import { d3ScaleChromatic } from './util/d3/d3-scale-chromatic';
import { StatusmapTooltip } from './tooltip';
import { AnnotationTooltip } from './annotations';
import { Bucket, BucketMatrix, BucketMatrixPager } from './statusmap_data';
import { StatusHeatmapCtrl } from './module';
import { CoreEvents } from './util/grafana/events/index';
import { PanelEvents } from '@grafana/data';

let MIN_CARD_SIZE = 5,
  CARD_H_SPACING = 2,
  CARD_V_SPACING = 2,
  CARD_ROUND = 0,
  DATA_RANGE_WIDING_FACTOR = 1.2,
  DEFAULT_X_TICK_SIZE_PX = 100,
  // @ts-ignore
  DEFAULT_Y_TICK_SIZE_PX = 50,
  X_AXIS_TICK_PADDING = 10,
  Y_AXIS_TICK_PADDING = 5,
  MIN_SELECTION_WIDTH = 2;

export default function rendering(scope: any, elem: any, attrs: any, ctrl: any) {
  return new StatusmapRenderer(scope, elem, attrs, ctrl);
}

// @ts-ignore
class Statusmap {
  $svg: any;
  svg: any;
  bucketMatrix: BucketMatrix;

  timeRange: { from: number; to: number } = { from: 0, to: 0 };

  constructor() {}
}

export class StatusmapRenderer {
  width = 0;
  height = 0;
  yScale: any;
  xScale: any;
  chartWidth = 0;
  chartHeight = 0;
  chartTop = 0;
  chartBottom = 0;
  yAxisWidth = 0;
  xAxisHeight = 0;
  cardVSpacing = 0;
  cardHSpacing = 0;
  cardRound = 0;
  cardWidth = 0;
  cardHeight = 0;
  colorScale: any;
  opacityScale: any;
  mouseUpHandler: any;
  xGridSize = 0;
  yGridSize = 0;

  bucketMatrix: BucketMatrix;
  bucketMatrixPager: BucketMatrixPager;
  panel: any;
  $heatmap: any;
  tooltip: StatusmapTooltip;
  annotationTooltip: AnnotationTooltip;
  heatmap: any;
  timeRange: any;

  yOffset: number;
  selection: any;
  padding: any;
  margin: any;
  dataRangeWidingFactor: number = DATA_RANGE_WIDING_FACTOR;

  constructor(private scope: any, private elem: any, attrs: any, private ctrl: StatusHeatmapCtrl) {
    // $heatmap is JQuery object, but heatmap is D3
    this.$heatmap = this.elem.find('.statusmap-panel');
    this.tooltip = new StatusmapTooltip(this.$heatmap, this.scope);
    this.annotationTooltip = new AnnotationTooltip(this.$heatmap, this.scope);

    this.yOffset = 0;

    this.selection = {
      active: false,
      x1: -1,
      x2: -1,
    };

    this.padding = { left: 0, right: 0, top: 0, bottom: 0 };
    this.margin = { left: 25, right: 15, top: 10, bottom: 20 };

    this.ctrl.events.on(PanelEvents.render, this.onRender.bind(this));

    // @ts-ignore
    this.ctrl.tickValueFormatter = this.tickValueFormatter.bind(this);

    /////////////////////////////
    // Selection and crosshair //
    /////////////////////////////

    // Shared crosshair and tooltip    this.empty = true;

    appEvents.on(CoreEvents.graphHover, this.onGraphHover.bind(this), this.scope);

    appEvents.on(CoreEvents.graphHoverClear, this.onGraphHoverClear.bind(this), this.scope);

    // Register selection listeners
    this.$heatmap.on('mousedown', this.onMouseDown.bind(this));
    this.$heatmap.on('mousemove', this.onMouseMove.bind(this));
    this.$heatmap.on('mouseleave', this.onMouseLeave.bind(this));
    this.$heatmap.on('click', this.onMouseClick.bind(this));
  }

  onGraphHoverClear() {
    this.clearCrosshair();
  }

  onGraphHover(event: { pos: any }) {
    this.drawSharedCrosshair(event.pos);
  }

  onRender() {
    this.render();
    this.ctrl.renderingCompleted();
  }

  setElementHeight(): boolean {
    try {
      var height = this.ctrl.height || this.panel.height || this.ctrl.row.height;
      if (_.isString(height)) {
        height = parseInt(height.replace('px', ''), 10);
      }

      if (this.panel.usingPagination) {
        // TODO  get height of pagination controls.
        // reserve height for legend and for a row of pagination controls.
        height -= this.panel.legend.show ? 70 : 40; // bottom padding and space for legend. Change margin in .status-heatmap-color-legend !
      } else {
        // reserve height for legend
        height -= this.panel.legend.show ? 32 : 4; // bottom padding and space for legend. Change margin in .status-heatmap-color-legend !
      }

      this.$heatmap.css('height', height + 'px');

      return true;
    } catch (e) {
      // IE throws errors sometimes
      return false;
    }
  }

  getYAxisWidth(elem: any): number {
    const axisText = elem.selectAll('.axis-y text').nodes();
    const maxTextWidth = _.max(
      _.map(axisText, text => {
        // Use SVG getBBox method
        return text.getBBox().width;
      })
    );

    return Math.ceil(maxTextWidth);
  }

  getXAxisHeight(elem: any): number {
    let axisLine = elem.select('.axis-x line');
    if (!axisLine.empty()) {
      let axisLinePosition = parseFloat(elem.select('.axis-x line').attr('y2'));
      let canvasWidth = parseFloat(elem.attr('height'));
      return canvasWidth - axisLinePosition;
    } else {
      // Default height
      return 30;
    }
  }

  addXAxis() {
    // Scale timestamps to cards centers
    //this.scope.xScale = this.xScale = d3.scaleTime()
    //    .domain([this.timeRange.from, this.timeRange.to])
    //    .range([this.xGridSize/2, this.chartWidth-this.xGridSize/2]);
    // Buckets without the most recent
    this.scope.xScale = this.xScale = d3
      .scaleTime()
      .domain([this.timeRange.from, this.timeRange.to])
      .range([this.xGridSize / 2, this.chartWidth - this.xGridSize / 2]);

    let ticks = this.chartWidth / DEFAULT_X_TICK_SIZE_PX;
    let grafanaTimeFormatter = grafanaTimeFormat(ticks, this.timeRange.from, this.timeRange.to);
    let timeFormat;
    let dashboardTimeZone = this.ctrl.dashboard.getTimezone();
    if (dashboardTimeZone === 'utc') {
      timeFormat = d3.utcFormat(grafanaTimeFormatter);
    } else {
      timeFormat = d3.timeFormat(grafanaTimeFormatter);
    }

    let xAxis = d3
      .axisBottom(this.xScale)
      .ticks(ticks)
      .tickFormat(timeFormat)
      .tickPadding(X_AXIS_TICK_PADDING)
      .tickSize(this.chartHeight);

    let posY = this.chartTop; // this.margin.top !
    let posX = this.yAxisWidth;

    this.heatmap
      .append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', 'translate(' + posX + ',' + posY + ')')
      .call(xAxis);

    // Remove horizontal line in the top of axis labels (called domain in d3)
    this.heatmap.select('.axis-x').select('.domain').remove();
  }

  // divide chart height by ticks for cards drawing
  getYScale(ticks: any[]) {
    let range: any[] = [];
    let step = this.chartHeight / ticks.length;
    // svg has y=0 on the top, so top card should have a minimal value in range
    range.push(step);
    for (let i = 1; i < ticks.length; i++) {
      range.push(step * (i + 1));
    }
    return d3.scaleOrdinal().domain(ticks).range(range);
  }

  // divide chart height by ticks with offset for ticks drawing
  getYAxisScale(ticks: any[]) {
    let range: any[] = [];
    let step = this.chartHeight / ticks.length;
    // svg has y=0 on the top, so top tick should have a minimal value in range
    range.push(this.yOffset);
    for (let i = 1; i < ticks.length; i++) {
      range.push(step * i + this.yOffset);
    }
    return d3.scaleOrdinal().domain(ticks).range(range);
  }

  addYAxis() {
    let ticks = this.bucketMatrixPager.targets();

    // TODO move sorting into bucketMatrixPager.
    if (this.panel.yAxisSort === 'a → z') {
      ticks.sort((a, b) => a.localeCompare(b, 'en', { ignorePunctuation: false, numeric: true }));
    } else if (this.panel.yAxisSort === 'z → a') {
      ticks.sort((b, a) => a.localeCompare(b, 'en', { ignorePunctuation: false, numeric: true }));
    }

    let yAxisScale = this.getYAxisScale(ticks);
    this.scope.yScale = this.yScale = this.getYScale(ticks);

    let yAxis = d3
      // @ts-ignore
      .axisLeft(yAxisScale)
      .tickValues(ticks)
      .tickSizeInner(0 - this.width)
      .tickPadding(Y_AXIS_TICK_PADDING);

    this.heatmap.append('g').attr('class', 'axis axis-y').call(yAxis);

    // Calculate Y axis width first, then move axis into visible area
    let posY = this.margin.top;
    let posX = this.getYAxisWidth(this.heatmap) + Y_AXIS_TICK_PADDING;
    this.heatmap.select('.axis-y').attr('transform', 'translate(' + posX + ',' + posY + ')');

    // Remove vertical line in the right of axis labels (called domain in d3)
    this.heatmap.select('.axis-y').select('.domain').remove();
    this.heatmap.select('.axis-y').selectAll('.tick line').remove();
  }

  // Wide Y values range and adjust to bucket size
  wideYAxisRange(min: number, max: number, tickInterval: number) {
    let y_widing = (max * (this.dataRangeWidingFactor - 1) - min * (this.dataRangeWidingFactor - 1)) / 2;
    let y_min, y_max;

    if (tickInterval === 0) {
      y_max = max * this.dataRangeWidingFactor;
      y_min = min - min * (this.dataRangeWidingFactor - 1);
      tickInterval = (y_max - y_min) / 2;
    } else {
      y_max = Math.ceil((max + y_widing) / tickInterval) * tickInterval;
      y_min = Math.floor((min - y_widing) / tickInterval) * tickInterval;
    }

    // Don't wide axis below 0 if all values are positive
    if (min >= 0 && y_min < 0) {
      y_min = 0;
    }

    return { y_min, y_max };
  }

  tickValueFormatter(decimals, scaledDecimals = null) {
    let format = this.panel.yAxis.format;
    return function (value) {
      return kbn.valueFormats[format](value, decimals, scaledDecimals);
    };
  }

  // Create svg element, add axes and
  // calculate sizes for cards drawing
  addStatusmapCanvas() {
    let heatmap_elem = this.$heatmap[0];

    this.width = Math.floor(this.$heatmap.width()) - this.padding.right;
    this.height = Math.floor(this.$heatmap.height()) - this.padding.bottom;

    if (this.heatmap) {
      this.heatmap.remove();
    }

    // Insert svg as a first child into heatmap_elem
    // as the frozen tooltip moving logiс assumes that tooltip is the last child.
    this.heatmap = d3
      .select(heatmap_elem)
      .insert('svg', ':first-child')
      .attr('width', this.width)
      .attr('height', this.height);

    this.chartHeight = this.height - this.margin.top - this.margin.bottom;
    this.chartTop = this.margin.top;
    this.chartBottom = this.chartTop + this.chartHeight;

    this.cardHSpacing = this.panel.cards.cardHSpacing !== null ? this.panel.cards.cardHSpacing : CARD_H_SPACING;
    this.cardVSpacing = this.panel.cards.cardVSpacing !== null ? this.panel.cards.cardVSpacing : CARD_V_SPACING;
    this.cardRound = this.panel.cards.cardRound !== null ? this.panel.cards.cardRound : CARD_ROUND;

    // calculate yOffset for YAxis
    this.yGridSize = this.chartHeight;
    if (this.bucketMatrixPager.targets().length > 0) {
      this.yGridSize = Math.floor(this.chartHeight / this.bucketMatrixPager.targets().length);
    }
    this.cardHeight = this.yGridSize ? this.yGridSize - this.cardVSpacing : 0;
    this.yOffset = this.cardHeight / 2;

    this.addYAxis();

    this.yAxisWidth = this.getYAxisWidth(this.heatmap) + Y_AXIS_TICK_PADDING;
    this.chartWidth = this.width - this.yAxisWidth - this.margin.right;

    // TODO allow per-y cardWidth!
    // we need to fill chartWidth with xBucketSize cards.
    this.xGridSize = this.chartWidth / (this.bucketMatrix.xBucketSize + 1);
    this.cardWidth = this.xGridSize - this.cardHSpacing;

    this.addXAxis();
    this.xAxisHeight = this.getXAxisHeight(this.heatmap);

    if (!this.panel.yAxis.show) {
      this.heatmap.select('.axis-y').selectAll('line').style('opacity', 0);
    }

    if (!this.panel.xAxis.show) {
      this.heatmap.select('.axis-x').selectAll('line').style('opacity', 0);
    }
  }

  addStatusmap(): void {
    let maxValue = this.panel.color.max != null ? this.panel.color.max : this.bucketMatrix.maxValue;
    let minValue = this.panel.color.min != null ? this.panel.color.min : this.bucketMatrix.minValue;

    if (this.panel.color.mode !== 'discrete') {
      this.colorScale = this.getColorScale(maxValue, minValue);
    }
    this.setOpacityScale(maxValue);

    // Draw cards from buckets.
    this.heatmap
      .selectAll('.statusmap-cards-row')
      .data(this.bucketMatrixPager.targets())
      .enter()
      .selectAll('.statustmap-card')
      .data((target: string) => this.bucketMatrix.buckets[target])
      .enter()
      .append('rect')
      .attr('cardId', (b: Bucket) => b.id)
      .attr('xid', (b: Bucket) => b.xid)
      .attr('yid', (b: Bucket) => b.yLabel)
      .attr('x', this.getCardX.bind(this))
      .attr('width', this.getCardWidth.bind(this))
      .attr('y', this.getCardY.bind(this))
      .attr('height', this.getCardHeight.bind(this))
      .attr('rx', this.cardRound)
      .attr('ry', this.cardRound)
      .attr('class', (b: Bucket) => (b.isEmpty() ? 'empty-card' : 'bordered statusmap-card'))
      .style('fill', this.getCardColor.bind(this))
      .style('stroke', this.getCardColor.bind(this))
      .style('stroke-width', 0)
      //.style('stroke-width', getCardStrokeWidth)
      //.style('stroke-dasharray', '3,3')
      .style('opacity', this.getCardOpacity.bind(this));

    // Set mouse events on cards.
    let $cards = this.$heatmap.find('.statusmap-card + .bordered');
    $cards
      .on('mouseenter', event => {
        this.tooltip.mouseOverBucket = true;
        this.highlightCard(event);
      })
      .on('mouseleave', event => {
        this.tooltip.mouseOverBucket = false;
        this.resetCardHighLight(event);
      });

    this._renderAnnotations();

    this.ctrl.events.emit(CoreEvents.renderComplete, {
      chartWidth: this.chartWidth,
    });
  }

  highlightCard(event) {
    const color = d3.select(event.target).style('fill');
    const highlightColor = d3.color(color).darker(2);
    const strokeColor = d3.color(color).brighter(4);
    const current_card = d3.select(event.target);
    this.tooltip.originalFillColor = color;
    current_card
      .style('fill', highlightColor.toString())
      .style('stroke', strokeColor.toString())
      .style('stroke-width', 1);
  }

  resetCardHighLight(event) {
    d3.select(event.target)
      .style('fill', this.tooltip.originalFillColor)
      .style('stroke', this.tooltip.originalFillColor)
      .style('stroke-width', 0);
  }

  getColorScale(maxValue, minValue = 0) {
    let colorScheme = _.find(this.ctrl.colorSchemes, { value: this.panel.color.colorScheme });
    // @ts-ignore
    let colorInterpolator = d3ScaleChromatic[colorScheme.value];
    let colorScaleInverted =
      // @ts-ignore
      colorScheme.invert === 'always' || (colorScheme.invert === 'dark' && !contextSrv.user.lightTheme);

    if (maxValue === minValue) {
      maxValue = minValue + 1;
    }

    let start = colorScaleInverted ? maxValue : minValue;
    let end = colorScaleInverted ? minValue : maxValue;

    return d3.scaleSequential(colorInterpolator).domain([start, end]);
  }

  setOpacityScale(maxValue) {
    if (this.panel.color.colorScale === 'linear') {
      this.opacityScale = d3.scaleLinear().domain([0, maxValue]).range([0, 1]);
    } else if (this.panel.color.colorScale === 'sqrt') {
      this.opacityScale = d3.scalePow().exponent(this.panel.color.exponent).domain([0, maxValue]).range([0, 1]);
    }
  }

  getCardX(b: Bucket) {
    let x;
    // cx is the center of the card. Card should be placed to the left.
    //let cx = this.xScale(d.x);
    let rightX = (b.relTo / this.bucketMatrix.rangeMs) * this.chartWidth;
    let cx = rightX - this.cardWidth / 2;

    if (cx - this.cardWidth / 2 < 0) {
      x = this.yAxisWidth + this.cardHSpacing / 2;
    } else {
      x = this.yAxisWidth + cx - this.cardWidth / 2;
    }

    return x;
  }

  // xScale returns card center. Adjust cardWidth in case of overlaping.
  getCardWidth(b: Bucket) {
    //return 20;
    let w;

    let rightX = (b.relTo / this.bucketMatrix.rangeMs) * this.chartWidth;
    let cx = rightX - this.cardWidth / 2;
    //let cx = this.xScale(d.x);

    if (cx < this.cardWidth / 2) {
      // Center should not exceed half of card.
      // Cut card to the left to prevent overlay of y axis.
      let cutted_width = cx - this.cardHSpacing / 2 + this.cardWidth / 2;
      w = cutted_width > 0 ? cutted_width : 0;
    } else if (this.chartWidth - cx < this.cardWidth / 2) {
      // Cut card to the right to prevent overlay of right graph edge.
      w = this.cardWidth / 2 + (this.chartWidth - cx - this.cardHSpacing / 2);
    } else {
      w = this.cardWidth;
    }

    // Card width should be MIN_CARD_SIZE at least
    w = Math.max(w, MIN_CARD_SIZE);

    if (this.cardHSpacing === 0) {
      w = w + 1;
    }

    return w;
  }

  // Top y for card.
  // yScale gives ???
  getCardY(b: Bucket) {
    return this.yScale(b.yLabel) + this.chartTop - this.cardHeight - this.cardVSpacing / 2;
  }

  getCardHeight(b: Bucket) {
    //return 20;
    let ys = this.yScale(b.yLabel);
    let y = ys + this.chartTop - this.cardHeight - this.cardVSpacing / 2;
    let h = this.cardHeight;

    // Cut card height to prevent overlay
    if (y < this.chartTop) {
      h = ys - this.cardVSpacing / 2;
    } else if (ys > this.chartBottom) {
      h = this.chartBottom - y;
    } else if (y + this.cardHeight > this.chartBottom) {
      h = this.chartBottom - y;
    }

    // Height can't be more than chart height
    h = Math.min(h, this.chartHeight);
    // Card height should be MIN_CARD_SIZE at least
    h = Math.max(h, MIN_CARD_SIZE);

    if (this.cardVSpacing === 0) {
      h = h + 1;
    }

    return h;
  }

  getCardColor(bucket: Bucket) {
    if (this.panel.color.mode === 'opacity') {
      return this.panel.color.cardColor;
    } else if (this.panel.color.mode === 'spectrum') {
      if (!bucket.value && this.panel.nullPointMode === 'as zero') {
        // bucket.value === 0 falls here, but it is fine.
        return this.colorScale(0);
      }
      return this.colorScale(bucket.value);
    } else if (this.panel.color.mode === 'discrete') {
      if (this.panel.seriesFilterIndex !== null && this.panel.seriesFilterIndex !== -1) {
        return this.ctrl.discreteExtraSeries.getBucketColorSingle(bucket.values[this.panel.seriesFilterIndex]);
      } else {
        return this.ctrl.discreteExtraSeries.getBucketColor(bucket.values);
      }
    }
  }

  getCardOpacity(bucket: Bucket) {
    if (this.panel.nullPointMode === 'as empty' && bucket.value == null) {
      return 0;
    }
    if (this.panel.color.mode === 'opacity') {
      return this.opacityScale(bucket.value);
    } else {
      return 1;
    }
  }

  getCardStrokeWidth(b: Bucket) {
    if (this.panel.color.mode === 'discrete') {
      return '1';
    }
    return '0';
  }

  /////////////////////////////
  // Selection and crosshair //
  /////////////////////////////

  getEventOffset(event) {
    const elemOffset = this.$heatmap.offset();
    const x = Math.floor(event.clientX - elemOffset.left);
    const y = Math.floor(event.clientY - elemOffset.top);
    return { x, y };
  }

  onMouseDown(event) {
    const offset = this.getEventOffset(event);
    this.selection.active = true;
    this.selection.x1 = offset.x;

    this.mouseUpHandler = () => {
      this.onMouseUp();
    };

    $(document).one('mouseup', this.mouseUpHandler.bind(this));
  }

  onMouseUp() {
    $(document).unbind('mouseup', this.mouseUpHandler.bind(this));
    this.mouseUpHandler = null;
    this.selection.active = false;

    let selectionRange = Math.abs(this.selection.x2 - this.selection.x1);
    if (this.selection.x2 >= 0 && selectionRange > MIN_SELECTION_WIDTH) {
      let timeFrom = this.xScale.invert(
        Math.min(this.selection.x1, this.selection.x2) - this.yAxisWidth - this.xGridSize / 2
      );
      let timeTo = this.xScale.invert(
        Math.max(this.selection.x1, this.selection.x2) - this.yAxisWidth - this.xGridSize / 2
      );

      // TODO use toUtc method from moment wrapper in @grafana/data
      this.ctrl.timeSrv.setTime({
        from: moment.utc(timeFrom),
        to: moment.utc(timeTo),
      });
    }

    this.clearSelection();
  }

  onMouseLeave(e) {
    appEvents.emit(CoreEvents.graphHoverClear);
    this.clearCrosshair();
    this.annotationTooltip.destroy();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.heatmap) {
      return;
    }

    const offset = this.getEventOffset(event);
    if (this.selection.active) {
      // Clear crosshair and tooltip
      this.clearCrosshair();
      this.tooltip.destroy();
      this.annotationTooltip.destroy();

      this.selection.x2 = this.limitSelection(event.offsetX);
      this.drawSelection(this.selection.x1, this.selection.x2);
    } else {
      //const pos = this.getEventPos(event, offset);
      this.emitGraphHoverEvent(event);
      this.drawCrosshair(offset.x);
      this.tooltip.show(event);
      this.annotationTooltip.show(event);
    }
  }

  // TODO emit an event and move logic to panelCtrl
  onMouseClick(e: MouseEvent) {
    if (this.ctrl.panel.tooltip.freezeOnClick) {
      this.tooltip.showFrozen(e);
      this.tooltip.destroy();
    }
  }

  getEventPos(event, offset) {
    const x = this.xScale.invert(offset.x - this.yAxisWidth).valueOf();
    const y = this.yScale.invert(offset.y - this.chartTop);
    const pos = {
      pageX: event.pageX,
      pageY: event.pageY,
      x: x,
      x1: x,
      y: y,
      y1: y,
      panelRelY: null,
      offset,
    };

    return pos;
  }

  emitGraphHoverEvent(event) {
    let x = this.xScale.invert(event.offsetX - this.yAxisWidth - this.xGridSize / 2).valueOf();
    let y = this.yScale(event.offsetY);
    let pos = {
      pageX: event.pageX,
      pageY: event.pageY,
      x: x,
      x1: x,
      y: y,
      y1: y,
      panelRelY: 0,
    };

    // Set minimum offset to prevent showing legend from another panel
    pos.panelRelY = Math.max(event.offsetY / this.height, 0.001);

    // broadcast to other graph panels that we are hovering
    appEvents.emit(CoreEvents.graphHover, { pos: pos, panel: this.panel });
  }

  limitSelection(x2) {
    x2 = Math.max(x2, this.yAxisWidth);
    x2 = Math.min(x2, this.chartWidth + this.yAxisWidth);
    return x2;
  }

  drawSelection(posX1, posX2) {
    if (this.heatmap) {
      this.heatmap.selectAll('.status-heatmap-selection').remove();
      let selectionX = Math.min(posX1, posX2);
      let selectionWidth = Math.abs(posX1 - posX2);

      if (selectionWidth > MIN_SELECTION_WIDTH) {
        this.heatmap
          .append('rect')
          .attr('class', 'status-heatmap-selection')
          .attr('x', selectionX)
          .attr('width', selectionWidth)
          .attr('y', this.chartTop)
          .attr('height', this.chartHeight);
      }
    }
  }

  clearSelection() {
    this.selection.x1 = -1;
    this.selection.x2 = -1;

    if (this.heatmap) {
      this.heatmap.selectAll('.status-heatmap-selection').remove();
    }
  }

  drawCrosshair(position) {
    if (this.heatmap) {
      this.heatmap.selectAll('.status-heatmap-crosshair').remove();

      let posX = position;
      posX = Math.max(posX, this.yAxisWidth);
      posX = Math.min(posX, this.chartWidth + this.yAxisWidth);

      this.heatmap
        .append('g')
        .attr('class', 'status-heatmap-crosshair')
        .attr('transform', 'translate(' + posX + ',0)')
        .append('line')
        .attr('x1', 1)
        .attr('y1', this.chartTop)
        .attr('x2', 1)
        .attr('y2', this.chartBottom)
        .attr('stroke-width', 1);
    }
  }

  // map time to X
  drawSharedCrosshair(pos) {
    if (this.heatmap && this.ctrl.dashboard.graphTooltip !== 0) {
      const posX = this.xScale(pos.x) + this.yAxisWidth;
      this.drawCrosshair(posX);
    }
  }

  clearCrosshair() {
    if (this.heatmap) {
      this.heatmap.selectAll('.status-heatmap-crosshair').remove();
    }
  }

  render() {
    this.panel = this.ctrl.panel;
    this.timeRange = this.ctrl.range;
    this.bucketMatrix = this.ctrl.bucketMatrix;
    this.bucketMatrixPager = this.ctrl.bucketMatrixPager;

    if (!this.bucketMatrix || !this.setElementHeight()) {
      return;
    }

    // Draw default axes and return if no data
    this.addStatusmapCanvas();
    if (this.bucketMatrix.noDatapoints) {
      return;
    }

    this.addStatusmap();
    this.scope.yAxisWidth = this.yAxisWidth;
    this.scope.xAxisHeight = this.xAxisHeight;
    this.scope.chartHeight = this.chartHeight;
    this.scope.chartWidth = this.chartWidth;
    this.scope.chartTop = this.chartTop;
  }

  _renderAnnotations() {
    if (!this.ctrl.annotations || this.ctrl.annotations.length === 0) {
      return;
    }

    if (!this.heatmap) {
      return;
    }

    let annoData = _.map(this.ctrl.annotations, (d, i) => ({
      // @ts-ignore
      x: Math.floor(this.yAxisWidth + this.xScale(d.time)),
      id: i,
      // @ts-ignore
      anno: d.source,
    }));

    //({"ctrl_annotations": this.ctrl.annotations, "annoData": annoData});

    let anno = this.heatmap
      .append('g')
      .attr('class', 'statusmap-annotations')
      .attr('transform', 'translate(0.5,0)')
      .selectAll('.statusmap-annotations')
      .data(annoData)
      .enter()
      .append('g');

    anno
      .append('line')
      //.attr("class", "statusmap-annotation-tick")
      .attr('x1', d => d.x)
      .attr('y1', this.chartTop)
      .attr('x2', d => d.x)
      .attr('y2', this.chartBottom)
      .style('stroke', d => d.anno.iconColor)
      .style('stroke-width', 1)
      .style('stroke-dasharray', '3,3');

    anno
      .append('polygon')
      .attr('points', d =>
        [
          [d.x, this.chartBottom + 1],
          [d.x - 5, this.chartBottom + 6],
          [d.x + 5, this.chartBottom + 6],
        ].join(' ')
      )
      .style('stroke-width', 0)
      .style('fill', d => d.anno.iconColor);

    // Polygons didn't fire mouseevents
    anno
      .append('rect')
      .attr('x', d => d.x - 5)
      .attr('width', 10)
      .attr('y', this.chartBottom + 1)
      .attr('height', 5)
      .attr('class', 'statusmap-annotation-tick')
      .attr('annoId', d => d.id)
      .style('opacity', 0);

    let $ticks = this.$heatmap.find('.statusmap-annotation-tick');
    $ticks
      .on('mouseenter', event => {
        this.annotationTooltip.mouseOverAnnotationTick = true;
      })
      .on('mouseleave', event => {
        this.annotationTooltip.mouseOverAnnotationTick = false;
      });
  }
}

function grafanaTimeFormat(ticks, min, max) {
  if (min && max && ticks) {
    let range = max - min;
    let secPerTick = range / ticks / 1000;
    let oneDay = 86400000;
    let oneYear = 31536000000;

    if (secPerTick <= 45) {
      return '%H:%M:%S';
    }
    if (secPerTick <= 7200 || range <= oneDay) {
      return '%H:%M';
    }
    if (secPerTick <= 80000) {
      return '%m/%d %H:%M';
    }
    if (secPerTick <= 2419200 || range <= oneYear) {
      return '%m/%d';
    }
    return '%Y-%m';
  }

  return '%H:%M';
}

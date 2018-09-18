import angular from 'angular';
import _ from 'lodash';
import $ from 'jquery';
import d3 from 'd3';
import * as d3ScaleChromatic from './libs/d3-scale-chromatic/index';
import {contextSrv} from 'app/core/core';
import {tickStep} from 'app/core/utils/ticks';

let mod = angular.module('grafana.directives');

const MIN_LEGEND_STEPS = 10;

/**
 * Color legend for heatmap editor.
 */
mod.directive('optionsColorLegend', function() {
  return {
    restrict: 'E',
    template: '<div class="status-heatmap-color-legend"><svg width="16.8rem" height="24px"></svg></div>',
    link: function(scope, elem, attrs) {
      let ctrl = scope.ctrl;
      let panel = scope.ctrl.panel;

      render();

      ctrl.events.on('render', function() {
        render();
      });

      function render() {
        let legendElem = $(elem).find('svg');
        let legendWidth = Math.floor(legendElem.outerWidth());

        if (panel.color.mode === 'spectrum') {
          let colorScheme = _.find(ctrl.colorSchemes, {value: panel.color.colorScheme});
          let colorScale = getColorScale(colorScheme, legendWidth);
          drawSimpleColorLegend(elem, colorScale);
        } else if (panel.color.mode === 'opacity') {
          let colorOptions = panel.color;
          drawSimpleOpacityLegend(elem, colorOptions);
        }
      }
    }
  };
});

/**
 * Heatmap legend with scale values.
 */
mod.directive('statusHeatmapLegend', function() {
  return {
    restrict: 'E',
    template: '<div class="status-heatmap-color-legend"><svg width="100px" height="6px"></svg></div>',
    link: function(scope, elem, attrs) {
      let ctrl = scope.ctrl;
      let panel = scope.ctrl.panel;

      render();
      ctrl.events.on('render', function() {
        render();
      });

      function render() {
        clearLegend(elem);
        if (!_.isEmpty(ctrl.cardsData) && !_.isEmpty(ctrl.cardsData.cards)) {
          let rangeFrom = ctrl.cardsData.minValue;
          let rangeTo = ctrl.cardsData.maxValue;
          let maxValue = panel.color.max || rangeTo;
          let minValue = panel.color.min || rangeFrom;

          if (panel.color.mode === 'spectrum') {
            let colorScheme = _.find(ctrl.colorSchemes, {value: panel.color.colorScheme});
            drawColorLegend(elem, colorScheme, rangeFrom, rangeTo, maxValue, minValue);
          } else if (panel.color.mode === 'opacity') {
            let colorOptions = panel.color;
            drawOpacityLegend(elem, colorOptions, rangeFrom, rangeTo, maxValue, minValue);
          } else if (panel.color.mode === 'discrete') {
            let colorOptions = panel.color;
            drawDiscreteColorLegend(elem, colorOptions, ctrl.discreteHelper);
          }
        }
      }
    }
  };
});

function drawColorLegend(elem, colorScheme, rangeFrom, rangeTo, maxValue, minValue) {
  let legendElem = $(elem).find('svg');
  let legend = d3.select(legendElem.get(0));
  clearLegend(elem);

  let legendWidth = Math.floor(legendElem.outerWidth()) - 30;
  let legendHeight = legendElem.attr("height");

  let rangeStep = 1;
  if (rangeTo - rangeFrom > legendWidth) {
    rangeStep = Math.floor((rangeTo - rangeFrom) / legendWidth);
  }

  if (rangeStep * MIN_LEGEND_STEPS > rangeTo) {
    rangeStep = rangeTo / MIN_LEGEND_STEPS;
  }

  let widthFactor = legendWidth / (rangeTo - rangeFrom);
  let valuesRange = d3.range(rangeFrom, rangeTo, rangeStep);

  let colorScale = getColorScale(colorScheme, maxValue, minValue);
  legend.selectAll(".status-heatmap-color-legend-rect")
    .data(valuesRange)
    .enter().append("rect")
    .attr("x", d => d * widthFactor)
    .attr("y", 0)
    .attr("width", rangeStep * widthFactor + 1) // Overlap rectangles to prevent gaps
    .attr("height", legendHeight)
    .attr("stroke-width", 0)
    .attr("fill", d => colorScale(d));

  drawLegendValues(elem, colorScale, rangeFrom, rangeTo, maxValue, minValue, legendWidth);
}

function drawOpacityLegend(elem, options, rangeFrom, rangeTo, maxValue, minValue) {
  let legendElem = $(elem).find('svg');
  let legend = d3.select(legendElem.get(0));
  clearLegend(elem);

  let legendWidth = Math.floor(legendElem.outerWidth()) - 30;
  let legendHeight = legendElem.attr("height");

  let rangeStep = 10;
  let widthFactor = legendWidth / (rangeTo - rangeFrom);

  if (rangeStep * MIN_LEGEND_STEPS > rangeTo) {
    rangeStep = rangeTo / MIN_LEGEND_STEPS;
  }

  let valuesRange = d3.range(rangeFrom, rangeTo, rangeStep);

  let opacityScale = getOpacityScale(options, maxValue, minValue);
  legend.selectAll(".status-heatmap-opacity-legend-rect")
    .data(valuesRange)
    .enter().append("rect")
    .attr("x", d => d * widthFactor)
    .attr("y", 0)
    .attr("width", rangeStep * widthFactor)
    .attr("height", legendHeight)
    .attr("stroke-width", 0)
    .attr("fill", options.cardColor)
    .style("opacity", d => opacityScale(d));

  drawLegendValues(elem, opacityScale, rangeFrom, rangeTo, maxValue, minValue, legendWidth);
}

function drawDiscreteColorLegend(elem, colorOptions, discreteHelper) {
  let legendElem = $(elem).find('svg');
  let legend = d3.select(legendElem.get(0));
  clearLegend(elem);

  let thresholds = colorOptions.thresholds;
  let tooltips = _.map(thresholds, tr => tr.tooltip);
  let valuesNumber = thresholds.length;

  // graph width as a fallback
  let $heatmap = $(elem).parent().parent().parent().find('.status-heatmap-panel');
  let graphWidth  = $heatmap.find('svg').attr("width");

  // calculate max width of tooltip and use it as width for each item
  let textWidth = [];
  legend.selectAll(".hidden-texts")
    .data(tooltips)
    .enter().append("text")
    .attr("class", "axis tick")
    .attr("font-family", "sans-serif")
    .text(d => d)
    .each(function(d,i) {
      let thisWidth = this.getBBox().width;
      textWidth.push(thisWidth);
      this.remove(); // remove them just after displaying them
    });

  let legendWidth = Math.floor(_.min([
    graphWidth - 30,
    (_.max(textWidth) + 3) * valuesNumber,
  ]));
  legendElem.attr("width", legendWidth);

  let legendHeight = legendElem.attr("height");

  let itemWidth  = Math.floor(legendWidth / valuesNumber);
  let valuesRange = d3.range(valuesNumber); // from 0 to valuesNumber-1

  legend.selectAll(".status-heatmap-color-legend-rect")
    .data(valuesRange)
    .enter().append("rect")
    .attr("x", d => d*itemWidth)
    .attr("y", 0)
    .attr("width", itemWidth + 1) // Overlap rectangles to prevent gaps
    .attr("height", legendHeight)
    .attr("stroke-width", 0)
    .attr("fill", d => discreteHelper.getDiscreteColor(d));

  drawDiscreteLegendValues(elem, colorOptions, legendWidth);
}


function drawLegendValues(elem, colorScale, rangeFrom, rangeTo, maxValue, minValue, legendWidth) {
  let legendElem = $(elem).find('svg');
  let legend = d3.select(legendElem.get(0));

  if (legendWidth <= 0 || legendElem.get(0).childNodes.length === 0) {
    return;
  }

  let legendValueScale = d3.scaleLinear()
    .domain([0, rangeTo])
    .range([0, legendWidth]);

  let ticks = buildLegendTicks(0, rangeTo, maxValue, minValue);
  let xAxis = d3.axisBottom(legendValueScale)
    .tickValues(ticks)
    .tickSize(2);

  let colorRect = legendElem.find(":first-child");
  let posY = getSvgElemHeight(legendElem) + 2;
  let posX = getSvgElemX(colorRect);

  d3.select(legendElem.get(0)).append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + posX + "," + posY + ")")
    .call(xAxis);

  legend.select(".axis").select(".domain").remove();
}

function drawDiscreteLegendValues(elem, colorOptions, legendWidth) {
  let thresholds = colorOptions.thresholds;

  let legendElem = $(elem).find('svg');
  let legend = d3.select(legendElem.get(0));

  if (legendWidth <= 0 || legendElem.get(0).childNodes.length === 0) {
    return;
  }

  let valuesNumber = thresholds.length;
  let rangeStep  = Math.floor(legendWidth / valuesNumber);
  let valuesRange = d3.range(0, legendWidth, rangeStep);


  let legendValueScale = d3.scaleLinear()
    .domain([0, valuesNumber])
    .range([0, legendWidth]);

  let thresholdValues = [];
  let thresholdTooltips = [];
  for (let i = 0; i < thresholds.length; i++) {
    thresholdValues.push(thresholds[i].value);
    thresholdTooltips.push(thresholds[i].tooltip);
  }

  let xAxis = d3.axisBottom(legendValueScale)
    .tickValues(d3.range(0, valuesNumber, 1)) //thresholdValues)
    .tickSize(2)
    .tickFormat((t) => {
      let i = Math.floor(t);
      let v = thresholdTooltips[i];
      if (v != undefined) {
        return ""+v;
      } else {
        v = thresholdValues[i];
        if (v != undefined) {
          return ""+v;
        } else {
          return "n/a";
        }
      }
    });

  let colorRect = legendElem.find(":first-child");
  let posY = getSvgElemHeight(legendElem) + 2;
  let posX = getSvgElemX(colorRect) + Math.floor(rangeStep/2);

  d3.select(legendElem.get(0)).append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + posX + "," + posY + ")")
    .call(xAxis);

  legend.select(".axis").select(".domain").remove();
}

function drawSimpleColorLegend(elem, colorScale) {
  let legendElem = $(elem).find('svg');
  clearLegend(elem);

  let legendWidth = Math.floor(legendElem.outerWidth());
  let legendHeight = legendElem.attr("height");

  if (legendWidth) {
    let valuesNumber = Math.floor(legendWidth / 2);
    let rangeStep  = Math.floor(legendWidth / valuesNumber);
    let valuesRange = d3.range(0, legendWidth, rangeStep);

    let legend = d3.select(legendElem.get(0));
    var legendRects = legend.selectAll(".status-heatmap-color-legend-rect").data(valuesRange);

    legendRects.enter().append("rect")
      .attr("x", d => d)
      .attr("y", 0)
      .attr("width", rangeStep + 1) // Overlap rectangles to prevent gaps
      .attr("height", legendHeight)
      .attr("stroke-width", 0)
      .attr("fill", d => colorScale(d));
  }
}

function drawSimpleOpacityLegend(elem, options) {
  let legendElem = $(elem).find('svg');
  let graphElem = $(elem);
  clearLegend(elem);

  let legend = d3.select(legendElem.get(0));
  let legendWidth = Math.floor(legendElem.outerWidth());
  let legendHeight = legendElem.attr("height");

  if (legendWidth) {
    let legendOpacityScale;
    if (options.colorScale === 'linear') {
      legendOpacityScale = d3.scaleLinear()
      .domain([0, legendWidth])
      .range([0, 1]);
    } else if (options.colorScale === 'sqrt') {
      legendOpacityScale = d3.scalePow().exponent(options.exponent)
      .domain([0, legendWidth])
      .range([0, 1]);
    }

    let rangeStep = 10;
    let valuesRange = d3.range(0, legendWidth, rangeStep);
    var legendRects = legend.selectAll(".status-heatmap-opacity-legend-rect").data(valuesRange);

    legendRects.enter().append("rect")
      .attr("x", d => d)
      .attr("y", 0)
      .attr("width", rangeStep)
      .attr("height", legendHeight)
      .attr("stroke-width", 0)
      .attr("fill", options.cardColor)
      .style("opacity", d => legendOpacityScale(d));
  }
}


function clearLegend(elem) {
  let legendElem = $(elem).find('svg');
  legendElem.empty();
}

function getColorScale(colorScheme, maxValue, minValue = 0) {
  let colorInterpolator = d3ScaleChromatic[colorScheme.value];
  let colorScaleInverted = colorScheme.invert === 'always' ||
    (colorScheme.invert === 'dark' && !contextSrv.user.lightTheme);

  let start = colorScaleInverted ? maxValue : minValue;
  let end = colorScaleInverted ? minValue : maxValue;

  return d3.scaleSequential(colorInterpolator).domain([start, end]);
}

function getOpacityScale(options, maxValue, minValue = 0) {
  let legendOpacityScale;
  if (options.colorScale === 'linear') {
    legendOpacityScale = d3.scaleLinear()
    .domain([minValue, maxValue])
    .range([0, 1]);
  } else if (options.colorScale === 'sqrt') {
    legendOpacityScale = d3.scalePow().exponent(options.exponent)
    .domain([minValue, maxValue])
    .range([0, 1]);
  }
  return legendOpacityScale;
}

function getSvgElemX(elem) {
  let svgElem = elem.get(0);
  if (svgElem && svgElem.x && svgElem.x.baseVal) {
    return svgElem.x.baseVal.value;
  } else {
    return 0;
  }
}

function getSvgElemHeight(elem) {
  let svgElem = elem.get(0);
  if (svgElem && svgElem.height && svgElem.height.baseVal) {
    return svgElem.height.baseVal.value;
  } else {
    return 0;
  }
}

function buildLegendTicks(rangeFrom, rangeTo, maxValue, minValue) {
  let range = rangeTo - rangeFrom;
  let tickStepSize = tickStep(rangeFrom, rangeTo, 3);
  let ticksNum = Math.round(range / tickStepSize);
  let ticks = [];

  for (let i = 0; i < ticksNum; i++) {
    let current = tickStepSize * i;
    // Add user-defined min and max if it had been set
    if (isValueCloseTo(minValue, current, tickStepSize)) {
      ticks.push(minValue);
      continue;
    } else if (minValue < current) {
      ticks.push(minValue);
    }
    if (isValueCloseTo(maxValue, current, tickStepSize)) {
      ticks.push(maxValue);
      continue;
    } else if (maxValue < current) {
      ticks.push(maxValue);
    }
    ticks.push(tickStepSize * i);
  }
  if (!isValueCloseTo(maxValue, rangeTo, tickStepSize)) {
    ticks.push(maxValue);
  }
  ticks.push(rangeTo);
  ticks = _.sortBy(_.uniq(ticks));
  return ticks;
}

function isValueCloseTo(val, valueTo, step) {
  let diff = Math.abs(val - valueTo);
  return diff < step * 0.3;
}

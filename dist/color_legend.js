'use strict';

System.register(['angular', 'lodash', 'jquery', 'd3', './libs/d3-scale-chromatic/index', 'app/core/core', 'app/core/utils/ticks'], function (_export, _context) {
  "use strict";

  var angular, _, $, d3, d3ScaleChromatic, contextSrv, tickStep, mod, MIN_LEGEND_STEPS;

  function drawColorLegend(elem, colorScheme, rangeFrom, rangeTo, maxValue, minValue) {
    var legendElem = $(elem).find('svg');
    var legend = d3.select(legendElem.get(0));
    clearLegend(elem);

    var legendWidth = Math.floor(legendElem.outerWidth()) - 30;
    var legendHeight = legendElem.attr("height");

    var rangeStep = 1;
    if (rangeTo - rangeFrom > legendWidth) {
      rangeStep = Math.floor((rangeTo - rangeFrom) / legendWidth);
    }

    if (rangeStep * MIN_LEGEND_STEPS > rangeTo) {
      rangeStep = rangeTo / MIN_LEGEND_STEPS;
    }

    var widthFactor = legendWidth / (rangeTo - rangeFrom);
    var valuesRange = d3.range(rangeFrom, rangeTo, rangeStep);

    var colorScale = getColorScale(colorScheme, maxValue, minValue);
    legend.selectAll(".status-heatmap-color-legend-rect").data(valuesRange).enter().append("rect").attr("x", function (d) {
      return d * widthFactor;
    }).attr("y", 0).attr("width", rangeStep * widthFactor + 1) // Overlap rectangles to prevent gaps
    .attr("height", legendHeight).attr("stroke-width", 0).attr("fill", function (d) {
      return colorScale(d);
    });

    drawLegendValues(elem, colorScale, rangeFrom, rangeTo, maxValue, minValue, legendWidth);
  }

  function drawOpacityLegend(elem, options, rangeFrom, rangeTo, maxValue, minValue) {
    var legendElem = $(elem).find('svg');
    var legend = d3.select(legendElem.get(0));
    clearLegend(elem);

    var legendWidth = Math.floor(legendElem.outerWidth()) - 30;
    var legendHeight = legendElem.attr("height");

    var rangeStep = 10;
    var widthFactor = legendWidth / (rangeTo - rangeFrom);

    if (rangeStep * MIN_LEGEND_STEPS > rangeTo) {
      rangeStep = rangeTo / MIN_LEGEND_STEPS;
    }

    var valuesRange = d3.range(rangeFrom, rangeTo, rangeStep);

    var opacityScale = getOpacityScale(options, maxValue, minValue);
    legend.selectAll(".status-heatmap-opacity-legend-rect").data(valuesRange).enter().append("rect").attr("x", function (d) {
      return d * widthFactor;
    }).attr("y", 0).attr("width", rangeStep * widthFactor).attr("height", legendHeight).attr("stroke-width", 0).attr("fill", options.cardColor).style("opacity", function (d) {
      return opacityScale(d);
    });

    drawLegendValues(elem, opacityScale, rangeFrom, rangeTo, maxValue, minValue, legendWidth);
  }

  function drawDiscreteColorLegend(elem, colorOptions, discreteHelper) {
    var legendElem = $(elem).find('svg');
    var legend = d3.select(legendElem.get(0));
    clearLegend(elem);

    var thresholds = colorOptions.thresholds;
    var tooltips = _.map(thresholds, function (tr) {
      return tr.tooltip;
    });
    var valuesNumber = thresholds.length;

    // graph width as a fallback
    var $heatmap = $(elem).parent().parent().parent().find('.status-heatmap-panel');
    var graphWidth = $heatmap.find('svg').attr("width");

    // calculate max width of tooltip and use it as width for each item
    var textWidth = [];
    legend.selectAll(".hidden-texts").data(tooltips).enter().append("text").attr("class", "axis tick").attr("font-family", "sans-serif").text(function (d) {
      return d;
    }).each(function (d, i) {
      var thisWidth = this.getBBox().width;
      textWidth.push(thisWidth);
      this.remove(); // remove them just after displaying them
    });

    var legendWidth = Math.floor(_.min([graphWidth - 30, (_.max(textWidth) + 3) * valuesNumber]));
    legendElem.attr("width", legendWidth);

    var legendHeight = legendElem.attr("height");

    var itemWidth = Math.floor(legendWidth / valuesNumber);
    var valuesRange = d3.range(valuesNumber); // from 0 to valuesNumber-1

    legend.selectAll(".status-heatmap-color-legend-rect").data(valuesRange).enter().append("rect").attr("x", function (d) {
      return d * itemWidth;
    }).attr("y", 0).attr("width", itemWidth + 1) // Overlap rectangles to prevent gaps
    .attr("height", legendHeight).attr("stroke-width", 0).attr("fill", function (d) {
      return discreteHelper.getDiscreteColor(d);
    });

    drawDiscreteLegendValues(elem, colorOptions, legendWidth);
  }

  function drawLegendValues(elem, colorScale, rangeFrom, rangeTo, maxValue, minValue, legendWidth) {
    var legendElem = $(elem).find('svg');
    var legend = d3.select(legendElem.get(0));

    if (legendWidth <= 0 || legendElem.get(0).childNodes.length === 0) {
      return;
    }

    var legendValueScale = d3.scaleLinear().domain([0, rangeTo]).range([0, legendWidth]);

    var ticks = buildLegendTicks(0, rangeTo, maxValue, minValue);
    var xAxis = d3.axisBottom(legendValueScale).tickValues(ticks).tickSize(2);

    var colorRect = legendElem.find(":first-child");
    var posY = getSvgElemHeight(legendElem) + 2;
    var posX = getSvgElemX(colorRect);

    d3.select(legendElem.get(0)).append("g").attr("class", "axis").attr("transform", "translate(" + posX + "," + posY + ")").call(xAxis);

    legend.select(".axis").select(".domain").remove();
  }

  function drawDiscreteLegendValues(elem, colorOptions, legendWidth) {
    var thresholds = colorOptions.thresholds;

    var legendElem = $(elem).find('svg');
    var legend = d3.select(legendElem.get(0));

    if (legendWidth <= 0 || legendElem.get(0).childNodes.length === 0) {
      return;
    }

    var valuesNumber = thresholds.length;
    var rangeStep = Math.floor(legendWidth / valuesNumber);
    var valuesRange = d3.range(0, legendWidth, rangeStep);

    var legendValueScale = d3.scaleLinear().domain([0, valuesNumber]).range([0, legendWidth]);

    var thresholdValues = [];
    var thresholdTooltips = [];
    for (var i = 0; i < thresholds.length; i++) {
      thresholdValues.push(thresholds[i].value);
      thresholdTooltips.push(thresholds[i].tooltip);
    }

    var xAxis = d3.axisBottom(legendValueScale).tickValues(d3.range(0, valuesNumber, 1)) //thresholdValues)
    .tickSize(2).tickFormat(function (t) {
      var i = Math.floor(t);
      var v = thresholdTooltips[i];
      if (v != undefined) {
        return "" + v;
      } else {
        v = thresholdValues[i];
        if (v != undefined) {
          return "" + v;
        } else {
          return "n/a";
        }
      }
    });

    var colorRect = legendElem.find(":first-child");
    var posY = getSvgElemHeight(legendElem) + 2;
    var posX = getSvgElemX(colorRect) + Math.floor(rangeStep / 2);

    d3.select(legendElem.get(0)).append("g").attr("class", "axis").attr("transform", "translate(" + posX + "," + posY + ")").call(xAxis);

    legend.select(".axis").select(".domain").remove();
  }

  function drawSimpleColorLegend(elem, colorScale) {
    var legendElem = $(elem).find('svg');
    clearLegend(elem);

    var legendWidth = Math.floor(legendElem.outerWidth());
    var legendHeight = legendElem.attr("height");

    if (legendWidth) {
      var valuesNumber = Math.floor(legendWidth / 2);
      var rangeStep = Math.floor(legendWidth / valuesNumber);
      var valuesRange = d3.range(0, legendWidth, rangeStep);

      var legend = d3.select(legendElem.get(0));
      var legendRects = legend.selectAll(".status-heatmap-color-legend-rect").data(valuesRange);

      legendRects.enter().append("rect").attr("x", function (d) {
        return d;
      }).attr("y", 0).attr("width", rangeStep + 1) // Overlap rectangles to prevent gaps
      .attr("height", legendHeight).attr("stroke-width", 0).attr("fill", function (d) {
        return colorScale(d);
      });
    }
  }

  function drawSimpleOpacityLegend(elem, options) {
    var legendElem = $(elem).find('svg');
    var graphElem = $(elem);
    clearLegend(elem);

    var legend = d3.select(legendElem.get(0));
    var legendWidth = Math.floor(legendElem.outerWidth());
    var legendHeight = legendElem.attr("height");

    if (legendWidth) {
      var legendOpacityScale = void 0;
      if (options.colorScale === 'linear') {
        legendOpacityScale = d3.scaleLinear().domain([0, legendWidth]).range([0, 1]);
      } else if (options.colorScale === 'sqrt') {
        legendOpacityScale = d3.scalePow().exponent(options.exponent).domain([0, legendWidth]).range([0, 1]);
      }

      var rangeStep = 10;
      var valuesRange = d3.range(0, legendWidth, rangeStep);
      var legendRects = legend.selectAll(".status-heatmap-opacity-legend-rect").data(valuesRange);

      legendRects.enter().append("rect").attr("x", function (d) {
        return d;
      }).attr("y", 0).attr("width", rangeStep).attr("height", legendHeight).attr("stroke-width", 0).attr("fill", options.cardColor).style("opacity", function (d) {
        return legendOpacityScale(d);
      });
    }
  }

  function clearLegend(elem) {
    var legendElem = $(elem).find('svg');
    legendElem.empty();
  }

  function getColorScale(colorScheme, maxValue) {
    var minValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var colorInterpolator = d3ScaleChromatic[colorScheme.value];
    var colorScaleInverted = colorScheme.invert === 'always' || colorScheme.invert === 'dark' && !contextSrv.user.lightTheme;

    var start = colorScaleInverted ? maxValue : minValue;
    var end = colorScaleInverted ? minValue : maxValue;

    return d3.scaleSequential(colorInterpolator).domain([start, end]);
  }

  function getOpacityScale(options, maxValue) {
    var minValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var legendOpacityScale = void 0;
    if (options.colorScale === 'linear') {
      legendOpacityScale = d3.scaleLinear().domain([minValue, maxValue]).range([0, 1]);
    } else if (options.colorScale === 'sqrt') {
      legendOpacityScale = d3.scalePow().exponent(options.exponent).domain([minValue, maxValue]).range([0, 1]);
    }
    return legendOpacityScale;
  }

  function getSvgElemX(elem) {
    var svgElem = elem.get(0);
    if (svgElem && svgElem.x && svgElem.x.baseVal) {
      return svgElem.x.baseVal.value;
    } else {
      return 0;
    }
  }

  function getSvgElemHeight(elem) {
    var svgElem = elem.get(0);
    if (svgElem && svgElem.height && svgElem.height.baseVal) {
      return svgElem.height.baseVal.value;
    } else {
      return 0;
    }
  }

  function buildLegendTicks(rangeFrom, rangeTo, maxValue, minValue) {
    var range = rangeTo - rangeFrom;
    var tickStepSize = tickStep(rangeFrom, rangeTo, 3);
    var ticksNum = Math.round(range / tickStepSize);
    var ticks = [];

    for (var i = 0; i < ticksNum; i++) {
      var current = tickStepSize * i;
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
    var diff = Math.abs(val - valueTo);
    return diff < step * 0.3;
  }
  return {
    setters: [function (_angular) {
      angular = _angular.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_d) {
      d3 = _d.default;
    }, function (_libsD3ScaleChromaticIndex) {
      d3ScaleChromatic = _libsD3ScaleChromaticIndex;
    }, function (_appCoreCore) {
      contextSrv = _appCoreCore.contextSrv;
    }, function (_appCoreUtilsTicks) {
      tickStep = _appCoreUtilsTicks.tickStep;
    }],
    execute: function () {
      mod = angular.module('grafana.directives');
      MIN_LEGEND_STEPS = 10;


      /**
       * Color legend for heatmap editor.
       */
      mod.directive('optionsColorLegend', function () {
        return {
          restrict: 'E',
          template: '<div class="status-heatmap-color-legend"><svg width="16.8rem" height="24px"></svg></div>',
          link: function link(scope, elem, attrs) {
            var ctrl = scope.ctrl;
            var panel = scope.ctrl.panel;

            render();

            ctrl.events.on('render', function () {
              render();
            });

            function render() {
              var legendElem = $(elem).find('svg');
              var legendWidth = Math.floor(legendElem.outerWidth());

              if (panel.color.mode === 'spectrum') {
                var colorScheme = _.find(ctrl.colorSchemes, { value: panel.color.colorScheme });
                var colorScale = getColorScale(colorScheme, legendWidth);
                drawSimpleColorLegend(elem, colorScale);
              } else if (panel.color.mode === 'opacity') {
                var colorOptions = panel.color;
                drawSimpleOpacityLegend(elem, colorOptions);
              }
            }
          }
        };
      });

      /**
       * Heatmap legend with scale values.
       */
      mod.directive('statusHeatmapLegend', function () {
        return {
          restrict: 'E',
          template: '<div class="status-heatmap-color-legend"><svg width="100px" height="6px"></svg></div>',
          link: function link(scope, elem, attrs) {
            var ctrl = scope.ctrl;
            var panel = scope.ctrl.panel;

            render();
            ctrl.events.on('render', function () {
              render();
            });

            function render() {
              clearLegend(elem);
              if (!_.isEmpty(ctrl.cardsData) && !_.isEmpty(ctrl.cardsData.cards)) {
                var rangeFrom = ctrl.cardsData.minValue;
                var rangeTo = ctrl.cardsData.maxValue;
                var maxValue = panel.color.max || rangeTo;
                var minValue = panel.color.min || rangeFrom;

                if (panel.color.mode === 'spectrum') {
                  var colorScheme = _.find(ctrl.colorSchemes, { value: panel.color.colorScheme });
                  drawColorLegend(elem, colorScheme, rangeFrom, rangeTo, maxValue, minValue);
                } else if (panel.color.mode === 'opacity') {
                  var colorOptions = panel.color;
                  drawOpacityLegend(elem, colorOptions, rangeFrom, rangeTo, maxValue, minValue);
                } else if (panel.color.mode === 'discrete') {
                  var _colorOptions = panel.color;
                  drawDiscreteColorLegend(elem, _colorOptions, ctrl.discreteHelper);
                }
              }
            }
          }
        };
      });
    }
  };
});
//# sourceMappingURL=color_legend.js.map

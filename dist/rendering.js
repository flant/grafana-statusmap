"use strict";

System.register(["lodash", "jquery", "moment", "app/core/utils/kbn", "app/core/core", "d3", "./libs/d3-scale-chromatic/index", "./tooltip", "./annotations", "./module", "./libs/grafana/events/index"], function (_export, _context) {
  "use strict";

  var _, $, moment, kbn, appEvents, contextSrv, d3, d3ScaleChromatic, StatusmapTooltip, AnnotationTooltip, renderComplete, CoreEvents, PanelEvents, MIN_CARD_SIZE, CARD_H_SPACING, CARD_V_SPACING, CARD_ROUND, DATA_RANGE_WIDING_FACTOR, DEFAULT_X_TICK_SIZE_PX, DEFAULT_Y_TICK_SIZE_PX, X_AXIS_TICK_PADDING, Y_AXIS_TICK_PADDING, MIN_SELECTION_WIDTH, Statusmap, StatusmapRenderer;

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function rendering(scope, elem, attrs, ctrl) {
    return new StatusmapRenderer(scope, elem, attrs, ctrl);
  }

  function grafanaTimeFormat(ticks, min, max) {
    if (min && max && ticks) {
      var range = max - min;
      var secPerTick = range / ticks / 1000;
      var oneDay = 86400000;
      var oneYear = 31536000000;

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

  _export("default", rendering);

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_moment) {
      moment = _moment.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_appCoreCore) {
      appEvents = _appCoreCore.appEvents;
      contextSrv = _appCoreCore.contextSrv;
    }, function (_d) {
      d3 = _d;
    }, function (_libsD3ScaleChromaticIndex) {
      d3ScaleChromatic = _libsD3ScaleChromaticIndex;
    }, function (_tooltip) {
      StatusmapTooltip = _tooltip.StatusmapTooltip;
    }, function (_annotations) {
      AnnotationTooltip = _annotations.AnnotationTooltip;
    }, function (_module) {
      renderComplete = _module.renderComplete;
    }, function (_libsGrafanaEventsIndex) {
      CoreEvents = _libsGrafanaEventsIndex.CoreEvents;
      PanelEvents = _libsGrafanaEventsIndex.PanelEvents;
    }],
    execute: function () {
      MIN_CARD_SIZE = 5;
      CARD_H_SPACING = 2;
      CARD_V_SPACING = 2;
      CARD_ROUND = 0;
      DATA_RANGE_WIDING_FACTOR = 1.2;
      DEFAULT_X_TICK_SIZE_PX = 100;
      DEFAULT_Y_TICK_SIZE_PX = 50;
      X_AXIS_TICK_PADDING = 10;
      Y_AXIS_TICK_PADDING = 5;
      MIN_SELECTION_WIDTH = 2;

      Statusmap = function Statusmap() {
        _classCallCheck(this, Statusmap);

        _defineProperty(this, "$svg", void 0);

        _defineProperty(this, "svg", void 0);

        _defineProperty(this, "bucketMatrix", void 0);

        _defineProperty(this, "timeRange", {
          from: 0,
          to: 0
        });
      };

      _export("StatusmapRenderer", StatusmapRenderer =
      /*#__PURE__*/
      function () {
        function StatusmapRenderer(scope, elem, attrs, ctrl) {
          _classCallCheck(this, StatusmapRenderer);

          this.scope = scope;
          this.elem = elem;
          this.ctrl = ctrl;

          _defineProperty(this, "width", 0);

          _defineProperty(this, "height", 0);

          _defineProperty(this, "yScale", void 0);

          _defineProperty(this, "xScale", void 0);

          _defineProperty(this, "chartWidth", 0);

          _defineProperty(this, "chartHeight", 0);

          _defineProperty(this, "chartTop", 0);

          _defineProperty(this, "chartBottom", 0);

          _defineProperty(this, "yAxisWidth", 0);

          _defineProperty(this, "xAxisHeight", 0);

          _defineProperty(this, "cardVSpacing", 0);

          _defineProperty(this, "cardHSpacing", 0);

          _defineProperty(this, "cardRound", 0);

          _defineProperty(this, "cardWidth", 0);

          _defineProperty(this, "cardHeight", 0);

          _defineProperty(this, "colorScale", void 0);

          _defineProperty(this, "opacityScale", void 0);

          _defineProperty(this, "mouseUpHandler", void 0);

          _defineProperty(this, "xGridSize", 0);

          _defineProperty(this, "yGridSize", 0);

          _defineProperty(this, "bucketMatrix", void 0);

          _defineProperty(this, "bucketMatrixPager", void 0);

          _defineProperty(this, "panel", void 0);

          _defineProperty(this, "$heatmap", void 0);

          _defineProperty(this, "tooltip", void 0);

          _defineProperty(this, "annotationTooltip", void 0);

          _defineProperty(this, "heatmap", void 0);

          _defineProperty(this, "timeRange", void 0);

          _defineProperty(this, "yOffset", void 0);

          _defineProperty(this, "selection", void 0);

          _defineProperty(this, "padding", void 0);

          _defineProperty(this, "margin", void 0);

          _defineProperty(this, "dataRangeWidingFactor", DATA_RANGE_WIDING_FACTOR);

          // $heatmap is JQuery object, but heatmap is D3
          this.$heatmap = this.elem.find('.statusmap-panel');
          this.tooltip = new StatusmapTooltip(this.$heatmap, this.scope);
          this.annotationTooltip = new AnnotationTooltip(this.$heatmap, this.scope);
          this.yOffset = 0;
          this.selection = {
            active: false,
            x1: -1,
            x2: -1
          };
          this.padding = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          };
          this.margin = {
            left: 25,
            right: 15,
            top: 10,
            bottom: 20
          };
          this.ctrl.events.on(PanelEvents.render, this.onRender.bind(this));
          this.ctrl.tickValueFormatter = this.tickValueFormatter.bind(this); /////////////////////////////
          // Selection and crosshair //
          /////////////////////////////
          // Shared crosshair and tooltip    this.empty = true;

          appEvents.on(CoreEvents.graphHover, this.onGraphHover.bind(this), this.scope);
          appEvents.on(CoreEvents.graphHoverClear, this.onGraphHoverClear.bind(this), this.scope); // Register selection listeners

          this.$heatmap.on('mousedown', this.onMouseDown.bind(this));
          this.$heatmap.on('mousemove', this.onMouseMove.bind(this));
          this.$heatmap.on('mouseleave', this.onMouseLeave.bind(this));
          this.$heatmap.on('click', this.onMouseClick.bind(this));
        }

        _createClass(StatusmapRenderer, [{
          key: "onGraphHoverClear",
          value: function onGraphHoverClear() {
            this.clearCrosshair();
          }
        }, {
          key: "onGraphHover",
          value: function onGraphHover(event) {
            this.drawSharedCrosshair(event.pos);
          }
        }, {
          key: "onRender",
          value: function onRender() {
            this.render();
            this.ctrl.renderingCompleted();
          }
        }, {
          key: "setElementHeight",
          value: function setElementHeight() {
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
        }, {
          key: "getYAxisWidth",
          value: function getYAxisWidth(elem) {
            var axisText = elem.selectAll(".axis-y text").nodes();

            var maxTextWidth = _.max(_.map(axisText, function (text) {
              // Use SVG getBBox method
              return text.getBBox().width;
            }));

            return Math.ceil(maxTextWidth);
          }
        }, {
          key: "getXAxisHeight",
          value: function getXAxisHeight(elem) {
            var axisLine = elem.select(".axis-x line");

            if (!axisLine.empty()) {
              var axisLinePosition = parseFloat(elem.select(".axis-x line").attr("y2"));
              var canvasWidth = parseFloat(elem.attr("height"));
              return canvasWidth - axisLinePosition;
            } else {
              // Default height
              return 30;
            }
          }
        }, {
          key: "addXAxis",
          value: function addXAxis() {
            // Scale timestamps to cards centers
            //this.scope.xScale = this.xScale = d3.scaleTime()
            //    .domain([this.timeRange.from, this.timeRange.to])
            //    .range([this.xGridSize/2, this.chartWidth-this.xGridSize/2]);
            // Buckets without the most recent
            this.scope.xScale = this.xScale = d3.scaleTime().domain([this.timeRange.from, this.timeRange.to]).range([this.xGridSize / 2, this.chartWidth - this.xGridSize / 2]);
            var ticks = this.chartWidth / DEFAULT_X_TICK_SIZE_PX;
            var grafanaTimeFormatter = grafanaTimeFormat(ticks, this.timeRange.from, this.timeRange.to);
            var timeFormat;
            var dashboardTimeZone = this.ctrl.dashboard.getTimezone();

            if (dashboardTimeZone === 'utc') {
              timeFormat = d3.utcFormat(grafanaTimeFormatter);
            } else {
              timeFormat = d3.timeFormat(grafanaTimeFormatter);
            }

            var xAxis = d3.axisBottom(this.xScale).ticks(ticks).tickFormat(timeFormat).tickPadding(X_AXIS_TICK_PADDING).tickSize(this.chartHeight);
            var posY = this.chartTop; // this.margin.top !

            var posX = this.yAxisWidth;
            this.heatmap.append("g").attr("class", "axis axis-x").attr("transform", "translate(" + posX + "," + posY + ")").call(xAxis); // Remove horizontal line in the top of axis labels (called domain in d3)

            this.heatmap.select(".axis-x").select(".domain").remove();
          } // divide chart height by ticks for cards drawing

        }, {
          key: "getYScale",
          value: function getYScale(ticks) {
            var range = [];
            var step = this.chartHeight / ticks.length; // svg has y=0 on the top, so top card should have a minimal value in range

            range.push(step);

            for (var i = 1; i < ticks.length; i++) {
              range.push(step * (i + 1));
            }

            return d3.scaleOrdinal().domain(ticks).range(range);
          } // divide chart height by ticks with offset for ticks drawing

        }, {
          key: "getYAxisScale",
          value: function getYAxisScale(ticks) {
            var range = [];
            var step = this.chartHeight / ticks.length; // svg has y=0 on the top, so top tick should have a minimal value in range

            range.push(this.yOffset);

            for (var i = 1; i < ticks.length; i++) {
              range.push(step * i + this.yOffset);
            }

            return d3.scaleOrdinal().domain(ticks).range(range);
          }
        }, {
          key: "addYAxis",
          value: function addYAxis() {
            var ticks = this.bucketMatrixPager.targets(); // TODO move sorting into bucketMatrixPager.

            if (this.panel.yAxisSort == 'a → z') {
              ticks.sort(function (a, b) {
                return a.localeCompare(b, 'en', {
                  ignorePunctuation: false,
                  numeric: true
                });
              });
            } else if (this.panel.yAxisSort == 'z → a') {
              ticks.sort(function (b, a) {
                return a.localeCompare(b, 'en', {
                  ignorePunctuation: false,
                  numeric: true
                });
              });
            }

            var yAxisScale = this.getYAxisScale(ticks);
            this.scope.yScale = this.yScale = this.getYScale(ticks);
            var yAxis = d3.axisLeft(yAxisScale).tickValues(ticks).tickSizeInner(0 - this.width).tickPadding(Y_AXIS_TICK_PADDING);
            this.heatmap.append("g").attr("class", "axis axis-y").call(yAxis); // Calculate Y axis width first, then move axis into visible area

            var posY = this.margin.top;
            var posX = this.getYAxisWidth(this.heatmap) + Y_AXIS_TICK_PADDING;
            this.heatmap.select(".axis-y").attr("transform", "translate(" + posX + "," + posY + ")"); // Remove vertical line in the right of axis labels (called domain in d3)

            this.heatmap.select(".axis-y").select(".domain").remove();
            this.heatmap.select(".axis-y").selectAll(".tick line").remove();
          } // Wide Y values range and adjust to bucket size

        }, {
          key: "wideYAxisRange",
          value: function wideYAxisRange(min, max, tickInterval) {
            var y_widing = (max * (this.dataRangeWidingFactor - 1) - min * (this.dataRangeWidingFactor - 1)) / 2;
            var y_min, y_max;

            if (tickInterval === 0) {
              y_max = max * this.dataRangeWidingFactor;
              y_min = min - min * (this.dataRangeWidingFactor - 1);
              tickInterval = (y_max - y_min) / 2;
            } else {
              y_max = Math.ceil((max + y_widing) / tickInterval) * tickInterval;
              y_min = Math.floor((min - y_widing) / tickInterval) * tickInterval;
            } // Don't wide axis below 0 if all values are positive


            if (min >= 0 && y_min < 0) {
              y_min = 0;
            }

            return {
              y_min: y_min,
              y_max: y_max
            };
          }
        }, {
          key: "tickValueFormatter",
          value: function tickValueFormatter(decimals) {
            var scaledDecimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var format = this.panel.yAxis.format;
            return function (value) {
              return kbn.valueFormats[format](value, decimals, scaledDecimals);
            };
          } // Create svg element, add axes and
          // calculate sizes for cards drawing

        }, {
          key: "addStatusmapCanvas",
          value: function addStatusmapCanvas() {
            var heatmap_elem = this.$heatmap[0];
            this.width = Math.floor(this.$heatmap.width()) - this.padding.right;
            this.height = Math.floor(this.$heatmap.height()) - this.padding.bottom;

            if (this.heatmap) {
              this.heatmap.remove();
            } // Insert svg as a first child into heatmap_elem
            // as the frozen tooltip moving logiс assumes that tooltip is the last child.


            this.heatmap = d3.select(heatmap_elem).insert("svg", ":first-child").attr("width", this.width).attr("height", this.height);
            this.chartHeight = this.height - this.margin.top - this.margin.bottom;
            this.chartTop = this.margin.top;
            this.chartBottom = this.chartTop + this.chartHeight;
            this.cardHSpacing = this.panel.cards.cardHSpacing !== null ? this.panel.cards.cardHSpacing : CARD_H_SPACING;
            this.cardVSpacing = this.panel.cards.cardVSpacing !== null ? this.panel.cards.cardVSpacing : CARD_V_SPACING;
            this.cardRound = this.panel.cards.cardRound !== null ? this.panel.cards.cardRound : CARD_ROUND; // calculate yOffset for YAxis

            this.yGridSize = this.chartHeight;

            if (this.bucketMatrixPager.targets().length > 0) {
              this.yGridSize = Math.floor(this.chartHeight / this.bucketMatrixPager.targets().length);
            }

            this.cardHeight = this.yGridSize ? this.yGridSize - this.cardVSpacing : 0;
            this.yOffset = this.cardHeight / 2;
            this.addYAxis();
            this.yAxisWidth = this.getYAxisWidth(this.heatmap) + Y_AXIS_TICK_PADDING;
            this.chartWidth = this.width - this.yAxisWidth - this.margin.right; // TODO allow per-y cardWidth!
            // we need to fill chartWidth with xBucketSize cards.

            this.xGridSize = this.chartWidth / (this.bucketMatrix.xBucketSize + 1);
            this.cardWidth = this.xGridSize - this.cardHSpacing;
            this.addXAxis();
            this.xAxisHeight = this.getXAxisHeight(this.heatmap);

            if (!this.panel.yAxis.show) {
              this.heatmap.select(".axis-y").selectAll("line").style("opacity", 0);
            }

            if (!this.panel.xAxis.show) {
              this.heatmap.select(".axis-x").selectAll("line").style("opacity", 0);
            }
          }
        }, {
          key: "addStatusmap",
          value: function addStatusmap() {
            var _this = this;

            var maxValue = this.panel.color.max != null ? this.panel.color.max : this.bucketMatrix.maxValue;
            var minValue = this.panel.color.min != null ? this.panel.color.min : this.bucketMatrix.minValue;

            if (this.panel.color.mode !== 'discrete') {
              this.colorScale = this.getColorScale(maxValue, minValue);
            }

            this.setOpacityScale(maxValue); // Draw cards from buckets.

            this.heatmap.selectAll(".statusmap-cards-row").data(this.bucketMatrixPager.targets()).enter().selectAll(".statustmap-card").data(function (target) {
              return _this.bucketMatrix.buckets[target];
            }).enter().append("rect").attr("cardId", function (b) {
              return b.id;
            }).attr("xid", function (b) {
              return b.xid;
            }).attr("yid", function (b) {
              return b.yLabel;
            }).attr("x", this.getCardX.bind(this)).attr("width", this.getCardWidth.bind(this)).attr("y", this.getCardY.bind(this)).attr("height", this.getCardHeight.bind(this)).attr("rx", this.cardRound).attr("ry", this.cardRound).attr("class", function (b) {
              return b.isEmpty() ? "empty-card" : "bordered statusmap-card";
            }).style("fill", this.getCardColor.bind(this)).style("stroke", this.getCardColor.bind(this)).style("stroke-width", 0) //.style("stroke-width", getCardStrokeWidth)
            //.style("stroke-dasharray", "3,3")
            .style("opacity", this.getCardOpacity.bind(this)); // Set mouse events on cards.

            var $cards = this.$heatmap.find(".statusmap-card + .bordered");
            $cards.on("mouseenter", function (event) {
              _this.tooltip.mouseOverBucket = true;

              _this.highlightCard(event);
            }).on("mouseleave", function (event) {
              _this.tooltip.mouseOverBucket = false;

              _this.resetCardHighLight(event);
            });

            this._renderAnnotations();

            this.ctrl.events.emit(renderComplete, {
              "chartWidth": this.chartWidth
            });
          }
        }, {
          key: "highlightCard",
          value: function highlightCard(event) {
            var color = d3.select(event.target).style("fill");
            var highlightColor = d3.color(color).darker(2);
            var strokeColor = d3.color(color).brighter(4);
            var current_card = d3.select(event.target);
            this.tooltip.originalFillColor = color;
            current_card.style("fill", highlightColor.toString()).style("stroke", strokeColor.toString()).style("stroke-width", 1);
          }
        }, {
          key: "resetCardHighLight",
          value: function resetCardHighLight(event) {
            d3.select(event.target).style("fill", this.tooltip.originalFillColor).style("stroke", this.tooltip.originalFillColor).style("stroke-width", 0);
          }
        }, {
          key: "getColorScale",
          value: function getColorScale(maxValue) {
            var minValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var colorScheme = _.find(this.ctrl.colorSchemes, {
              value: this.panel.color.colorScheme
            });

            var colorInterpolator = d3ScaleChromatic[colorScheme.value];
            var colorScaleInverted = colorScheme.invert === 'always' || colorScheme.invert === 'dark' && !contextSrv.user.lightTheme;
            if (maxValue == minValue) maxValue = minValue + 1;
            var start = colorScaleInverted ? maxValue : minValue;
            var end = colorScaleInverted ? minValue : maxValue;
            return d3.scaleSequential(colorInterpolator).domain([start, end]);
          }
        }, {
          key: "setOpacityScale",
          value: function setOpacityScale(maxValue) {
            if (this.panel.color.colorScale === 'linear') {
              this.opacityScale = d3.scaleLinear().domain([0, maxValue]).range([0, 1]);
            } else if (this.panel.color.colorScale === 'sqrt') {
              this.opacityScale = d3.scalePow().exponent(this.panel.color.exponent).domain([0, maxValue]).range([0, 1]);
            }
          }
        }, {
          key: "getCardX",
          value: function getCardX(b) {
            var x; // cx is the center of the card. Card should be placed to the left.
            //let cx = this.xScale(d.x);

            var rightX = b.relTo / this.bucketMatrix.rangeMs * this.chartWidth;
            var cx = rightX - this.cardWidth / 2;

            if (cx - this.cardWidth / 2 < 0) {
              x = this.yAxisWidth + this.cardHSpacing / 2;
            } else {
              x = this.yAxisWidth + cx - this.cardWidth / 2;
            }

            return x;
          } // xScale returns card center. Adjust cardWidth in case of overlaping.

        }, {
          key: "getCardWidth",
          value: function getCardWidth(b) {
            //return 20;
            var w;
            var rightX = b.relTo / this.bucketMatrix.rangeMs * this.chartWidth;
            var cx = rightX - this.cardWidth / 2; //let cx = this.xScale(d.x);

            if (cx < this.cardWidth / 2) {
              // Center should not exceed half of card.
              // Cut card to the left to prevent overlay of y axis.
              var cutted_width = cx - this.cardHSpacing / 2 + this.cardWidth / 2;
              w = cutted_width > 0 ? cutted_width : 0;
            } else if (this.chartWidth - cx < this.cardWidth / 2) {
              // Cut card to the right to prevent overlay of right graph edge.
              w = this.cardWidth / 2 + (this.chartWidth - cx - this.cardHSpacing / 2);
            } else {
              w = this.cardWidth;
            } // Card width should be MIN_CARD_SIZE at least


            w = Math.max(w, MIN_CARD_SIZE);

            if (this.cardHSpacing == 0) {
              w = w + 1;
            }

            return w;
          } // Top y for card.
          // yScale gives ???

        }, {
          key: "getCardY",
          value: function getCardY(b) {
            return this.yScale(b.yLabel) + this.chartTop - this.cardHeight - this.cardVSpacing / 2;
          }
        }, {
          key: "getCardHeight",
          value: function getCardHeight(b) {
            //return 20;
            var ys = this.yScale(b.yLabel);
            var y = ys + this.chartTop - this.cardHeight - this.cardVSpacing / 2;
            var h = this.cardHeight; // Cut card height to prevent overlay

            if (y < this.chartTop) {
              h = ys - this.cardVSpacing / 2;
            } else if (ys > this.chartBottom) {
              h = this.chartBottom - y;
            } else if (y + this.cardHeight > this.chartBottom) {
              h = this.chartBottom - y;
            } // Height can't be more than chart height


            h = Math.min(h, this.chartHeight); // Card height should be MIN_CARD_SIZE at least

            h = Math.max(h, MIN_CARD_SIZE);

            if (this.cardVSpacing == 0) {
              h = h + 1;
            }

            return h;
          }
        }, {
          key: "getCardColor",
          value: function getCardColor(bucket) {
            if (this.panel.color.mode === 'opacity') {
              return this.panel.color.cardColor;
            } else if (this.panel.color.mode === 'spectrum') {
              return this.colorScale(bucket.value);
            } else if (this.panel.color.mode === 'discrete') {
              if (this.panel.seriesFilterIndex != null && this.panel.seriesFilterIndex != -1) {
                return this.ctrl.discreteExtraSeries.getBucketColorSingle(bucket.values[this.panel.seriesFilterIndex]);
              } else {
                return this.ctrl.discreteExtraSeries.getBucketColor(bucket.values);
              }
            }
          }
        }, {
          key: "getCardOpacity",
          value: function getCardOpacity(bucket) {
            if (this.panel.nullPointMode === 'as empty' && bucket.value == null) {
              return 0;
            }

            if (this.panel.color.mode === 'opacity') {
              return this.opacityScale(bucket.value);
            } else {
              return 1;
            }
          }
        }, {
          key: "getCardStrokeWidth",
          value: function getCardStrokeWidth(b) {
            if (this.panel.color.mode === 'discrete') {
              return '1';
            }

            return '0';
          } /////////////////////////////
          // Selection and crosshair //
          /////////////////////////////

        }, {
          key: "getEventOffset",
          value: function getEventOffset(event) {
            var elemOffset = this.$heatmap.offset();
            var x = Math.floor(event.clientX - elemOffset.left);
            var y = Math.floor(event.clientY - elemOffset.top);
            return {
              x: x,
              y: y
            };
          }
        }, {
          key: "onMouseDown",
          value: function onMouseDown(event) {
            var _this2 = this;

            var offset = this.getEventOffset(event);
            this.selection.active = true;
            this.selection.x1 = offset.x;

            this.mouseUpHandler = function () {
              _this2.onMouseUp();
            };

            $(document).one("mouseup", this.mouseUpHandler.bind(this));
          }
        }, {
          key: "onMouseUp",
          value: function onMouseUp() {
            $(document).unbind("mouseup", this.mouseUpHandler.bind(this));
            this.mouseUpHandler = null;
            this.selection.active = false;
            var selectionRange = Math.abs(this.selection.x2 - this.selection.x1);

            if (this.selection.x2 >= 0 && selectionRange > MIN_SELECTION_WIDTH) {
              var timeFrom = this.xScale.invert(Math.min(this.selection.x1, this.selection.x2) - this.yAxisWidth - this.xGridSize / 2);
              var timeTo = this.xScale.invert(Math.max(this.selection.x1, this.selection.x2) - this.yAxisWidth - this.xGridSize / 2);
              this.ctrl.timeSrv.setTime({
                from: moment.utc(timeFrom),
                to: moment.utc(timeTo)
              });
            }

            this.clearSelection();
          }
        }, {
          key: "onMouseLeave",
          value: function onMouseLeave(e) {
            appEvents.emit(CoreEvents.graphHoverClear);
            this.clearCrosshair();
            this.annotationTooltip.destroy();
          }
        }, {
          key: "onMouseMove",
          value: function onMouseMove(event) {
            if (!this.heatmap) {
              return;
            }

            var offset = this.getEventOffset(event);

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
          } // TODO emit an event and move logic to panelCtrl

        }, {
          key: "onMouseClick",
          value: function onMouseClick(e) {
            if (this.ctrl.panel.tooltip.freezeOnClick) {
              this.tooltip.showFrozen(e);
              this.tooltip.destroy();
            }
          }
        }, {
          key: "getEventPos",
          value: function getEventPos(event, offset) {
            var x = this.xScale.invert(offset.x - this.yAxisWidth).valueOf();
            var y = this.yScale.invert(offset.y - this.chartTop);
            var pos = {
              pageX: event.pageX,
              pageY: event.pageY,
              x: x,
              x1: x,
              y: y,
              y1: y,
              panelRelY: null,
              offset: offset
            };
            return pos;
          }
        }, {
          key: "emitGraphHoverEvent",
          value: function emitGraphHoverEvent(event) {
            var x = this.xScale.invert(event.offsetX - this.yAxisWidth - this.xGridSize / 2).valueOf();
            var y = this.yScale(event.offsetY);
            var pos = {
              pageX: event.pageX,
              pageY: event.pageY,
              x: x,
              x1: x,
              y: y,
              y1: y,
              panelRelY: 0
            }; // Set minimum offset to prevent showing legend from another panel

            pos.panelRelY = Math.max(event.offsetY / this.height, 0.001); // broadcast to other graph panels that we are hovering

            appEvents.emit(CoreEvents.graphHover, {
              pos: pos,
              panel: this.panel
            });
          }
        }, {
          key: "limitSelection",
          value: function limitSelection(x2) {
            x2 = Math.max(x2, this.yAxisWidth);
            x2 = Math.min(x2, this.chartWidth + this.yAxisWidth);
            return x2;
          }
        }, {
          key: "drawSelection",
          value: function drawSelection(posX1, posX2) {
            if (this.heatmap) {
              this.heatmap.selectAll(".status-heatmap-selection").remove();
              var selectionX = Math.min(posX1, posX2);
              var selectionWidth = Math.abs(posX1 - posX2);

              if (selectionWidth > MIN_SELECTION_WIDTH) {
                this.heatmap.append("rect").attr("class", "status-heatmap-selection").attr("x", selectionX).attr("width", selectionWidth).attr("y", this.chartTop).attr("height", this.chartHeight);
              }
            }
          }
        }, {
          key: "clearSelection",
          value: function clearSelection() {
            this.selection.x1 = -1;
            this.selection.x2 = -1;

            if (this.heatmap) {
              this.heatmap.selectAll(".status-heatmap-selection").remove();
            }
          }
        }, {
          key: "drawCrosshair",
          value: function drawCrosshair(position) {
            if (this.heatmap) {
              this.heatmap.selectAll(".status-heatmap-crosshair").remove();
              var posX = position;
              posX = Math.max(posX, this.yAxisWidth);
              posX = Math.min(posX, this.chartWidth + this.yAxisWidth);
              this.heatmap.append("g").attr("class", "status-heatmap-crosshair").attr("transform", "translate(" + posX + ",0)").append("line").attr("x1", 1).attr("y1", this.chartTop).attr("x2", 1).attr("y2", this.chartBottom).attr("stroke-width", 1);
            }
          } // map time to X

        }, {
          key: "drawSharedCrosshair",
          value: function drawSharedCrosshair(pos) {
            if (this.heatmap && this.ctrl.dashboard.graphTooltip !== 0) {
              var posX = this.xScale(pos.x) + this.yAxisWidth;
              this.drawCrosshair(posX);
            }
          }
        }, {
          key: "clearCrosshair",
          value: function clearCrosshair() {
            if (this.heatmap) {
              this.heatmap.selectAll(".status-heatmap-crosshair").remove();
            }
          }
        }, {
          key: "render",
          value: function render() {
            this.panel = this.ctrl.panel;
            this.timeRange = this.ctrl.range;
            this.bucketMatrix = this.ctrl.bucketMatrix;
            this.bucketMatrixPager = this.ctrl.bucketMatrixPager;

            if (!this.bucketMatrix || !this.setElementHeight()) {
              return;
            } // Draw default axes and return if no data


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
        }, {
          key: "_renderAnnotations",
          value: function _renderAnnotations() {
            var _this3 = this;

            if (!this.ctrl.annotations || this.ctrl.annotations.length == 0) {
              return;
            }

            if (!this.heatmap) {
              return;
            }

            var annoData = _.map(this.ctrl.annotations, function (d, i) {
              return {
                "x": Math.floor(_this3.yAxisWidth + _this3.xScale(d.time)),
                "id": i,
                "anno": d.source
              };
            }); //({"ctrl_annotations": this.ctrl.annotations, "annoData": annoData});


            var anno = this.heatmap.append("g").attr("class", "statusmap-annotations").attr("transform", "translate(0.5,0)").selectAll(".statusmap-annotations").data(annoData).enter().append("g");
            anno.append("line") //.attr("class", "statusmap-annotation-tick")
            .attr("x1", function (d) {
              return d.x;
            }).attr("y1", this.chartTop).attr("x2", function (d) {
              return d.x;
            }).attr("y2", this.chartBottom).style("stroke", function (d) {
              return d.anno.iconColor;
            }).style("stroke-width", 1).style("stroke-dasharray", "3,3");
            anno.append("polygon").attr("points", function (d) {
              return [[d.x, _this3.chartBottom + 1], [d.x - 5, _this3.chartBottom + 6], [d.x + 5, _this3.chartBottom + 6]].join(" ");
            }).style("stroke-width", 0).style("fill", function (d) {
              return d.anno.iconColor;
            }); // Polygons didn't fire mouseevents

            anno.append("rect").attr("x", function (d) {
              return d.x - 5;
            }).attr("width", 10).attr("y", this.chartBottom + 1).attr("height", 5).attr("class", "statusmap-annotation-tick").attr("annoId", function (d) {
              return d.id;
            }).style("opacity", 0);
            var $ticks = this.$heatmap.find(".statusmap-annotation-tick");
            $ticks.on("mouseenter", function (event) {
              _this3.annotationTooltip.mouseOverAnnotationTick = true;
            }).on("mouseleave", function (event) {
              _this3.annotationTooltip.mouseOverAnnotationTick = false;
            });
          }
        }]);

        return StatusmapRenderer;
      }());
    }
  };
});
//# sourceMappingURL=rendering.js.map

"use strict";

System.register(["lodash", "./color_legend", "app/core/utils/kbn", "app/plugins/sdk", "./statusmap_data", "./rendering", "./options_editor", "./color_mode_discrete", "./extra_series_format"], function (_export, _context) {
  "use strict";

  var _, kbn, loadPluginCss, MetricsPanelCtrl, Card, rendering, statusHeatmapOptionsEditor, ColorModeDiscrete, ExtraSeriesFormat, ExtraSeriesFormatValue, CANVAS, SVG, VALUE_INDEX, TIME_INDEX, renderer, colorSchemes, colorModes, opacityScales, StatusHeatmapCtrl;

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

  function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_color_legend) {}, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_appPluginsSdk) {
      loadPluginCss = _appPluginsSdk.loadPluginCss;
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_statusmap_data) {
      Card = _statusmap_data.Card;
    }, function (_rendering) {
      rendering = _rendering.default;
    }, function (_options_editor) {
      statusHeatmapOptionsEditor = _options_editor.statusHeatmapOptionsEditor;
    }, function (_color_mode_discrete) {
      ColorModeDiscrete = _color_mode_discrete.ColorModeDiscrete;
    }, function (_extra_series_format) {
      ExtraSeriesFormat = _extra_series_format.ExtraSeriesFormat;
      ExtraSeriesFormatValue = _extra_series_format.ExtraSeriesFormatValue;
    }],
    execute: function () {
      CANVAS = 'CANVAS';
      SVG = 'SVG';
      VALUE_INDEX = 0;
      TIME_INDEX = 1;
      renderer = CANVAS;
      colorSchemes = [// Diverging
      {
        name: 'Spectral',
        value: 'interpolateSpectral',
        invert: 'always'
      }, {
        name: 'RdYlGn',
        value: 'interpolateRdYlGn',
        invert: 'always'
      }, {
        name: 'GnYlRd',
        value: 'interpolateGnYlRd',
        invert: 'always'
      }, // Sequential (Single Hue)
      {
        name: 'Blues',
        value: 'interpolateBlues',
        invert: 'dark'
      }, {
        name: 'Greens',
        value: 'interpolateGreens',
        invert: 'dark'
      }, {
        name: 'Greys',
        value: 'interpolateGreys',
        invert: 'dark'
      }, {
        name: 'Oranges',
        value: 'interpolateOranges',
        invert: 'dark'
      }, {
        name: 'Purples',
        value: 'interpolatePurples',
        invert: 'dark'
      }, {
        name: 'Reds',
        value: 'interpolateReds',
        invert: 'dark'
      }, // Sequential (Multi-Hue)
      {
        name: 'BuGn',
        value: 'interpolateBuGn',
        invert: 'dark'
      }, {
        name: 'BuPu',
        value: 'interpolateBuPu',
        invert: 'dark'
      }, {
        name: 'GnBu',
        value: 'interpolateGnBu',
        invert: 'dark'
      }, {
        name: 'OrRd',
        value: 'interpolateOrRd',
        invert: 'dark'
      }, {
        name: 'PuBuGn',
        value: 'interpolatePuBuGn',
        invert: 'dark'
      }, {
        name: 'PuBu',
        value: 'interpolatePuBu',
        invert: 'dark'
      }, {
        name: 'PuRd',
        value: 'interpolatePuRd',
        invert: 'dark'
      }, {
        name: 'RdPu',
        value: 'interpolateRdPu',
        invert: 'dark'
      }, {
        name: 'YlGnBu',
        value: 'interpolateYlGnBu',
        invert: 'dark'
      }, {
        name: 'YlGn',
        value: 'interpolateYlGn',
        invert: 'dark'
      }, {
        name: 'YlOrBr',
        value: 'interpolateYlOrBr',
        invert: 'dark'
      }, {
        name: 'YlOrRd',
        value: 'interpolateYlOrRd',
        invert: 'dark'
      }];
      colorModes = ['opacity', 'spectrum', 'discrete'];
      opacityScales = ['linear', 'sqrt'];
      loadPluginCss({
        dark: 'plugins/flant-statusmap-panel/css/statusmap.dark.css',
        light: 'plugins/flant-statusmap-panel/css/statusmap.light.css'
      });

      _export("PanelCtrl", _export("StatusHeatmapCtrl", StatusHeatmapCtrl =
      /*#__PURE__*/
      function (_MetricsPanelCtrl) {
        StatusHeatmapCtrl.$inject = ["$scope", "$injector", "timeSrv", "annotationsSrv", "$window", "datasourceSrv", "variableSrv", "templateSrv"];

        _inherits(StatusHeatmapCtrl, _MetricsPanelCtrl);

        /** @ngInject */
        function StatusHeatmapCtrl($scope, $injector, timeSrv, annotationsSrv, $window, datasourceSrv, variableSrv, templateSrv) {
          var _this;

          _classCallCheck(this, StatusHeatmapCtrl);

          _this = _possibleConstructorReturn(this, _getPrototypeOf(StatusHeatmapCtrl).call(this, $scope, $injector));
          _this.annotationsSrv = annotationsSrv;

          _defineProperty(_assertThisInitialized(_this), "opacityScales", []);

          _defineProperty(_assertThisInitialized(_this), "colorModes", []);

          _defineProperty(_assertThisInitialized(_this), "colorSchemes", []);

          _defineProperty(_assertThisInitialized(_this), "unitFormats", void 0);

          _defineProperty(_assertThisInitialized(_this), "data", void 0);

          _defineProperty(_assertThisInitialized(_this), "cardsData", void 0);

          _defineProperty(_assertThisInitialized(_this), "graph", void 0);

          _defineProperty(_assertThisInitialized(_this), "multipleValues", void 0);

          _defineProperty(_assertThisInitialized(_this), "noColorDefined", void 0);

          _defineProperty(_assertThisInitialized(_this), "discreteExtraSeries", void 0);

          _defineProperty(_assertThisInitialized(_this), "dataWarnings", void 0);

          _defineProperty(_assertThisInitialized(_this), "extraSeriesFormats", []);

          _defineProperty(_assertThisInitialized(_this), "annotations", []);

          _defineProperty(_assertThisInitialized(_this), "annotationsPromise", void 0);

          _defineProperty(_assertThisInitialized(_this), "panelDefaults", {
            // datasource name, null = default datasource
            datasource: null,
            // color mode
            color: {
              mode: 'spectrum',
              cardColor: '#b4ff00',
              colorScale: 'sqrt',
              exponent: 0.5,
              colorScheme: 'interpolateGnYlRd',
              // discrete mode settings
              defaultColor: '#757575',
              thresholds: [] // manual colors

            },
            // buckets settings
            cards: {
              cardMinWidth: 5,
              cardVSpacing: 2,
              cardHSpacing: 2,
              cardRound: null
            },
            xAxis: {
              show: true,
              showWeekends: true,
              minBucketWidthToShowWeekends: 4,
              showCrosshair: true,
              labelFormat: '%a %m/%d'
            },
            yAxis: {
              show: true,
              showCrosshair: false
            },
            tooltip: {
              show: true
            },
            legend: {
              show: true
            },
            data: {
              unitFormat: 'short',
              decimals: null
            },
            // how null points should be handled
            nullPointMode: 'as empty',
            yAxisSort: 'metrics',
            highlightCards: true,
            useMax: true,
            urls: [{
              tooltip: '',
              label: '',
              base_url: '',
              useExtraSeries: false,
              useseriesname: true,
              forcelowercase: true,
              icon_fa: 'external-link',
              extraSeries: {
                index: -1
              }
            }],
            seriesFilterIndex: -1,
            usingUrl: false
          });

          _defineProperty(_assertThisInitialized(_this), "onEditorAddUrl", function () {
            _this.panel.urls.push({
              label: '',
              base_url: '',
              useExtraSeries: false,
              useseriesname: true,
              forcelowercase: true,
              icon_fa: 'external-link',
              extraSeries: {
                index: -1
              }
            });

            _this.render();
          });

          _defineProperty(_assertThisInitialized(_this), "onEditorRemoveUrl", function (index) {
            _this.panel.urls.splice(index, 1);

            _this.render();
          });

          _defineProperty(_assertThisInitialized(_this), "onEditorRemoveUrls", function () {
            _this.panel.urls = [];

            _this.render();
          });

          _.defaultsDeep(_this.panel, _this.panelDefaults);

          _this.opacityScales = opacityScales;
          _this.colorModes = colorModes;
          _this.colorSchemes = colorSchemes;
          _this.variableSrv = variableSrv;
          _this.extraSeriesFormats = ExtraSeriesFormat;

          _this.renderLink = function (link, scopedVars, format) {
            var scoped = {};

            for (var key in scopedVars) {
              scoped[key] = {
                value: scopedVars[key]
              };
            }

            if (format) {
              return _this.templateSrv.replace(link, scoped, format);
            } else {
              return _this.templateSrv.replace(link, scoped);
            }
          }; // default graph width for discrete card width calculation


          _this.graph = {
            "chartWidth": -1
          };
          _this.multipleValues = false;
          _this.noColorDefined = false;
          _this.discreteExtraSeries = new ColorModeDiscrete($scope);
          _this.dataWarnings = {
            "noColorDefined": {
              title: 'Data has value with undefined color',
              tip: 'Check metric values, color values or define a new color'
            },
            "multipleValues": {
              title: 'Data has multiple values for one target',
              tip: 'Change targets definitions or set "use max value"'
            }
          };
          _this.annotations = [];
          _this.annotationsSrv = annotationsSrv;
          _this.timeSrv = timeSrv;

          _this.events.on('render', _this.onRender.bind(_assertThisInitialized(_this)));

          _this.events.on('data-received', _this.onDataReceived.bind(_assertThisInitialized(_this)));

          _this.events.on('data-error', _this.onDataError.bind(_assertThisInitialized(_this)));

          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_assertThisInitialized(_this)));

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_assertThisInitialized(_this)));

          _this.events.on('refresh', _this.postRefresh.bind(_assertThisInitialized(_this))); // custom event from rendering.js


          _this.events.on('render-complete', _this.onRenderComplete.bind(_assertThisInitialized(_this)));

          _this.events.on('onChangeType', _this.onChangeType.bind(_assertThisInitialized(_this)));

          return _this;
        }

        _createClass(StatusHeatmapCtrl, [{
          key: "onRenderComplete",
          value: function onRenderComplete(data) {
            this.graph.chartWidth = data.chartWidth;
            this.renderingCompleted();
          }
        }, {
          key: "onChangeType",
          value: function onChangeType(url) {
            switch (url.type) {
              case ExtraSeriesFormat.Date:
                url.extraSeries.format = ExtraSeriesFormatValue.Date;
                break;

              case ExtraSeriesFormat.Raw:
                url.extraSeries.format = ExtraSeriesFormatValue.Raw;
                break;

              default:
                url.extraSeries.format = ExtraSeriesFormatValue.Raw;
                break;
            }
          }
        }, {
          key: "getChartWidth",
          value: function getChartWidth() {
            var wndWidth = $(window).width(); // gripPos.w is a width in grid's measurements. Grid size in Grafana is 24.

            var panelWidthFactor = this.panel.gridPos.w / 24;
            var panelWidth = Math.ceil(wndWidth * panelWidthFactor); // approximate chartWidth because y axis ticks not rendered yet on first data receive.

            var chartWidth = _.max([panelWidth - 200, panelWidth / 2]);

            return chartWidth;
          } // override calculateInterval for discrete color mode

        }, {
          key: "calculateInterval",
          value: function calculateInterval() {
            var chartWidth = this.getChartWidth();
            var minCardWidth = this.panel.cards.cardMinWidth;
            var minSpacing = this.panel.cards.cardHSpacing;
            var maxCardsCount = Math.ceil((chartWidth - minCardWidth) / (minCardWidth + minSpacing));
            var intervalMs;
            var rangeMs = this.range.to.valueOf() - this.range.from.valueOf(); // this is minimal interval! kbn.round_interval will lower it.

            intervalMs = this.discreteExtraSeries.roundIntervalCeil(rangeMs / maxCardsCount); // Calculate low limit of interval

            var lowLimitMs = 1; // 1 millisecond default low limit

            var intervalOverride = this.panel.interval; // if no panel interval check datasource

            if (intervalOverride) {
              intervalOverride = this.templateSrv.replace(intervalOverride, this.panel.scopedVars);
            } else if (this.datasource && this.datasource.interval) {
              intervalOverride = this.datasource.interval;
            }

            if (intervalOverride) {
              if (intervalOverride[0] === '>') {
                intervalOverride = intervalOverride.slice(1);
              }

              lowLimitMs = kbn.interval_to_ms(intervalOverride);
            }

            if (lowLimitMs > intervalMs) {
              intervalMs = lowLimitMs;
            }

            var interval = kbn.secondsToHms(intervalMs / 1000);
            this.intervalMs = intervalMs;
            this.interval = interval;
          }
        }, {
          key: "issueQueries",
          value: function issueQueries(datasource) {
            var _this2 = this;

            this.annotationsPromise = this.annotationsSrv.getAnnotations({
              dashboard: this.dashboard,
              panel: this.panel,
              range: this.range
            });
            /* Wait for annotationSrv requests to get datasources to
             * resolve before issuing queries. This allows the annotations
             * service to fire annotations queries before graph queries
             * (but not wait for completion). This resolves
             * issue 11806.
             */
            // 5.x before 5.4 doesn't have datasourcePromises. 

            if ("undefined" !== typeof this.annotationsSrv.datasourcePromises) {
              return this.annotationsSrv.datasourcePromises.then(function (r) {
                return _this2.issueQueriesWithInterval(datasource, _this2.interval);
              });
            } else {
              return this.issueQueriesWithInterval(datasource, this.interval);
            }
          } // Grafana 6.2 (and older) is using this.interval for queries,
          // but Grafana 6.3+ is calculating interval again in queryRunner,
          // so we need to save-restore this.panel.interval.

        }, {
          key: "issueQueriesWithInterval",
          value: function issueQueriesWithInterval(datasource, interval) {
            var origInterval = this.panel.interval;
            this.panel.interval = this.interval;

            var res = _get(_getPrototypeOf(StatusHeatmapCtrl.prototype), "issueQueries", this).call(this, datasource);

            this.panel.interval = origInterval;
            return res;
          }
        }, {
          key: "onDataReceived",
          value: function onDataReceived(dataList) {
            var _this3 = this;

            this.data = dataList;
            this.cardsData = this.convertToCards(this.data);
            this.annotationsPromise.then(function (result) {
              _this3.loading = false; //this.alertState = result.alertState;

              if (result.annotations && result.annotations.length > 0) {
                _this3.annotations = result.annotations;
              } else {
                _this3.annotations = [];
              }

              _this3.render();
            }, function () {
              _this3.loading = false;
              _this3.annotations = [];

              _this3.render();
            }); //this.render();
          }
        }, {
          key: "onInitEditMode",
          value: function onInitEditMode() {
            this.addEditorTab('Options', statusHeatmapOptionsEditor, 2);
            this.unitFormats = kbn.getUnitFormats();
          }
        }, {
          key: "onRender",
          value: function onRender() {
            if (!this.range || !this.data) {
              return;
            }

            this.multipleValues = false;

            if (!this.panel.useMax) {
              if (this.cardsData) {
                this.multipleValues = this.cardsData.multipleValues;
              }
            }

            this.noColorDefined = false;

            if (this.panel.color.mode === 'discrete') {
              if (this.panel.seriesFilterIndex == -1) {
                this.discreteExtraSeries.updateCardsValuesHasColorInfo();
              } else {
                this.discreteExtraSeries.updateCardsValuesHasColorInfoSingle();
              }

              if (this.cardsData) {
                this.noColorDefined = this.cardsData.noColorDefined;
              }
            }
          }
        }, {
          key: "onCardColorChange",
          value: function onCardColorChange(newColor) {
            this.panel.color.cardColor = newColor;
            this.render();
          }
        }, {
          key: "onDataError",
          value: function onDataError() {
            this.data = [];
            this.annotations = [];
            this.render();
          }
        }, {
          key: "postRefresh",
          value: function postRefresh() {
            this.noColorDefined = false;
          }
        }, {
          key: "onEditorAddThreshold",
          value: function onEditorAddThreshold() {
            this.panel.color.thresholds.push({
              color: this.panel.defaultColor
            });
            this.render();
          }
        }, {
          key: "onEditorRemoveThreshold",
          value: function onEditorRemoveThreshold(index) {
            this.panel.color.thresholds.splice(index, 1);
            this.render();
          }
        }, {
          key: "onEditorRemoveThresholds",
          value: function onEditorRemoveThresholds() {
            this.panel.color.thresholds = [];
            this.render();
          }
        }, {
          key: "onEditorAddThreeLights",
          value: function onEditorAddThreeLights() {
            this.panel.color.thresholds.push({
              color: "red",
              value: 2,
              tooltip: "error"
            });
            this.panel.color.thresholds.push({
              color: "yellow",
              value: 1,
              tooltip: "warning"
            });
            this.panel.color.thresholds.push({
              color: "green",
              value: 0,
              tooltip: "ok"
            });
            this.render();
          }
          /* https://ethanschoonover.com/solarized/ */

        }, {
          key: "onEditorAddSolarized",
          value: function onEditorAddSolarized() {
            this.panel.color.thresholds.push({
              color: "#b58900",
              value: 0,
              tooltip: "yellow"
            });
            this.panel.color.thresholds.push({
              color: "#cb4b16",
              value: 1,
              tooltip: "orange"
            });
            this.panel.color.thresholds.push({
              color: "#dc322f",
              value: 2,
              tooltip: "red"
            });
            this.panel.color.thresholds.push({
              color: "#d33682",
              value: 3,
              tooltip: "magenta"
            });
            this.panel.color.thresholds.push({
              color: "#6c71c4",
              value: 4,
              tooltip: "violet"
            });
            this.panel.color.thresholds.push({
              color: "#268bd2",
              value: 5,
              tooltip: "blue"
            });
            this.panel.color.thresholds.push({
              color: "#2aa198",
              value: 6,
              tooltip: "cyan"
            });
            this.panel.color.thresholds.push({
              color: "#859900",
              value: 7,
              tooltip: "green"
            });
            this.render();
          }
        }, {
          key: "link",
          value: function link(scope, elem, attrs, ctrl) {
            rendering(scope, elem, attrs, ctrl);
          }
        }, {
          key: "retrieveTimeVar",
          value: function retrieveTimeVar() {
            var time = this.timeSrv.timeRangeForUrl();
            var var_time = '&from=' + time.from + '&to=' + time.to;
            return var_time;
          } // group values into buckets by target

        }, {
          key: "convertToCards",
          value: function convertToCards(data) {
            var cardsData = {
              cards: [],
              xBucketSize: 0,
              yBucketSize: 0,
              maxValue: 0,
              minValue: 0,
              multipleValues: false,
              noColorDefined: false,
              targets: [],
              // array of available unique targets
              targetIndex: {} // indices in data array for each of available unique targets

            };

            if (!data || data.length == 0) {
              return cardsData;
            } // Collect uniq timestamps from data and spread over targets and timestamps
            // collect uniq targets and their indices


            _.map(data, function (d, i) {
              cardsData.targetIndex[d.target] = _.concat(_.toArray(cardsData.targetIndex[d.target]), i);
            }); // TODO add some logic for targets heirarchy


            cardsData.targets = _.keys(cardsData.targetIndex);
            cardsData.yBucketSize = cardsData.targets.length; // Maximum number of buckets over x axis

            cardsData.xBucketSize = _.max(_.map(data, function (d) {
              return d.datapoints.length;
            })); // Collect all values for each bucket from datapoints with similar target.
            // TODO aggregate values into buckets over datapoint[TIME_INDEX] not over datapoint index (j).

            for (var i = 0; i < cardsData.targets.length; i++) {
              var target = cardsData.targets[i];

              for (var j = 0; j < cardsData.xBucketSize; j++) {
                var card = new Card();
                card.id = i * cardsData.xBucketSize + j;
                card.values = [];
                card.columns = [];
                card.multipleValues = false;
                card.noColorDefined = false;
                card.y = target;
                card.x = -1; // collect values from all timeseries with target

                for (var si = 0; si < cardsData.targetIndex[target].length; si++) {
                  var s = data[cardsData.targetIndex[target][si]];

                  if (s.datapoints.length <= j) {
                    continue;
                  }

                  var datapoint = s.datapoints[j];

                  if (card.values.length === 0) {
                    card.x = datapoint[TIME_INDEX];
                  }

                  card.values.push(datapoint[VALUE_INDEX]);
                }

                card.minValue = _.min(card.values);
                card.maxValue = _.max(card.values);

                if (card.values.length > 1) {
                  cardsData.multipleValues = true;
                  card.multipleValues = true;
                  card.value = this.panel.seriesFilterIndex != -1 ? card.values[this.panel.seriesFilterIndex] : card.maxValue;
                } else {
                  card.value = card.maxValue; // max value by default
                }

                if (cardsData.maxValue < card.maxValue) cardsData.maxValue = card.maxValue;
                if (cardsData.minValue > card.minValue) cardsData.minValue = card.minValue;

                if (card.x != -1) {
                  cardsData.cards.push(card);
                }
              }
            }

            return cardsData;
          }
        }]);

        return StatusHeatmapCtrl;
      }(MetricsPanelCtrl)));

      _defineProperty(StatusHeatmapCtrl, "templateUrl", 'module.html');
    }
  };
});
//# sourceMappingURL=module.js.map

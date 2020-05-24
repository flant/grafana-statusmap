"use strict";

System.register(["lodash", "./color_legend", "app/core/utils/kbn", "app/plugins/sdk", "./statusmap_data", "./rendering", "./options_editor", "./color_mode_discrete", "./extra_series_format"], function (_export, _context) {
  "use strict";

  var _, kbn, loadPluginCss, MetricsPanelCtrl, Bucket, BucketMatrix, rendering, statusHeatmapOptionsEditor, ColorModeDiscrete, ExtraSeriesFormat, ExtraSeriesFormatValue, VALUE_INDEX, TIME_INDEX, colorSchemes, colorModes, opacityScales, StatusHeatmapCtrl;

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
      Bucket = _statusmap_data.Bucket;
      BucketMatrix = _statusmap_data.BucketMatrix;
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
      VALUE_INDEX = 0;
      TIME_INDEX = 1;
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

          _defineProperty(_assertThisInitialized(_this), "data", void 0);

          _defineProperty(_assertThisInitialized(_this), "bucketMatrix", void 0);

          _defineProperty(_assertThisInitialized(_this), "graph", void 0);

          _defineProperty(_assertThisInitialized(_this), "discreteHelper", void 0);

          _defineProperty(_assertThisInitialized(_this), "opacityScales", []);

          _defineProperty(_assertThisInitialized(_this), "colorModes", []);

          _defineProperty(_assertThisInitialized(_this), "colorSchemes", []);

          _defineProperty(_assertThisInitialized(_this), "unitFormats", void 0);

          _defineProperty(_assertThisInitialized(_this), "dataWarnings", {});

          _defineProperty(_assertThisInitialized(_this), "multipleValues", void 0);

          _defineProperty(_assertThisInitialized(_this), "noColorDefined", void 0);

          _defineProperty(_assertThisInitialized(_this), "noDatapoints", void 0);

          _defineProperty(_assertThisInitialized(_this), "discreteExtraSeries", void 0);

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
              labelFormat: '%a %m/%d'
            },
            yAxis: {
              show: true,
              minWidth: -1,
              maxWidth: -1
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
            noColorDefined: {
              title: 'Data has value with undefined color',
              tip: 'Check metric values, color values or define a new color'
            },
            multipleValues: {
              title: 'Data has multiple values for one target',
              tip: 'Change targets definitions or set "use max value"'
            },
            noDatapoints: {
              title: 'No data points',
              tip: 'No datapoints returned from data query'
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

          _this.onCardColorChange = _this.onCardColorChange.bind(_assertThisInitialized(_this));
          return _this;
        }

        _createClass(StatusHeatmapCtrl, [{
          key: "onRenderComplete",
          value: function onRenderComplete(data) {
            // console.log({
            //   data: this.data,
            //   bucketMatrix: this.bucketMatrix,
            //   chartWidth: data.chartWidth,
            //   from: this.range.from.valueOf(),
            //   to: this.range.to.valueOf()
            // })
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
          } // getChartWidth returns an approximation of chart canvas width or
          // a saved value calculated during a render.

        }, {
          key: "getChartWidth",
          value: function getChartWidth() {
            if (this.graph.chartWidth > 0) {
              return this.graph.chartWidth;
            }

            var wndWidth = $(window).width(); // gripPos.w is a width in grid's measurements. Grid size in Grafana is 24.

            var panelWidthFactor = this.panel.gridPos.w / 24;
            var panelWidth = Math.ceil(wndWidth * panelWidthFactor); // approximate width of the chart draw canvas:
            // - y axis ticks are not rendered yet on first data receive,
            //   so choose 200 as a decent value for y legend width
            // - chartWidth can not be lower than the half of the panel width.

            var chartWidth = _.max([panelWidth - 200, panelWidth / 2]);

            return chartWidth;
          } // Quick workaround for 6.7 and 7.0+. There is no call to
          // calculateInterval in updateTimeRange in those versions.

        }, {
          key: "updateTimeRange",
          value: function updateTimeRange(datasource) {
            var ret = _get(_getPrototypeOf(StatusHeatmapCtrl.prototype), "updateTimeRange", this).call(this, datasource);

            this.calculateInterval();
            return ret;
          } // calculateInterval is called on 'refresh' to calculate an interval
          // for datasource.
          // It is override of calculateInterval from MetricsPanelCtrl.

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
            this.interval = interval; // Get final buckets count after interval is adjusted
            //this.xBucketsCount = Math.floor(rangeMs / intervalMs);
            // console.log("calculateInterval: ", {
            //   interval: this.interval,
            //   intervalMs: this.intervalMs,
            //   rangeMs: rangeMs,
            //   from: this.range.from.valueOf(),
            //   to: this.range.to.valueOf(),
            //   numIntervals: rangeMs/this.intervalMs,
            //   maxCardsCount: maxCardsCount,
            // });
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
            this.panel.interval = interval;

            var res = _get(_getPrototypeOf(StatusHeatmapCtrl.prototype), "issueQueries", this).call(this, datasource);

            this.panel.interval = origInterval;
            return res;
          }
        }, {
          key: "onDataReceived",
          value: function onDataReceived(dataList) {
            var _this3 = this;

            //console.log("data",dataList)
            this.data = dataList;
            this.bucketMatrix = this.convertDataToBuckets(dataList, this.range.from.valueOf(), this.range.to.valueOf(), this.intervalMs, true);
            this.noDatapoints = this.bucketMatrix.noDatapoints; //console.log("buckets",this.bucketMatrix)

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
            });
          }
        }, {
          key: "onInitEditMode",
          value: function onInitEditMode() {
            this.addEditorTab('Options', statusHeatmapOptionsEditor, 2);
            this.unitFormats = kbn.getUnitFormats();
          } // onRender will be called before StatusmapRenderer.onRender.
          // Decide if warning should be displayed over cards.

        }, {
          key: "onRender",
          value: function onRender() {
            //console.log('OnRender');
            if (!this.range || !this.data) {
              this.noDatapoints = true;
              return;
            }

            this.multipleValues = false;

            if (!this.panel.useMax) {
              if (this.bucketMatrix) {
                this.multipleValues = this.bucketMatrix.multipleValues;
              }
            }

            this.noColorDefined = false;

            if (this.panel.color.mode === 'discrete') {
              if (this.panel.seriesFilterIndex == -1) {
                this.discreteExtraSeries.updateCardsValuesHasColorInfo();
              } else {
                this.discreteExtraSeries.updateCardsValuesHasColorInfoSingle();
              }

              if (this.bucketMatrix) {
                this.noColorDefined = this.bucketMatrix.noColorDefined;
              }
            }

            this.noDatapoints = false;

            if (this.bucketMatrix) {
              this.noDatapoints = this.bucketMatrix.noDatapoints;
            } //console.log(this);

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
          } // convertToBuckets groups values in data into buckets by target and timestamp.
          //
          // data is a result from datasource. It is an array of timeseries and tables:

          /* [
            // timeseries
            {
              target: "query alias",
              refId: "A",
              datapoints: [
                [0, 1582681239911],
                [3, 158....],
                ...
              ],
              tags?:{key: value,...}
            },
            // table
            {
              name: "table name",
              refId: "B",
              columns: [
                {text: "id"},
                {text: "info"},
                ...
              ],
              rows: [
                [1, "123"],
                [2, "44411"],
                ...
              ]
            },
          ...
          ]
           to and from — a time range of the panel.
          intervalMs — a calculated interval. It is used to split a time range.
          */

        }, {
          key: "convertDataToBuckets",
          value: function convertDataToBuckets(data, from, to, intervalMs, mostRecentBucket) {
            var _this4 = this;

            var bucketMatrix = new BucketMatrix();
            bucketMatrix.rangeMs = to - from;
            bucketMatrix.intervalMs = intervalMs;

            if (!data || data.length == 0) {
              // Mimic heatmap and graph 'no data' labels.
              bucketMatrix.targets = ["1.0", "0.0", "-1.0"];
              bucketMatrix.buckets["1.0"] = [];
              bucketMatrix.buckets["0.0"] = [];
              bucketMatrix.buckets["-1.0"] = [];
              bucketMatrix.xBucketSize = 42;
              bucketMatrix.noDatapoints = true;
              return bucketMatrix;
            }

            var targetIndex = {}; // Group indicies of elements in data by target (y label).
            // lodash version:
            //_.map(data, (d, i) => {
            //  targetIndex[d.target] = _.concat(_.toArray(targetIndex[d.target]), i);
            //});

            data.map(function (queryResult, i) {
              var yLabel = queryResult.target;

              if (!targetIndex.hasOwnProperty(yLabel)) {
                targetIndex[yLabel] = [];
              }

              targetIndex[yLabel].push(i);
            });

            var targetKeys = _.keys(targetIndex); //console.log ("targetIndex: ", targetIndex, "targetKeys: ", targetKeys);


            var targetTimestampRanges = {}; // Collect all timestamps for each target.
            // Make map timestamp => [from, to]. from == previous ts, to == ts from datapoint.

            targetKeys.map(function (target) {
              var targetTimestamps = [];

              for (var si = 0; si < targetIndex[target].length; si++) {
                var s = data[targetIndex[target][si]];

                _.map(s.datapoints, function (datapoint, idx) {
                  targetTimestamps.push(datapoint[TIME_INDEX] - from);
                });
              } //console.log("timestamps['"+target+"'] = ", targetTimestamps);


              targetTimestamps = _.uniq(targetTimestamps); //console.log("uniq timestamps['"+target+"'] = ", targetTimestamps);

              targetTimestampRanges[target] = [];

              for (var i = targetTimestamps.length - 1; i >= 0; i--) {
                var tsTo = targetTimestamps[i];
                var tsFrom = 0;

                if (tsTo < 0) {
                  tsFrom = tsTo - intervalMs;
                } else {
                  if (i - 1 >= 0) {
                    // Set from to previous timestamp + 1ms;
                    tsFrom = targetTimestamps[i - 1] + 1; // tfTo - tfFrom should not be more than intervalMs

                    var minFrom = tsTo - intervalMs;

                    if (tsFrom < minFrom) {
                      tsFrom = minFrom;
                    }
                  }
                }

                targetTimestampRanges[target][tsTo] = [tsFrom, tsTo];
              }
            }); // console.log ("targetTimestampRanges: ", targetTimestampRanges);
            // Create empty buckets using intervalMs to calculate ranges.
            // If mostRecentBucket is set, create a bucket with a range "to":"to"
            // to store most recent values.

            targetKeys.map(function (target) {
              var targetEmptyBuckets = [];
              var lastTs = to - from;

              if (mostRecentBucket) {
                var topBucket = new Bucket();
                topBucket.yLabel = target;
                topBucket.relTo = lastTs;
                topBucket.relFrom = lastTs;
                topBucket.values = [];
                topBucket.mostRecent = true;

                if (targetTimestampRanges[target].hasOwnProperty(lastTs)) {
                  topBucket.relFrom = targetTimestampRanges[target][lastTs][0];
                  lastTs = topBucket.relFrom;
                }

                topBucket.to = topBucket.relTo + from;
                topBucket.from = topBucket.relFrom + from;
                targetEmptyBuckets.push(topBucket);
              }

              var idx = 0;
              var bucketFrom = 0;

              while (bucketFrom >= 0) {
                var b = new Bucket();
                b.yLabel = target;
                b.relTo = lastTs - idx * intervalMs;
                b.relFrom = lastTs - (idx + 1) * intervalMs;
                b.to = b.relTo + from;
                b.from = b.relFrom + from;
                b.values = [];
                bucketFrom = b.relFrom;
                targetEmptyBuckets.push(b);
                idx++;
              }

              targetEmptyBuckets.map(function (bucket, i) {
                bucket.xid = i;
              });
              bucketMatrix.buckets[target] = targetEmptyBuckets;
            }); //console.log ("bucketMatrix: ", bucketMatrix);
            // Put values into buckets.

            bucketMatrix.minValue = Number.MAX_VALUE;
            bucketMatrix.maxValue = Number.MIN_SAFE_INTEGER;
            targetKeys.map(function (target) {
              targetIndex[target].map(function (dataIndex) {
                var s = data[dataIndex];
                s.datapoints.map(function (dp) {
                  for (var i = 0; i < bucketMatrix.buckets[target].length; i++) {
                    if (bucketMatrix.buckets[target][i].belong(dp[TIME_INDEX])) {
                      bucketMatrix.buckets[target][i].put(dp[VALUE_INDEX]);
                    }
                  }
                });
              });
              bucketMatrix.buckets[target].map(function (bucket) {
                bucket.minValue = _.min(bucket.values);
                bucket.maxValue = _.max(bucket.values);

                if (bucket.minValue < bucketMatrix.minValue) {
                  bucketMatrix.minValue = bucket.minValue;
                }

                if (bucket.maxValue > bucketMatrix.maxValue) {
                  bucketMatrix.maxValue = bucket.maxValue;
                }

                bucket.value = bucket.maxValue;

                if (bucket.values.length > 1) {
                  bucketMatrix.multipleValues = true;
                  bucket.multipleValues = true;
                  bucket.value = _this4.panel.seriesFilterIndex != -1 ? bucket.values[_this4.panel.seriesFilterIndex] : bucket.maxValue;
                }
              });
            });
            bucketMatrix.xBucketSize = Number.MIN_SAFE_INTEGER;
            targetKeys.map(function (target) {
              var bucketsLen = bucketMatrix.buckets[target].length;

              if (bucketsLen > bucketMatrix.xBucketSize) {
                bucketMatrix.xBucketSize = bucketsLen;
              }
            }); //console.log ("bucketMatrix with values: ", bucketMatrix);

            bucketMatrix.targets = targetKeys;
            return bucketMatrix;
            this.bucketMatrix = bucketMatrix; // Collect all values for each bucket from datapoints with similar target.
            // TODO aggregate values into buckets over datapoint[TIME_INDEX] not over datapoint index (j).
            // for(let i = 0; i < cardsData.targets.length; i++) {
            //   let target = cardsData.targets[i];
            //   for (let j = 0; j < cardsData.xBucketSize; j++) {
            //     let card = new Card();
            //     card.id = i*cardsData.xBucketSize + j;
            //     card.values = [];
            //     card.y = target;
            //     card.x = -1;
            //     // collect values from all timeseries with target
            //     for (let si = 0; si < cardsData.targetIndex[target].length; si++) {
            //       let s = data[cardsData.targetIndex[target][si]];
            //       if (s.datapoints.length <= j) {
            //         continue;
            //       }
            //       let datapoint = s.datapoints[j];
            //       if (card.values.length === 0) {
            //         card.x = datapoint[TIME_INDEX];
            //       }
            //       card.values.push(datapoint[VALUE_INDEX]);
            //     }
            //     card.minValue = _.min(card.values);
            //     card.maxValue = _.max(card.values);
            //     if (card.values.length > 1) {
            //       cardsData.multipleValues = true;
            //       card.multipleValues = true;
            //       card.value = card.maxValue; // max value by default
            //     } else {
            //       card.value = card.maxValue; // max value by default
            //     }
            //     if (cardsData.maxValue < card.maxValue)
            //       cardsData.maxValue = card.maxValue;
            //     if (cardsData.minValue > card.minValue)
            //       cardsData.minValue = card.minValue;
            //     if (card.x != -1) {
            //     cardsData.cards.push(card);
            //     }
            //   }
            // }
            // let cardsData = <CardsStorage> {
            //   cards: [],
            //   xBucketSize: 0,
            //   yBucketSize: 0,
            //   maxValue: 0,
            //   minValue: 0,
            //   multipleValues: false,
            //   noColorDefined: false,
            //   targets: [], // array of available unique targets
            //   targetIndex: {} // indices in data array for each of available unique targets
            // };
            // if (!data || data.length == 0) { return cardsData;}
            // // Collect uniq timestamps from data and spread over targets and timestamps
            // // collect uniq targets and their indices
            // _.map(data, (d, i) => {
            //   cardsData.targetIndex[d.target] = _.concat(_.toArray(cardsData.targetIndex[d.target]), i)
            // });
            // // TODO add some logic for targets heirarchy
            // cardsData.targets = _.keys(cardsData.targetIndex);
            // cardsData.yBucketSize = cardsData.targets.length;
            // // Maximum number of buckets over x axis
            // cardsData.xBucketSize = _.max(_.map(data, d => d.datapoints.length));
            // // Collect all values for each bucket from datapoints with similar target.
            // // TODO aggregate values into buckets over datapoint[TIME_INDEX] not over datapoint index (j).
            // for(let i = 0; i < cardsData.targets.length; i++) {
            //   let target = cardsData.targets[i];
            //   for (let j = 0; j < cardsData.xBucketSize; j++) {
            //     let card = new Card();
            //     card.id = i*cardsData.xBucketSize + j;
            //     card.values = [];
            //     card.y = target;
            //     card.x = -1;
            //     // collect values from all timeseries with target
            //     for (let si = 0; si < cardsData.targetIndex[target].length; si++) {
            //       let s = data[cardsData.targetIndex[target][si]];
            //       if (s.datapoints.length <= j) {
            //         continue;
            //       }
            //       let datapoint = s.datapoints[j];
            //       if (card.values.length === 0) {
            //         card.x = datapoint[TIME_INDEX];
            //       }
            //       card.values.push(datapoint[VALUE_INDEX]);
            //     }
            //     card.minValue = _.min(card.values);
            //     card.maxValue = _.max(card.values);
            //     if (card.values.length > 1) {
            //       cardsData.multipleValues = true;
            //       card.multipleValues = true;
            //       card.value = card.maxValue; // max value by default
            //     } else {
            //       card.value = card.maxValue; // max value by default
            //     }
            //     if (cardsData.maxValue < card.maxValue)
            //       cardsData.maxValue = card.maxValue;
            //     if (cardsData.minValue > card.minValue)
            //       cardsData.minValue = card.minValue;
            //     if (card.x != -1) {
            //     cardsData.cards.push(card);
            //     }
            //   }
            // }
            // return cardsData;
          }
        }]);

        return StatusHeatmapCtrl;
      }(MetricsPanelCtrl)));

      _defineProperty(StatusHeatmapCtrl, "templateUrl", 'module.html');
    }
  };
});
//# sourceMappingURL=module.js.map

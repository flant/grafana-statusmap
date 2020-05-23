// Libraries
import _ from 'lodash';
import { auto } from 'angular';

// Components
import './color_legend';

// Utils
import kbn from 'app/core/utils/kbn';
import {loadPluginCss} from 'app/plugins/sdk';

// Types
import { MetricsPanelCtrl } from 'app/plugins/sdk';
import { AnnotationsSrv } from 'app/features/annotations/annotations_srv';
import { Bucket, BucketMatrix } from './statusmap_data';
import rendering from './rendering';
// import aggregates, { aggregatesMap } from './aggregates';
// import fragments, { fragmentsMap } from './fragments';
// import { labelFormats } from './xAxisLabelFormats';
import {statusHeatmapOptionsEditor} from './options_editor';
import {ColorModeDiscrete} from "./color_mode_discrete";
import { ExtraSeriesFormat, ExtraSeriesFormatValue } from './extra_series_format';

const VALUE_INDEX = 0,
      TIME_INDEX = 1;

const colorSchemes = [
  // Diverging
  { name: 'Spectral', value: 'interpolateSpectral', invert: 'always' },
  { name: 'RdYlGn', value: 'interpolateRdYlGn', invert: 'always' },
  { name: 'GnYlRd', value: 'interpolateGnYlRd', invert: 'always' },

  // Sequential (Single Hue)
  { name: 'Blues', value: 'interpolateBlues', invert: 'dark' },
  { name: 'Greens', value: 'interpolateGreens', invert: 'dark' },
  { name: 'Greys', value: 'interpolateGreys', invert: 'dark' },
  { name: 'Oranges', value: 'interpolateOranges', invert: 'dark' },
  { name: 'Purples', value: 'interpolatePurples', invert: 'dark' },
  { name: 'Reds', value: 'interpolateReds', invert: 'dark' },

  // Sequential (Multi-Hue)
  { name: 'BuGn', value: 'interpolateBuGn', invert: 'dark' },
  { name: 'BuPu', value: 'interpolateBuPu', invert: 'dark' },
  { name: 'GnBu', value: 'interpolateGnBu', invert: 'dark' },
  { name: 'OrRd', value: 'interpolateOrRd', invert: 'dark' },
  { name: 'PuBuGn', value: 'interpolatePuBuGn', invert: 'dark' },
  { name: 'PuBu', value: 'interpolatePuBu', invert: 'dark' },
  { name: 'PuRd', value: 'interpolatePuRd', invert: 'dark' },
  { name: 'RdPu', value: 'interpolateRdPu', invert: 'dark' },
  { name: 'YlGnBu', value: 'interpolateYlGnBu', invert: 'dark' },
  { name: 'YlGn', value: 'interpolateYlGn', invert: 'dark' },
  { name: 'YlOrBr', value: 'interpolateYlOrBr', invert: 'dark' },
  { name: 'YlOrRd', value: 'interpolateYlOrRd', invert: 'dark' }
];

let colorModes = ['opacity', 'spectrum', 'discrete'];
let opacityScales = ['linear', 'sqrt'];


loadPluginCss({
  dark: 'plugins/flant-statusmap-panel/css/statusmap.dark.css',
  light: 'plugins/flant-statusmap-panel/css/statusmap.light.css'
});

class StatusHeatmapCtrl extends MetricsPanelCtrl {
  static templateUrl = 'module.html';

  data: any;
  bucketMatrix: BucketMatrix;

  graph: any;
  discreteHelper: ColorModeDiscrete;
  opacityScales: any = [];
  colorModes: any = [];
  colorSchemes: any = [];
  unitFormats: any;

  dataWarnings: {[warningId: string]: {title: string, tip: string}} = {};
  multipleValues: boolean;
  noColorDefined: boolean;
  noDatapoints: boolean;

  discreteExtraSeries: ColorModeDiscrete;
  extraSeriesFormats: any = [];

  annotations: object[] = [];
  annotationsPromise: any;

  panelDefaults: any = {
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
      maxWidth: -1,
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
  };

  /** @ngInject */
  constructor($scope: any, $injector: auto.IInjectorService, timeSrv, private annotationsSrv: AnnotationsSrv, $window, datasourceSrv, variableSrv, templateSrv) {
    super($scope, $injector);

    _.defaultsDeep(this.panel, this.panelDefaults);

    this.opacityScales = opacityScales;
    this.colorModes = colorModes;
    this.colorSchemes = colorSchemes;
    this.variableSrv = variableSrv;
    this.extraSeriesFormats = ExtraSeriesFormat;

    this.renderLink = (link, scopedVars, format) => {
      var scoped = {}
      for (var key in scopedVars) {
        scoped[key] = { value: scopedVars[key] }
      }
      if (format) {
        return this.templateSrv.replace(link, scoped, format)
      } else {
        return this.templateSrv.replace(link, scoped)
      }
    }

    // default graph width for discrete card width calculation
    this.graph = {
      "chartWidth" : -1
    };

    this.multipleValues = false;
    this.noColorDefined = false;

    this.discreteExtraSeries = new ColorModeDiscrete($scope);

    this.dataWarnings = {
      noColorDefined: {
        title: 'Data has value with undefined color',
        tip: 'Check metric values, color values or define a new color',
      },
      multipleValues: {
        title: 'Data has multiple values for one target',
        tip: 'Change targets definitions or set "use max value"',
      },
      noDatapoints: {
        title: 'No data points',
        tip: 'No datapoints returned from data query',
      }
    };

    this.annotations = [];
    this.annotationsSrv = annotationsSrv;
    
    this.timeSrv = timeSrv;

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('refresh', this.postRefresh.bind(this));
    // custom event from rendering.js
    this.events.on('render-complete', this.onRenderComplete.bind(this));
    this.events.on('onChangeType', this.onChangeType.bind(this));

    this.onCardColorChange = this.onCardColorChange.bind(this);
  }

  onRenderComplete(data: any):void {
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

  onChangeType(url): void {
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

  // getChartWidth returns an approximation of chart canvas width or
  // a saved value calculated during a render.
  getChartWidth():number {
    if (this.graph.chartWidth > 0) {
      return this.graph.chartWidth;
    }

    const wndWidth = $(window).width();
    // gripPos.w is a width in grid's measurements. Grid size in Grafana is 24.
    const panelWidthFactor = this.panel.gridPos.w / 24;
    const panelWidth = Math.ceil(wndWidth * panelWidthFactor);
    // approximate width of the chart draw canvas:
    // - y axis ticks are not rendered yet on first data receive,
    //   so choose 200 as a decent value for y legend width
    // - chartWidth can not be lower than the half of the panel width.
    const chartWidth = _.max([
      panelWidth - 200,
      panelWidth/2
    ]);

    return chartWidth!;
  }

  // Quick workaround for 6.7 and 7.0+. There is no call to
  // calculateInterval in updateTimeRange in those versions.
  updateTimeRange() {
    let ret = super.updateTimeRange();
    this.calculateInterval();
    return ret;
  }

  // calculateInterval is called on 'refresh' to calculate an interval
  // for datasource.
  // It is override of calculateInterval from MetricsPanelCtrl.
  calculateInterval() {
    let chartWidth = this.getChartWidth();

    let minCardWidth = this.panel.cards.cardMinWidth;
    let minSpacing = this.panel.cards.cardHSpacing;
    let maxCardsCount = Math.ceil((chartWidth-minCardWidth) / (minCardWidth + minSpacing));

    let intervalMs;
    let rangeMs = this.range.to.valueOf() - this.range.from.valueOf();

    // this is minimal interval! kbn.round_interval will lower it.
    intervalMs = this.discreteExtraSeries.roundIntervalCeil(rangeMs / maxCardsCount);

    // Calculate low limit of interval
    let lowLimitMs = 1; // 1 millisecond default low limit
    
    let intervalOverride = this.panel.interval;

    // if no panel interval check datasource
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
    let interval = kbn.secondsToHms(intervalMs / 1000);

    this.intervalMs = intervalMs;
    this.interval = interval;

    // Get final buckets count after interval is adjusted
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

  issueQueries(datasource: any) {
    this.annotationsPromise = this.annotationsSrv.getAnnotations({
      dashboard: this.dashboard,
      panel: this.panel,
      range: this.range,
    });

    /* Wait for annotationSrv requests to get datasources to
     * resolve before issuing queries. This allows the annotations
     * service to fire annotations queries before graph queries
     * (but not wait for completion). This resolves
     * issue 11806.
     */
    // 5.x before 5.4 doesn't have datasourcePromises. 

    if ("undefined" !== typeof(this.annotationsSrv.datasourcePromises)) {
      return this.annotationsSrv.datasourcePromises.then(r => {
        return this.issueQueriesWithInterval(datasource, this.interval);
      });
    } else {
      return this.issueQueriesWithInterval(datasource, this.interval);
    }
  }

  // Grafana 6.2 (and older) is using this.interval for queries,
  // but Grafana 6.3+ is calculating interval again in queryRunner,
  // so we need to save-restore this.panel.interval.
  issueQueriesWithInterval(datasource: any, interval: any) {
    var origInterval = this.panel.interval;
    this.panel.interval = interval;
    var res = super.issueQueries(datasource);
    this.panel.interval = origInterval;
    return res;
  }


  onDataReceived(dataList: any) {
    //console.log("data",dataList)
    this.data    = dataList;
    this.bucketMatrix = this.convertDataToBuckets(dataList, this.range.from.valueOf(), this.range.to.valueOf(), this.intervalMs, true);
    this.noDatapoints = this.bucketMatrix.noDatapoints;

    //console.log("buckets",this.bucketMatrix)

    this.annotationsPromise.then(
      (result: { alertState: any; annotations: any }) => {
        this.loading = false;
        //this.alertState = result.alertState;
        if (result.annotations && result.annotations.length > 0) {
          this.annotations = result.annotations;
        } else {
          this.annotations = [];
        }
        this.render();
      },
      () => {
        this.loading = false;
        this.annotations = [];
        this.render();
      }
    );
  }

  onInitEditMode() {
    this.addEditorTab('Options', statusHeatmapOptionsEditor, 2);
    this.unitFormats = kbn.getUnitFormats();
  }

  // onRender will be called before StatusmapRenderer.onRender.
  // Decide if warning should be displayed over cards.
  onRender() {
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
    }

    //console.log(this);
  }

  onCardColorChange(newColor) {
    this.panel.color.cardColor = newColor;
    this.render();
  }

  onDataError() {
    this.data = [];
    this.annotations = [];
    this.render();
  }

  postRefresh() {
    this.noColorDefined = false;
  }

  onEditorAddThreshold() {
    this.panel.color.thresholds.push({ color: this.panel.defaultColor });
    this.render();
  }

  onEditorAddUrl = () => {
    this.panel.urls.push({
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
    this.render();
  }

  onEditorRemoveUrl = (index) => {
    this.panel.urls.splice(index, 1);
    this.render();
  }

  onEditorRemoveThreshold(index:number) {
    this.panel.color.thresholds.splice(index, 1);
    this.render();
  }

  onEditorRemoveThresholds() {
    this.panel.color.thresholds = [];
    this.render();
  }


  onEditorRemoveUrls = () => {
    this.panel.urls = [];
    this.render();
  }

  onEditorAddThreeLights() {
    this.panel.color.thresholds.push({color: "red", value: 2, tooltip: "error" });
    this.panel.color.thresholds.push({color: "yellow", value: 1, tooltip: "warning" });
    this.panel.color.thresholds.push({color: "green", value: 0, tooltip: "ok" });
    this.render();
  }
  
  /* https://ethanschoonover.com/solarized/ */
  onEditorAddSolarized() {
    this.panel.color.thresholds.push({color: "#b58900", value: 0, tooltip: "yellow" });
    this.panel.color.thresholds.push({color: "#cb4b16", value: 1, tooltip: "orange" });
    this.panel.color.thresholds.push({color: "#dc322f", value: 2, tooltip: "red" });
    this.panel.color.thresholds.push({color: "#d33682", value: 3, tooltip: "magenta" });
    this.panel.color.thresholds.push({color: "#6c71c4", value: 4, tooltip: "violet" });
    this.panel.color.thresholds.push({color: "#268bd2", value: 5, tooltip: "blue" });
    this.panel.color.thresholds.push({color: "#2aa198", value: 6, tooltip: "cyan" });
    this.panel.color.thresholds.push({color: "#859900", value: 7, tooltip: "green" });
    this.render();
  }

  link(scope, elem, attrs, ctrl) {
    rendering(scope, elem, attrs, ctrl);
  }

  retrieveTimeVar() {
    var time = this.timeSrv.timeRangeForUrl();
    var var_time = '&from=' + time.from + '&to=' + time.to;
    return var_time;
  }

  // convertToBuckets groups values in data into buckets by target and timestamp.
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
  convertDataToBuckets(data:any, from:number, to:number, intervalMs: number, mostRecentBucket: boolean):BucketMatrix {
    let bucketMatrix = new BucketMatrix();
    bucketMatrix.rangeMs = to - from;
    bucketMatrix.intervalMs = intervalMs;

    if (!data || data.length == 0) { 
      // Mimic heatmap and graph 'no data' labels.
      bucketMatrix.targets = [
        "1.0", "0.0", "-1.0"
      ];
      bucketMatrix.buckets["1.0"] = [];
      bucketMatrix.buckets["0.0"] = [];
      bucketMatrix.buckets["-1.0"] = [];
      bucketMatrix.xBucketSize = 42;
      bucketMatrix.noDatapoints = true;
      return bucketMatrix;
    }

    let targetIndex: {[target: string]: number[]} = {};

    // Group indicies of elements in data by target (y label).
    
    // lodash version:
    //_.map(data, (d, i) => {
    //  targetIndex[d.target] = _.concat(_.toArray(targetIndex[d.target]), i);
    //});

    data.map((queryResult: any, i: number) => {
      let yLabel = queryResult.target;
      if (!targetIndex.hasOwnProperty(yLabel)) {
        targetIndex[yLabel] = [];
      }
      targetIndex[yLabel].push(i);
    });

    let targetKeys = _.keys(targetIndex);

    //console.log ("targetIndex: ", targetIndex, "targetKeys: ", targetKeys);

    let targetTimestampRanges: {[target: string]: {[timestamp: number]: number[]}} = {};

    // Collect all timestamps for each target.
    // Make map timestamp => [from, to]. from == previous ts, to == ts from datapoint.
    targetKeys.map((target) => {
      let targetTimestamps: any[] = [];

      for (let si = 0; si < targetIndex[target].length; si++) {
        let s = data[targetIndex[target][si]];
        _.map(s.datapoints, (datapoint, idx) => {
          targetTimestamps.push(datapoint[TIME_INDEX]-from);
        })
      }

      //console.log("timestamps['"+target+"'] = ", targetTimestamps);

      targetTimestamps = _.uniq(targetTimestamps);

      //console.log("uniq timestamps['"+target+"'] = ", targetTimestamps);

      targetTimestampRanges[target] = [];
      for (let i = targetTimestamps.length-1 ; i>=0; i-- ) {
        let tsTo = targetTimestamps[i];
        let tsFrom = 0;
        if (tsTo < 0) {
          tsFrom = tsTo - intervalMs;
        } else {
          if (i-1 >= 0) {
            // Set from to previous timestamp + 1ms;
            tsFrom = targetTimestamps[i-1]+1;
            // tfTo - tfFrom should not be more than intervalMs
            let minFrom = tsTo - intervalMs;
            if (tsFrom < minFrom) {
              tsFrom = minFrom;
            }
          }
        }
        targetTimestampRanges[target][tsTo] = [tsFrom, tsTo];
      }
    });

    // console.log ("targetTimestampRanges: ", targetTimestampRanges);

    // Create empty buckets using intervalMs to calculate ranges.
    // If mostRecentBucket is set, create a bucket with a range "to":"to"
    // to store most recent values.
    targetKeys.map((target) => {
      let targetEmptyBuckets: any[] = [];

      let lastTs = to-from;

      if (mostRecentBucket) {
        let topBucket = new Bucket();
        topBucket.yLabel = target;
        topBucket.relTo = lastTs;
        topBucket.relFrom = lastTs;
        topBucket.values = [];
        topBucket.mostRecent = true;
        if (targetTimestampRanges[target].hasOwnProperty(lastTs)) {
          topBucket.relFrom = targetTimestampRanges[target][lastTs][0];
          lastTs = topBucket.relFrom;
        }
        topBucket.to = topBucket.relTo+from;
        topBucket.from = topBucket.relFrom+from;
        targetEmptyBuckets.push(topBucket);
      }

      let idx = 0;
      let bucketFrom: number = 0;
      while (bucketFrom >= 0) {
        let b = new Bucket();
        b.yLabel = target;
        b.relTo = lastTs - idx*intervalMs;
        b.relFrom = lastTs - ((idx+1) * intervalMs);
        b.to = b.relTo+from;
        b.from = b.relFrom+from;
        b.values = [];
        bucketFrom = b.relFrom;
        targetEmptyBuckets.push(b);
        idx++;
      }

      targetEmptyBuckets.map((bucket, i) => {
        bucket.xid = i;
      });

      bucketMatrix.buckets[target] = targetEmptyBuckets;
    });

    //console.log ("bucketMatrix: ", bucketMatrix);
    
    // Put values into buckets.
    bucketMatrix.minValue = Number.MAX_VALUE;
    bucketMatrix.maxValue = Number.MIN_SAFE_INTEGER;
    targetKeys.map((target) => {
      targetIndex[target].map((dataIndex) => {
        let s = data[dataIndex];
        s.datapoints.map((dp: any) => {
          for (let i = 0; i < bucketMatrix.buckets[target].length; i++) {
            if (bucketMatrix.buckets[target][i].belong(dp[TIME_INDEX])) {
              bucketMatrix.buckets[target][i].put(dp[VALUE_INDEX]);
            }
          }
        });
      });
      bucketMatrix.buckets[target].map((bucket) => {
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

          bucket.value = this.panel.seriesFilterIndex != -1 ? bucket.values[this.panel.seriesFilterIndex] : bucket.maxValue;
        }
      })
    });

    bucketMatrix.xBucketSize = Number.MIN_SAFE_INTEGER;
    targetKeys.map((target) => {
      let bucketsLen: number = bucketMatrix.buckets[target].length;
      if (bucketsLen > bucketMatrix.xBucketSize) {
        bucketMatrix.xBucketSize = bucketsLen;
      }
    });

    //console.log ("bucketMatrix with values: ", bucketMatrix);

    bucketMatrix.targets = targetKeys;
    return bucketMatrix;
    this.bucketMatrix = bucketMatrix;
    
    // Collect all values for each bucket from datapoints with similar target.
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
}

export {
  StatusHeatmapCtrl, StatusHeatmapCtrl as PanelCtrl
};

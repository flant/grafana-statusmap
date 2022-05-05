// Libraries
import _ from 'lodash';
import { auto } from 'angular';

import { PanelEvents, DataFrame } from '@grafana/data';
import TimeSeries from 'grafana/app/core/time_series2';

import { config } from '@grafana/runtime';
import { DataProcessor } from './data_processor';

// Components
import './color_legend';
import { optionsEditorCtrl } from './options_editor';
import { tooltipEditorCtrl } from './tooltip_editor';
import { migratePanelConfig } from './panel_config_migration';

// Utils
import kbn from 'grafana/app/core/utils/kbn';
import { loadPluginCss, MetricsPanelCtrl } from 'grafana/app/plugins/sdk';

// Types
import { AnnotationsSrv } from 'grafana/app/features/annotations/annotations_srv';
import { Bucket, BucketMatrix, BucketMatrixPager } from './statusmap_data';
import rendering from './rendering';

import { ColorModeDiscrete } from './color_mode_discrete';
import { CoreEvents } from './util/grafana/events';

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
  { name: 'YlOrRd', value: 'interpolateYlOrRd', invert: 'dark' },
];

let colorModes = ['opacity', 'spectrum', 'discrete'];
let opacityScales = ['linear', 'sqrt'];

loadPluginCss({
  dark: 'plugins/flant-statusmap-panel/styles/dark.css',
  light: 'plugins/flant-statusmap-panel/styles/light.css',
});

class StatusHeatmapCtrl extends MetricsPanelCtrl {
  static templateUrl = 'module.html';

  data: any;
  bucketMatrix: BucketMatrix;
  bucketMatrixPager: BucketMatrixPager;

  graph: any;
  opacityScales: any = [];
  colorModes: any = [];
  colorSchemes: any = [];
  unitFormats: any;

  dataWarnings: { [warningId: string]: { title: string; tip: string } } = {};
  multipleValues: boolean;
  noColorDefined: boolean;
  noDatapoints: boolean;

  discreteExtraSeries: ColorModeDiscrete;

  annotations: object[] = [];
  annotationsPromise: any;

  // TODO remove this transient variable: use ng-model-options="{ getterSetter: true }"
  pageSizeViewer = 15;

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
      thresholds: [], // manual colors
    },
    // buckets settings
    cards: {
      cardMinWidth: 5,
      cardVSpacing: 2,
      cardHSpacing: 2,
      cardRound: null,
    },
    xAxis: {
      show: true,
    },
    yAxis: {
      show: true,
      minWidth: -1,
      maxWidth: -1,
    },
    tooltip: {
      show: true,
      freezeOnClick: true,
      showItems: false,
      items: [], // see tooltip_editor.ts
      showExtraInfo: false,
      extraInfo: '',
    },
    legend: {
      show: true,
    },
    yLabel: {
      usingSplitLabel: false,
      delimiter: '',
      labelTemplate: '',
    },
    // how null points should be handled
    nullPointMode: 'as empty',
    yAxisSort: 'metrics',
    highlightCards: true,
    useMax: true,

    seriesFilterIndex: -1,

    // Pagination options
    usingPagination: false,
    pageSize: 15,

    // Branding flag.
    hideBranding: false,
  };

  processor?: DataProcessor;

  /** @ngInject */
  constructor($scope: any, $injector: auto.IInjectorService, private annotationsSrv: AnnotationsSrv) {
    super($scope, $injector);

    // Grafana 7.2 workaround
    if (typeof kbn['intervalToMs'] === 'function') {
      kbn.interval_to_ms = kbn.intervalToMs;
    }

    migratePanelConfig(this.panel);
    _.defaultsDeep(this.panel, this.panelDefaults);

    this.bucketMatrix = new BucketMatrix();

    // Create pager for bucketMatrix and restore page size.
    this.bucketMatrixPager = new BucketMatrixPager();
    this.bucketMatrixPager.setEnable(this.panel.usingPagination);
    this.bucketMatrixPager.setDefaultPageSize(this.panel.pageSize);
    this.bucketMatrixPager.setPageSize(this.panel.pageSize);
    $scope.pager = this.bucketMatrixPager;

    this.opacityScales = opacityScales;
    this.colorModes = colorModes;
    this.colorSchemes = colorSchemes;

    // default graph width for discrete card width calculation
    this.graph = {
      chartWidth: -1,
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
      },
    };

    this.annotations = [];
    this.annotationsSrv = annotationsSrv;

    this.events.on(PanelEvents.render, this.onRender.bind(this));
    this.events.on(PanelEvents.dataError, this.onDataError.bind(this));
    this.events.on(PanelEvents.editModeInitialized, this.onInitEditMode.bind(this));
    this.events.on(PanelEvents.refresh, this.postRefresh.bind(this));
    // custom event from rendering.js
    this.events.on(CoreEvents.renderComplete, this.onRenderComplete.bind(this));

    this.onCardColorChange = this.onCardColorChange.bind(this);

    console.log('Grafana buildInfo:', config.buildInfo);

    const majorVersion = parseInt(config.buildInfo.version.split('.', 2)[0], 10);
    if (majorVersion >= 7) {
      // Support data frames for 7.0+
      (this as any).useDataFrames = true;
      this.events.on(PanelEvents.dataFramesReceived, this.onDataFramesReceived.bind(this));
      this.events.on(PanelEvents.dataSnapshotLoad, this.onDataFramesReceived.bind(this));
      this.processor = new DataProcessor(this.panel, majorVersion);
    } else {
      // Fallback to support only timeseries data format.
      this.events.on(PanelEvents.dataReceived, this.onDataReceived.bind(this));
      this.events.on(PanelEvents.dataSnapshotLoad, this.onDataReceived.bind(this));
    }
  }

  onRenderComplete(data: any): void {
    this.graph.chartWidth = data.chartWidth;
    this.renderingCompleted();
  }

  changeDefaultPaginationSize(defaultPageSize: number): void {
    this.bucketMatrixPager.setDefaultPageSize(defaultPageSize);
    this.bucketMatrixPager.setPageSize(defaultPageSize);
    this.pageSizeViewer = defaultPageSize;

    this.render();
    this.refresh();
  }

  onChangePageSize(): void {
    if (this.pageSizeViewer <= 0) {
      this.pageSizeViewer = this.bucketMatrixPager.defaultPageSize;
    }
    this.bucketMatrixPager.setPageSize(this.pageSizeViewer);
    this.bucketMatrixPager.setCurrent(0);

    this.render();
    this.refresh();
  }

  onPrevPage(): void {
    this.bucketMatrixPager.switchToPrev();
    this.render();
  }

  onNextPage(): void {
    this.bucketMatrixPager.switchToNext();
    this.render();
  }

  // getChartWidth returns an approximation of chart canvas width or
  // a saved value calculated during a render.
  getChartWidth(): number {
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
    const chartWidth = _.max([panelWidth - 200, panelWidth / 2]);

    return chartWidth!;
  }

  // Quick workaround for 6.7 and 7.0+. There is no call to
  // calculateInterval in updateTimeRange in those versions.
  // TODO ts type has no argument for this method.
  //
  updateTimeRange(datasource?: any) {
    // @ts-ignore
    let ret = super.updateTimeRange(datasource);
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
    let maxCardsCount = Math.ceil((chartWidth - minCardWidth) / (minCardWidth + minSpacing));

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
    // TODO is it needed?
    //this.xBucketsCount = Math.floor(rangeMs / intervalMs);
  }

  issueQueries(datasource: any) {
    // Grafana 8.1+: there is no updateTimeRange call before initial issueQueries.
    // https://github.com/grafana/grafana/commit/6f38883583c4c43af149f68db482b39a3240ec95
    if (!this.range) {
      this.updateTimeRange(datasource);
    }
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
    // @ts-ignore
    if ('undefined' !== typeof this.annotationsSrv.datasourcePromises) {
      // @ts-ignore
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

  onDataFramesReceived(data: DataFrame[]) {
    const dataList = this.processor.getSeriesList({
      dataList: data as DataFrame[],
      range: this.range,
    });
    this.onDataReceived(dataList);
  }

  onDataReceived(dataList: TimeSeries[]) {
    this.data = dataList;
    // Quick workaround for 7.0+. There is no call to
    // calculateInterval when enter Edit mode.
    if (!this.intervalMs) {
      this.calculateInterval();
    }

    let newBucketMatrix = this.convertDataToBuckets(
      dataList,
      this.range.from.valueOf(),
      this.range.to.valueOf(),
      this.intervalMs,
      true
    );

    this.bucketMatrix = newBucketMatrix;
    this.bucketMatrixPager.bucketMatrix = newBucketMatrix;
    if (newBucketMatrix.targets.length !== this.bucketMatrix.targets.length) {
      this.bucketMatrixPager.setCurrent(0);
    }

    this.noDatapoints = this.bucketMatrix.noDatapoints;

    if (this.annotationsPromise) {
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
    } else {
      this.loading = false;
      this.annotations = [];
      this.render();
    }
  }

  onInitEditMode() {
    this.addEditorTab('Options', optionsEditorCtrl, 2);
    this.addEditorTab('Tooltip', tooltipEditorCtrl, 3);
    this.addEditorTab('About', 'public/plugins/flant-statusmap-panel/partials/about_editor.html', 4);
    this.unitFormats = kbn.getUnitFormats();
  }

  // onRender will be called before StatusmapRenderer.onRender.
  // Decide if warning should be displayed over cards.
  onRender() {
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
      if (this.panel.seriesFilterIndex === -1) {
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

  link(scope, elem, attrs, ctrl) {
    rendering(scope, elem, attrs, ctrl);
  }

  // Compatible with Grafana 7.0 overrides feature.
  retrieveTimeVar() {
    var time = this.timeSrv.timeRangeForUrl();
    return 'from=' + time.from + '&to=' + time.to;
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
  convertDataToBuckets(
    data: any,
    from: number,
    to: number,
    intervalMs: number,
    mostRecentBucket: boolean
  ): BucketMatrix {
    let bucketMatrix = new BucketMatrix();
    bucketMatrix.rangeMs = to - from;
    bucketMatrix.intervalMs = intervalMs;

    if (!data || data.length === 0) {
      // Mimic heatmap and graph 'no data' labels.
      bucketMatrix.targets = ['1.0', '0.0', '-1.0'];
      bucketMatrix.buckets['1.0'] = [];
      bucketMatrix.buckets['0.0'] = [];
      bucketMatrix.buckets['-1.0'] = [];
      bucketMatrix.xBucketSize = 42;
      bucketMatrix.noDatapoints = true;
      return bucketMatrix;
    }

    let targetIndex: { [target: string]: number[] } = {};
    let targetPartials: { [target: string]: string[] } = {};

    // Group indicies of elements in data by target (y label).

    // lodash version:
    //_.map(data, (d, i) => {
    //  targetIndex[d.target] = _.concat(_.toArray(targetIndex[d.target]), i);
    //});

    data.map((queryResult: any, i: number) => {
      // Init yLabel as the query target
      let yLabel = queryResult.target;

      // Check if there is some labelTemplate configured
      if (this.panel.yLabel.usingSplitLabel && this.panel.yLabel.delimiter !== '') {
        let pLabels = queryResult.target.split(this.panel.yLabel.delimiter);

        // Load all possible values as scoped vars and load them into targetPartials
        // to be used on different components as Bucket and BucketMatrix props
        let scopedVars = [];
        scopedVars[`__y_label`] = { value: yLabel };
        for (let i in pLabels) {
          scopedVars[`__y_label_${i}`] = { value: pLabels[i] };
        }

        if (this.panel.yLabel.labelTemplate !== '') {
          yLabel = this.templateSrv.replace(this.panel.yLabel.labelTemplate, scopedVars);
        }

        targetPartials[yLabel] = pLabels;
      }

      //reset if it already exists
      if (!targetIndex.hasOwnProperty(yLabel)) {
        targetIndex[yLabel] = [];
      }
      targetIndex[yLabel].push(i);
    });

    let targetKeys = _.keys(targetIndex);

    //console.log ("targetIndex: ", targetIndex, "targetKeys: ", targetKeys);

    let targetTimestampRanges: { [target: string]: { [timestamp: number]: number[] } } = {};

    // Collect all timestamps for each target.
    // Make map timestamp => [from, to]. from == previous ts, to == ts from datapoint.
    targetKeys.map(target => {
      let targetTimestamps: any[] = [];

      for (let si = 0; si < targetIndex[target].length; si++) {
        let s = data[targetIndex[target][si]];
        _.map(s.datapoints, (datapoint, idx) => {
          targetTimestamps.push(datapoint[TIME_INDEX] - from);
        });
      }

      //console.log("timestamps['"+target+"'] = ", targetTimestamps);

      targetTimestamps = _.uniq(targetTimestamps);

      //console.log("uniq timestamps['"+target+"'] = ", targetTimestamps);

      targetTimestampRanges[target] = [];
      for (let i = targetTimestamps.length - 1; i >= 0; i--) {
        let tsTo = targetTimestamps[i];
        let tsFrom = 0;
        if (tsTo < 0) {
          tsFrom = tsTo - intervalMs;
        } else {
          if (i - 1 >= 0) {
            // Set from to previous timestamp + 1ms;
            tsFrom = targetTimestamps[i - 1] + 1;
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
    targetKeys.map(target => {
      let targetEmptyBuckets: any[] = [];

      let lastTs = to - from;

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
        topBucket.to = topBucket.relTo + from;
        topBucket.from = topBucket.relFrom + from;
        targetEmptyBuckets.push(topBucket);
      }

      let idx = 0;
      let bucketFrom = 0;
      while (bucketFrom >= 0) {
        let b = new Bucket();
        b.yLabel = target;
        b.pLabels = targetPartials[target];
        b.relTo = lastTs - idx * intervalMs;
        b.relFrom = lastTs - (idx + 1) * intervalMs;
        b.to = b.relTo + from;
        b.from = b.relFrom + from;
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
    targetKeys.map(target => {
      targetIndex[target].map(dataIndex => {
        let s = data[dataIndex];
        s.datapoints.map((dp: any) => {
          for (let i = 0; i < bucketMatrix.buckets[target].length; i++) {
            if (bucketMatrix.buckets[target][i].belong(dp[TIME_INDEX])) {
              bucketMatrix.buckets[target][i].put(dp[VALUE_INDEX]);
            }
          }
        });
      });
      bucketMatrix.buckets[target].map(bucket => {
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

          bucket.value =
            this.panel.seriesFilterIndex !== -1 ? bucket.values[this.panel.seriesFilterIndex] : bucket.maxValue;
        }
      });
    });

    bucketMatrix.xBucketSize = Number.MIN_SAFE_INTEGER;
    targetKeys.map(target => {
      let bucketsLen: number = bucketMatrix.buckets[target].length;
      if (bucketsLen > bucketMatrix.xBucketSize) {
        bucketMatrix.xBucketSize = bucketsLen;
      }
    });

    //console.log ("bucketMatrix with values: ", bucketMatrix);

    bucketMatrix.targets = targetKeys;
    bucketMatrix.pLabels = targetPartials;
    return bucketMatrix;
  }
}

export { StatusHeatmapCtrl, StatusHeatmapCtrl as PanelCtrl };

import { MetricsPanelCtrl } from 'app/plugins/sdk';
import _ from 'lodash';
import { contextSrv } from 'app/core/core';
import kbn from 'app/core/utils/kbn';

import rendering from './rendering';
// import aggregates, { aggregatesMap } from './aggregates';
// import fragments, { fragmentsMap } from './fragments';
// import { labelFormats } from './xAxisLabelFormats';
import {statusHeatmapOptionsEditor} from './options_editor';
import {ColorModeDiscrete} from "./color_mode_discrete";
import './css/status-heatmap.css!';

const CANVAS = 'CANVAS';
const SVG = 'SVG';
const VALUE_INDEX = 0,
      TIME_INDEX = 1;

const panelDefaults = {
  // aggregate: aggregates.AVG,
  // fragment: fragments.HOUR,
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
  cards: {
    cardMinWidth: 5,
    cardSpacing: 2,
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
  highlightCards: true,
  useMax: true
};

const renderer = CANVAS;

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
  { name: 'YlOrRd', value: 'interpolateYlOrRd', invert: 'darm' }
];

let colorModes = ['opacity', 'spectrum', 'discrete'];
let opacityScales = ['linear', 'sqrt'];

export class StatusHeatmapCtrl extends MetricsPanelCtrl {
  static templateUrl = 'module.html';

  constructor($scope, $injector, $rootScope, timeSrv) {
    super($scope, $injector);
    _.defaultsDeep(this.panel, panelDefaults);

    this.opacityScales = opacityScales;
    this.colorModes = colorModes;
    this.colorSchemes = colorSchemes;

    // default graph width for discrete card width calculation
    this.graph = {
      "chartWidth" : -1
    };

    this.multipleValues = false;
    this.noColorDefined = false;

    this.discreteHelper = new ColorModeDiscrete($scope);

    this.dataWarnings = {
      "noColorDefined": {
        title: 'Data has value with undefined color',
        tip: 'Check metric values, color values or define a new color',
      },
      "multipleValues": {
        title: 'Data has multiple values for one target',
        tip: 'Change targets definitions or set "use max value"',
      }
    };

    this.events.on('data-received', this.onDataReceived);
    this.events.on('data-snapshot-load', this.onDataReceived);
    this.events.on('data-error', this.onDataError);
    this.events.on('init-edit-mode', this.onInitEditMode);
    this.events.on('render', this.onRender);
    this.events.on('refresh', this.postRefresh);
    this.events.on('render-complete', this.onRenderComplete);
  }

  onRenderComplete = (data) => {
    this.graph.chartWidth = data.chartWidth;
  };

  // override calculateInterval for discrete color mode
  calculateInterval = () => {
    let panelWidth = Math.ceil($(window).width() * (this.panel.gridPos.w / 24));
    // approximate chartWidth because y axis ticks not rendered yet on first data receive.
    let chartWidth = _.max([
        panelWidth - 200,
        panelWidth/2
      ]);

    let minCardWidth = this.panel.cards.cardMinWidth;
    let minSpacing = this.panel.cards.cardSpacing;
    let maxCardsCount = Math.ceil((chartWidth-minCardWidth) / (minCardWidth + minSpacing));

    let intervalMs;
    let rangeMs = this.range.to.valueOf() - this.range.from.valueOf();

    // this is minimal interval! kbn.round_interval will lower it.
    intervalMs = this.discreteHelper.roundIntervalCeil(rangeMs / maxCardsCount);

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

    this.intervalMs = intervalMs;
    this.interval = kbn.secondsToHms(intervalMs / 1000);
  };

  onDataReceived = (dataList) => {
    this.data      = dataList;
    this.cardsData = this.convertToCards(this.data);

    this.render();
  };

  onInitEditMode = () => {
    this.addEditorTab('Options', statusHeatmapOptionsEditor, 2);
    this.unitFormats = kbn.getUnitFormats();
  };

  onRender = () => {
    if (!this.data) { return; }

    this.multipleValues = false;
    if (!this.panel.useMax) {
      if (this.cardsData) {
        this.multipleValues = this.cardsData.multipleValues;
      }
    }

    this.noColorDefined = false;
    if (this.panel.color.mode === 'discrete') {
      this.discreteHelper.updateCardsValuesHasColorInfo();
      if (this.cardsData) {
        this.noColorDefined = this.cardsData.noColorDefined;
      }
    }
  };

  onCardColorChange = (newColor) => {
    this.panel.color.cardColor = newColor;
    this.render();
  };

  onDataError = () => {
    this.data = [];
    this.render();
  };

  postRefresh = () => {
    this.noColorDefined = false;
  };

  onEditorAddThreshold = () => {
    this.panel.color.thresholds.push({ color: this.panel.defaultColor });
    this.render();
  };

  onEditorRemoveThreshold = (index) => {
    this.panel.color.thresholds.splice(index, 1);
    this.render();
  };

  onEditorAddThreeLights = () => {
    this.panel.color.thresholds.push({color: "red", value: 2, tooltip: "error" });
    this.panel.color.thresholds.push({color: "yellow", value: 1, tooltip: "warning" });
    this.panel.color.thresholds.push({color: "green", value: 0, tooltip: "ok" });
    this.render();
  };

  link = (scope, elem, attrs, ctrl) => {
    rendering(scope, elem, attrs, ctrl);
  };

  // group values into buckets by target
  convertToCards = (data) => {
    let cardsData = {
      cards: [],
      xBucketSize: 0,
      yBucketSize: 0,
      maxValue: 0,
      minValue: 0,
      multipleValues: false,
      noColorDefined: false,
    };

    if (!data || data.length == 0) { return cardsData;}

    // collect uniq targets and their indexes in data array
    cardsData.targetIndex = {};
    for (let i = 0; i < data.length; i++) {
      let ts = data[i];
      let target = ts.target;
      if (cardsData.targetIndex[target] == undefined) {
        cardsData.targetIndex[target] = []
      }
      cardsData.targetIndex[target].push(i);
    }

    // TODO add some logic for targets heirarchy
    cardsData.targets = _.keys(cardsData.targetIndex);
    cardsData.targets.sort();
    cardsData.yBucketSize = cardsData.targets.length;
    cardsData.xBucketSize = _.min(_.map(data, d => d.datapoints.length));

    // Collect all values for each bucket from datapoints with similar target.
    for(let i = 0; i < cardsData.targets.length; i++) {
      let target = cardsData.targets[i];

      for (let j = 0; j < cardsData.xBucketSize; j++) {
        let card = {
          id: i*cardsData.xBucketSize + j,
          values: [],
          multipleValues: false,
          noColorDefined: false,
        };

        // collect values from all timeseries with target
        for (let si = 0; si < cardsData.targetIndex[target].length; si++) {
          let s = data[cardsData.targetIndex[target][si]];
          let datapoint = s.datapoints[j];
          if (card.values.length === 0) {
            card.x = datapoint[TIME_INDEX];
            card.y = s.target;
          }
          card.values.push(datapoint[VALUE_INDEX]);
        }
        card.minValue = _.min(card.values);
        card.maxValue = _.max(card.values);
        if (card.values.length > 1) {
          cardsData.multipleValues = true;
          card.multipleValues = true;
          card.value = card.maxValue; // max value by default
        } else {
          card.value = card.maxValue; // max value by default
        }

        if (cardsData.maxValue < card.maxValue)
          cardsData.maxValue = card.maxValue;

        if (cardsData.minValue > card.minValue)
          cardsData.minValue = card.minValue;

        cardsData.cards.push(card);
      }
    }

    return cardsData;
  };
}

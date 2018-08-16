import { MetricsPanelCtrl } from 'app/plugins/sdk';
import _ from 'lodash';
import { contextSrv } from 'app/core/core';
import kbn from 'app/core/utils/kbn';

import rendering from './rendering';
// import aggregates, { aggregatesMap } from './aggregates';
// import fragments, { fragmentsMap } from './fragments';
// import { labelFormats } from './xAxisLabelFormats';
// import canvasRendering from './canvas/rendering';
import {statusHeatmapOptionsEditor} from './options_editor';
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
    colorScheme: 'interpolateGnYlRd'
  },
  cards: {
    cardPadding: null,
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
  nullPointMode: 'null',
  highlightCards: true
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

let colorModes = ['opacity', 'spectrum'];
let opacityScales = ['linear', 'sqrt'];

export class StatusHeatmapCtrl extends MetricsPanelCtrl {
  static templateUrl = 'module.html';

  constructor($scope, $injector, $rootScope, timeSrv) {
    super($scope, $injector);
    _.defaultsDeep(this.panel, panelDefaults);

    this.opacityScales = opacityScales;
    this.colorModes = colorModes;
    this.colorSchemes = colorSchemes;

    this.events.on('data-received', this.onDataReceived);
    this.events.on('data-snapshot-load', this.onDataReceived);
    this.events.on('data-error', this.onDataError);
    this.events.on('init-edit-mode', this.onInitEditMode);
    this.events.on('render', this.onRender);
  }

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
  };

  onCardColorChange = (newColor) => {
    this.panel.color.cardColor = newColor;
    this.render();
  };

  onDataError = () => {
    this.data = [];
    this.render();
  };

  link = (scope, elem, attrs, ctrl) => {
    console.log('LINK');
    rendering(scope, elem, attrs, ctrl);
    // switch (renderer) {
    //   case CANVAS: {
    //     canvasRendering(scope, elem, attrs, ctrl);
    //     break;
    //   }
    //   case SVG: {
    //     svgRendering(scope, elem, attrs, ctrl);
    //     break;
    //   }
    // }
  };

  convertToCards = (data) => {
    let cardsData = { cards: [], xBucketSize: 0, yBucketSize: 0, maxValue: 0, minValue: 0 };

    if (!data || data.length == 0) { return cardsData;}

    cardsData.yBucketSize = data.length;
    cardsData.xBucketSize = _.min(_.map(data, d => d.datapoints.length));

    for(let i = 0; i < cardsData.yBucketSize; i++) {
      let s = data[i];

      for (let j = 0; j < cardsData.xBucketSize; j++) {
        let card = {};
        let v = s.datapoints[j];

        card.x     = v[TIME_INDEX];
        card.y     = s.target;
        card.value = v[VALUE_INDEX];

        if (cardsData.maxValue < card.value)
          cardsData.maxValue = card.value;

        if (cardsData.minValue > card.value)
          cardsData.minValue = card.value;

        cardsData.cards.push(card);
      }
    }

    return cardsData;
  };
}

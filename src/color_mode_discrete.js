import _ from 'lodash';

// Helper methods to handle discrete color mode
export class ColorModeDiscrete {
  constructor(scope) {
    this.scope = scope;
    this.panelCtrl = scope.ctrl;
    this.panel = scope.ctrl.panel;
  }

  // get tooltip for each value ordered by thresholds priority
  convertValuesToTooltips(values) {
    let thresholds = this.panel.color.thresholds;
    let tooltips = [];

    for (let i = 0; i < thresholds.length; i++) {
      for (let j = 0; j < values.length; j++) {
        if (values[j] == thresholds[i].value) {
          tooltips.push({
            "tooltip": thresholds[i].tooltip?thresholds[i].tooltip:values[j],
            "color": thresholds[i].color
          });
        }
      }
    }
    return tooltips;
  }


  getNotMatchedValues(values) {
    let notMatched = [];
    for (let j = 0; j < values.length; j++) {
      if (!this.getMatchedThreshold(values[j])) {
        notMatched.push(values[j]);
      }
    }
    return notMatched;
  }

  getNotColoredValues(values) {
    let notMatched = [];
    for (let j = 0; j < values.length; j++) {
      let threshold = this.getMatchedThreshold(values[j]);
      if (!threshold || !threshold.color || threshold.color == "") {
        notMatched.push(values[j]);
      }
    }
    return notMatched;
  }


  getDiscreteColor(index) {
    let color = this.getThreshold(index).color;
    if (!color || color == "") {
      return 'rgba(0,0,0,1)';
    }
    return color;
  }

  // returns color from first matched thresold in order from 0 to thresholds.length
  getBucketColor(values) {
    let thresholds = this.panel.color.thresholds;

    for (let i = 0; i < thresholds.length; i++) {
      for (let j = 0; j < values.length; j++) {
        if (values[j] == thresholds[i].value) {
          return this.getDiscreteColor(i);
        }
      }
    }
    return 'rgba(0,0,0,1)';
  }

  updateCardsValuesHasColorInfo() {
    if (!this.panelCtrl.cardsData) {
      return
    }
    this.panelCtrl.cardsData.noColorDefined = false;
    let cards = this.panelCtrl.cardsData.cards;
    for (let i=0; i<cards.length; i++) {
      cards[i].noColorDefined = false;
      let values = cards[i].values;
      for (let j=0; j<values.length; j++) {
        let threshold = this.getMatchedThreshold(values[j]);
        if (!threshold || !threshold.color || threshold.color == "") {
          cards[i].noColorDefined = true;
          this.panelCtrl.cardsData.noColorDefined = true;
          break;
        }
      }
    }
  }

  getMatchedThreshold(value) {
    if (value == null) {
      if (this.panel.color.nullPointMode == 'as empty') {
        // FIXME: make this explicit for user
        // Right now this color never used because null as empty handles in getCardOpacity method.
        return {
          "color": "rgba(0,0,0,0)",
          "value": "null",
          "tooltip": "null",
        }
      } else {
        value = 0;
      }
    }

    let thresholds = this.panel.color.thresholds;
    for (let k = 0; k < thresholds.length; k++) {
      if (value == thresholds[k].value) {
        return thresholds[k];
      }
    }
    return null;
  }

  getThreshold(index) {
    let thresholds = this.panel.color.thresholds;
    if (index < 0 || index >= thresholds.length == null) {
      return {
        "color": "rgba(0,0,0,0)",
        "value": "null",
        "tooltip": "null",
      }
    }
    return thresholds[index];
  }

  roundIntervalCeil(interval) {
    switch (true) {
      case interval <= 10:
        return 10; // 0.01s
      case interval <= 20:
        return 20; // 0.02s
      case interval <= 50:
        return 50; // 0.05s
      case interval <= 100:
        return 100; // 0.1s
      case interval <= 200:
        return 200; // 0.2s
      case interval <= 500:
        return 500; // 0.5s
      case interval <= 1000:
        return 1000; // 1s
      case interval <= 2000:
        return 2000; // 2s
      case interval <= 5000:
        return 5000; // 5s
      case interval <= 10000:
        return 10000; // 10s
      case interval <= 15000:
        return 15000; // 15s
      case interval <= 20000:
        return 20000; // 20s
      case interval <= 30000:
        return 30000; // 30s
      case interval <= 60000:
        return 60000; // 1m
      case interval <= 120000:
        return 120000; // 2m
      case interval <= 300000:
        return 300000; // 5m
      case interval <= 600000:
        return 600000; // 10m
      case interval <= 900000:
        return 900000; // 15m
      case interval <= 1200000:
        return 1200000; // 20m
      case interval <= 1800000:
        return 1800000; // 30m
      case interval <= 3600000:
        return 3600000; // 1h
      case interval <= 7200000:
        return 7200000; // 2h
      case interval <= 10800000:
        return 10800000; // 3h
      case interval <= 21600000:
        return 21600000; // 6h
      case interval <= 43200000:
        return 43200000; // 12h
      case interval <= 86400000:
        return 86400000; // 1d
      case interval <= 604800000:
        return 604800000; // 1w
      case interval <= 2592000000:
        return 2592000000; // 30d
      default:
        return 31536000000; // 1y
    }
  }
}

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
            "tooltip": thresholds[i].tooltip,
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

  getDiscreteColorScale() {
    return (d) => {
      let threshold = this.getMatchedThreshold(d);
      if (!threshold) {
        // Error if value not in thresholds
        return 'rgba(0,0,0,1)';
      }
      else {
        return threshold.color;
      }
    };
  }

  updateCardsValuesHasColorInfo() {
    let cards = this.panelCtrl.cardsData.cards;
    for (let i=0; i<cards.length; i++) {
      let values = cards[i].values;
      for (let j=0; j<values.length; j++) {
        if (!this.getMatchedThreshold(values[j])) {
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
}

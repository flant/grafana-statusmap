"use strict";

System.register([], function (_export, _context) {
  "use strict";

  var ColorModeDiscrete;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  return {
    setters: [],
    execute: function () {
      // Extra Series methods to handle discrete color mode
      _export("ColorModeDiscrete", ColorModeDiscrete =
      /*#__PURE__*/
      function () {
        function ColorModeDiscrete(scope) {
          _classCallCheck(this, ColorModeDiscrete);

          _defineProperty(this, "scope", void 0);

          _defineProperty(this, "panelCtrl", void 0);

          _defineProperty(this, "panel", void 0);

          this.scope = scope;
          this.panelCtrl = scope.ctrl;
          this.panel = scope.ctrl.panel;
        } // get tooltip for each value ordered by thresholds priority


        _createClass(ColorModeDiscrete, [{
          key: "convertValuesToTooltips",
          value: function convertValuesToTooltips(values) {
            var thresholds = this.panel.color.thresholds;
            var tooltips = [];

            for (var i = 0; i < thresholds.length; i++) {
              for (var j = 0; j < values.length; j++) {
                if (values[j] == thresholds[i].value) {
                  tooltips.push({
                    "tooltip": thresholds[i].tooltip ? thresholds[i].tooltip : values[j],
                    "color": thresholds[i].color
                  });
                }
              }
            }

            return tooltips;
          }
        }, {
          key: "convertValueToTooltips",
          value: function convertValueToTooltips(values) {
            var thresholds = this.panel.color.thresholds;
            var tooltips = [];

            for (var i = 0; i < thresholds.length; i++) {
              //for (let j = 0; j < values.length; j++) {
              if (values == thresholds[i].value) {
                tooltips.push({
                  "tooltip": thresholds[i].tooltip ? thresholds[i].tooltip : values,
                  "color": thresholds[i].color
                }); //}
              }
            }

            return tooltips;
          }
        }, {
          key: "getNotMatchedValues",
          value: function getNotMatchedValues(values) {
            var notMatched = [];

            for (var j = 0; j < values.length; j++) {
              if (!this.getMatchedThreshold(values[j])) {
                notMatched.push(values[j]);
              }
            }

            return notMatched;
          }
        }, {
          key: "getNotColoredValues",
          value: function getNotColoredValues(values) {
            var notMatched = [];

            for (var j = 0; j < values.length; j++) {
              var threshold = this.getMatchedThreshold(values[j]);

              if (!threshold || !threshold.color || threshold.color == "") {
                notMatched.push(values[j]);
              }
            }

            return notMatched;
          }
        }, {
          key: "getDiscreteColor",
          value: function getDiscreteColor(index) {
            var color = this.getThreshold(index).color;

            if (!color || color == "") {
              return 'rgba(0,0,0,1)';
            }

            return color;
          }
        }, {
          key: "getBucketColorSingle",
          value: function getBucketColorSingle(value) {
            //let thresholds = this.panel.color.thresholds;
            if (value == null) {
              // treat as null value
              return 'rgba(0,0,0,1)'; //return this.getMatchedThreshold(null).color;
            }

            var threshold = this.getMatchedThreshold(value);

            if (!threshold || !threshold.color || threshold.color == "") {
              return 'rgba(0,0,0,1)';
            } else {
              return threshold.color;
            }
          } // returns color from first matched thresold in order from 0 to thresholds.length

        }, {
          key: "getBucketColor",
          value: function getBucketColor(values) {
            var thresholds = this.panel.color.thresholds;

            if (!values || values.length == 0) {
              // treat as null value
              return this.getMatchedThreshold(null).color;
            }

            if (values.length == 1) {
              var threshold = this.getMatchedThreshold(values[0]);

              if (!threshold || !threshold.color || threshold.color == "") {
                return 'rgba(0,0,0,1)';
              } else {
                return threshold.color;
              }
            }

            var isAllValuesNulls = true;

            for (var j = 0; j < values.length; j++) {
              if (values[j] != null) {
                isAllValuesNulls = false;
              }
            }

            if (isAllValuesNulls) {
              return this.getMatchedThreshold(null).color;
            }

            for (var i = 0; i < thresholds.length; i++) {
              for (var _j = 0; _j < values.length; _j++) {
                if (values[_j] == thresholds[i].value) {
                  return this.getDiscreteColor(i);
                }
              }
            }

            return 'rgba(0,0,0,1)';
          }
        }, {
          key: "updateCardsValuesHasColorInfoSingle",
          value: function updateCardsValuesHasColorInfoSingle() {
            if (!this.panelCtrl.cardsData) {
              return;
            }

            this.panelCtrl.cardsData.noColorDefined = false;
            var cards = this.panelCtrl.cardsData.cards;

            for (var i = 0; i < cards.length; i++) {
              cards[i].noColorDefined = false;
              var values = cards[i].value;
              var threshold = this.getMatchedThreshold(values);

              if (!threshold || !threshold.color || threshold.color == "") {
                cards[i].noColorDefined = true;
                this.panelCtrl.cardsData.noColorDefined = true;
              }
            }
          }
        }, {
          key: "updateCardsValuesHasColorInfo",
          value: function updateCardsValuesHasColorInfo() {
            if (!this.panelCtrl.cardsData) {
              return;
            }

            this.panelCtrl.cardsData.noColorDefined = false;
            var cards = this.panelCtrl.cardsData.cards;

            for (var i = 0; i < cards.length; i++) {
              cards[i].noColorDefined = false;
              var values = cards[i].values;

              for (var j = 0; j < values.length; j++) {
                var threshold = this.getMatchedThreshold(values[j]);

                if (!threshold || !threshold.color || threshold.color == "") {
                  cards[i].noColorDefined = true;
                  this.panelCtrl.cardsData.noColorDefined = true;
                  break;
                }
              }
            }
          }
        }, {
          key: "getMatchedThreshold",
          value: function getMatchedThreshold(value) {
            if (value == null) {
              if (this.panel.nullPointMode == 'as empty') {
                // FIXME: make this explicit for user
                // Right now this color never used because null as empty handles in getCardOpacity method.
                return {
                  "color": "rgba(0,0,0,0)",
                  "value": "null",
                  "tooltip": "null"
                };
              } else {
                value = 0;
              }
            }

            var thresholds = this.panel.color.thresholds;

            for (var k = 0; k < thresholds.length; k++) {
              if (value == thresholds[k].value) {
                return thresholds[k];
              }
            }

            return null;
          }
        }, {
          key: "getThreshold",
          value: function getThreshold(index) {
            var thresholds = this.panel.color.thresholds;

            if (index < 0 || index >= thresholds.length == null) {
              return {
                "color": "rgba(0,0,0,0)",
                "value": "null",
                "tooltip": "null"
              };
            }

            return thresholds[index];
          }
        }, {
          key: "roundIntervalCeil",
          value: function roundIntervalCeil(interval) {
            switch (true) {
              case interval <= 10:
                return 10;
              // 0.01s

              case interval <= 20:
                return 20;
              // 0.02s

              case interval <= 50:
                return 50;
              // 0.05s

              case interval <= 100:
                return 100;
              // 0.1s

              case interval <= 200:
                return 200;
              // 0.2s

              case interval <= 500:
                return 500;
              // 0.5s

              case interval <= 1000:
                return 1000;
              // 1s

              case interval <= 2000:
                return 2000;
              // 2s

              case interval <= 5000:
                return 5000;
              // 5s

              case interval <= 10000:
                return 10000;
              // 10s

              case interval <= 15000:
                return 15000;
              // 15s

              case interval <= 20000:
                return 20000;
              // 20s

              case interval <= 30000:
                return 30000;
              // 30s

              case interval <= 60000:
                return 60000;
              // 1m

              case interval <= 120000:
                return 120000;
              // 2m

              case interval <= 300000:
                return 300000;
              // 5m

              case interval <= 600000:
                return 600000;
              // 10m

              case interval <= 900000:
                return 900000;
              // 15m

              case interval <= 1200000:
                return 1200000;
              // 20m

              case interval <= 1800000:
                return 1800000;
              // 30m

              case interval <= 3600000:
                return 3600000;
              // 1h

              case interval <= 7200000:
                return 7200000;
              // 2h

              case interval <= 10800000:
                return 10800000;
              // 3h

              case interval <= 21600000:
                return 21600000;
              // 6h

              case interval <= 43200000:
                return 43200000;
              // 12h

              case interval <= 86400000:
                return 86400000;
              // 1d

              case interval <= 604800000:
                return 604800000;
              // 1w

              case interval <= 2592000000:
                return 2592000000;
              // 30d

              default:
                return 31536000000;
              // 1y
            }
          }
        }]);

        return ColorModeDiscrete;
      }());
    }
  };
});
//# sourceMappingURL=color_mode_discrete.js.map

"use strict";

System.register(["d3", "jquery", "lodash"], function (_export, _context) {
  "use strict";

  var d3, $, _, TOOLTIP_PADDING_X, TOOLTIP_PADDING_Y, StatusmapTooltip;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  return {
    setters: [function (_d) {
      d3 = _d.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      TOOLTIP_PADDING_X = 30;
      TOOLTIP_PADDING_Y = 5;

      _export("StatusmapTooltip", StatusmapTooltip =
      /*#__PURE__*/
      function () {
        function StatusmapTooltip(elem, scope) {
          _classCallCheck(this, StatusmapTooltip);

          _defineProperty(this, "tooltip", void 0);

          _defineProperty(this, "scope", void 0);

          _defineProperty(this, "dashboard", void 0);

          _defineProperty(this, "panelCtrl", void 0);

          _defineProperty(this, "panel", void 0);

          _defineProperty(this, "heatmapPanel", void 0);

          _defineProperty(this, "mouseOverBucket", void 0);

          _defineProperty(this, "originalFillColor", void 0);

          this.scope = scope;
          this.dashboard = scope.ctrl.dashboard;
          this.panelCtrl = scope.ctrl;
          this.panel = scope.ctrl.panel;
          this.heatmapPanel = elem;
          this.mouseOverBucket = false;
          this.originalFillColor = null;
          elem.on("mouseover", this.onMouseOver.bind(this));
          elem.on("mouseleave", this.onMouseLeave.bind(this));
        }

        _createClass(StatusmapTooltip, [{
          key: "onMouseOver",
          value: function onMouseOver(e) {
            if (!this.panel.tooltip.show || !this.scope.ctrl.data || _.isEmpty(this.scope.ctrl.data)) {
              return;
            }

            if (!this.tooltip) {
              this.add();
              this.move(e);
            }
          }
        }, {
          key: "onMouseLeave",
          value: function onMouseLeave() {
            this.destroy();
          }
        }, {
          key: "onMouseMove",
          value: function onMouseMove(e) {
            if (!this.panel.tooltip.show) {
              return;
            }

            this.move(e);
          }
        }, {
          key: "add",
          value: function add() {
            this.tooltip = d3.select("body").append("div").attr("class", "statusmap-tooltip graph-tooltip grafana-tooltip");
          }
        }, {
          key: "destroy",
          value: function destroy() {
            if (this.tooltip) {
              this.tooltip.remove();
            }

            this.tooltip = null;
          }
        }, {
          key: "show",
          value: function show(pos) {
            if (!this.panel.tooltip.show || !this.tooltip) {
              return;
            } // shared tooltip mode


            if (pos.panelRelY) {
              return;
            }

            var cardId = d3.select(pos.target).attr('cardId');

            if (!cardId) {
              this.destroy();
              return;
            }

            var card = this.panelCtrl.cardsData.cards[cardId];

            if (!card) {
              this.destroy();
              return;
            }

            var x = card.x;
            var y = card.y;
            var value = card.value;
            var values = card.values;
            var tooltipTimeFormat = 'YYYY-MM-DD HH:mm:ss';
            var time = this.dashboard.formatDate(+x, tooltipTimeFormat);
            var tooltipHtml = "<div class=\"graph-tooltip-time\">".concat(time, "</div>\n      <div class=\"statusmap-histogram\"></div>");
            var statuses;

            if (this.panel.color.mode === 'discrete') {
              if (this.panel.seriesFilterIndex > 0) {
                statuses = this.panelCtrl.discreteExtraSeries.convertValueToTooltips(value);
              } else {
                statuses = this.panelCtrl.discreteExtraSeries.convertValuesToTooltips(values);
              }

              var statusesHtml = '';

              if (statuses.length === 1) {
                statusesHtml = "status:";
              } else if (statuses.length > 1) {
                statusesHtml = "statuses:";
              }

              tooltipHtml += "\n      <div>\n        name: <b>".concat(y, "</b> <br>\n        ").concat(statusesHtml, "\n        <ul>\n          ").concat(_.join(_.map(statuses, function (v) {
                return "<li style=\"background-color: ".concat(v.color, "\" class=\"discrete-item\">").concat(v.tooltip, "</li>");
              }), ""), "\n        </ul>\n      </div>");
            } else {
              if (values.length === 1) {
                tooltipHtml += "<div> \n      name: <b>".concat(y, "</b> <br>\n      value: <b>").concat(value, "</b> <br>\n      </div>");
              } else {
                tooltipHtml += "<div>\n      name: <b>".concat(y, "</b> <br>\n      values:\n      <ul>\n        ").concat(_.join(_.map(values, function (v) {
                  return "<li>".concat(v, "</li>");
                }), ""), "\n      </ul>\n      </div>");
              }
            } //   "Ambiguous bucket state: Multiple values!";


            if (!this.panel.useMax && card.multipleValues) {
              tooltipHtml += "<div><b>Error:</b> ".concat(this.panelCtrl.dataWarnings.multipleValues.title, "</div>");
            } // Discrete mode errors


            if (this.panel.color.mode === 'discrete') {
              if (card.noColorDefined) {
                var badValues = this.panelCtrl.discreteExtraSeries.getNotColoredValues(values);
                tooltipHtml += "<div><b>Error:</b> ".concat(this.panelCtrl.dataWarnings.noColorDefined.title, "\n        <br>not colored values:\n        <ul>\n          ").concat(_.join(_.map(badValues, function (v) {
                  return "<li>".concat(v, "</li>");
                }), ""), "\n        </ul>\n        </div>");
              }
            }

            this.tooltip.html(tooltipHtml);
            this.move(pos);
          }
        }, {
          key: "move",
          value: function move(pos) {
            if (!this.tooltip) {
              return;
            }

            var elem = $(this.tooltip.node())[0];
            var tooltipWidth = elem.clientWidth;
            var tooltipHeight = elem.clientHeight;
            var left = pos.pageX + TOOLTIP_PADDING_X;
            var top = pos.pageY + TOOLTIP_PADDING_Y;

            if (pos.pageX + tooltipWidth + 40 > window.innerWidth) {
              left = pos.pageX - tooltipWidth - TOOLTIP_PADDING_X;
            }

            if (pos.pageY - window.pageYOffset + tooltipHeight + 20 > window.innerHeight) {
              top = pos.pageY - tooltipHeight - TOOLTIP_PADDING_Y;
            }

            return this.tooltip.style("left", left + "px").style("top", top + "px");
          }
        }]);

        return StatusmapTooltip;
      }());
    }
  };
});
//# sourceMappingURL=tooltip.js.map

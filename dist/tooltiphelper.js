"use strict";

System.register(["d3", "lodash", "jquery", "./helper_format_value"], function (_export, _context) {
  "use strict";

  var d3, _, $, HelperFormatValue, TOOLTIP_PADDING_X, TOOLTIP_PADDING_Y, StatusHeatmapTooltipHelper;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  return {
    setters: [function (_d) {
      d3 = _d.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_helper_format_value) {
      HelperFormatValue = _helper_format_value.HelperFormatValue;
    }],
    execute: function () {
      TOOLTIP_PADDING_X = -50;
      TOOLTIP_PADDING_Y = 5;

      _export("StatusHeatmapTooltipHelper", StatusHeatmapTooltipHelper =
      /*#__PURE__*/
      function () {
        function StatusHeatmapTooltipHelper(elem, scope) {
          _classCallCheck(this, StatusHeatmapTooltipHelper);

          _defineProperty(this, "scope", void 0);

          _defineProperty(this, "dashboard", void 0);

          _defineProperty(this, "panelCtrl", void 0);

          _defineProperty(this, "panel", void 0);

          _defineProperty(this, "heatmapPanel", void 0);

          _defineProperty(this, "mouseOverBucket", void 0);

          _defineProperty(this, "originalFillColor", void 0);

          _defineProperty(this, "tooltip", void 0);

          this.scope = scope;
          this.dashboard = scope.ctrl.dashboard;
          this.panelCtrl = scope.ctrl;
          this.panel = scope.ctrl.panel;
          this.heatmapPanel = elem;
          this.mouseOverBucket = false;
          this.originalFillColor = null;
          elem.on("mouseover", this.onMouseOver.bind(this));
          elem.on("click", this.onMouseClick.bind(this));
        }

        _createClass(StatusHeatmapTooltipHelper, [{
          key: "onMouseOver",
          value: function onMouseOver(e) {
            if (!this.panel.usingUrl || !this.scope.ctrl.data || _.isEmpty(this.scope.ctrl.data)) {
              return;
            }
          }
        }, {
          key: "onMouseClick",
          value: function onMouseClick(e) {
            if (!this.panel.usingUrl) {
              return;
            }

            this.destroy();
            this.add();
          }
        }, {
          key: "add",
          value: function add() {
            this.tooltip = d3.select("body").append("div").attr("class", "statusmap-tooltiphelper graph-tooltip grafana-tooltip");
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
            if (!this.panel.usingUrl || !this.tooltip) {
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

            if (card.value == null) {
              this.destroy();
              return;
            }

            var x = card.x;
            var y = card.y;
            var value = card.value;
            var values = card.values;
            var tooltipTimeFormat = 'YYYY-MM-DD HH:mm:ss';
            var time = this.dashboard.formatDate(+x, tooltipTimeFormat);
            var tooltipHtml = "<div class=\"graph-tooltip-time\">".concat(time, "</div>");

            if (this.panel.color.mode === 'discrete') {
              var statuses = "";

              if (this.panelCtrl.panel.seriesFilterIndex == -1) {
                statuses = this.panelCtrl.discreteHelper.convertValuesToTooltips(values);
              } else {
                statuses = this.panelCtrl.discreteHelper.convertValueToTooltips(value);
              }

              tooltipHtml += "\n                <div>\n                name: <b>".concat(y, "</b>\n                <div>\n                <br>\n                <span>status:</span>\n                <ul>\n                  ").concat(_.join(_.map(statuses, function (v) {
                return "<p style=\"background-color: ".concat(v.color, "; text-align:center\" class=\"discrete-item\">").concat(v.tooltip, "</p>");
              }), ""), "\n                </ul>\n                </div>      \n                </div> <br>");
            }

            tooltipHtml += "<div class=\"statusmap-histogram\"></div>";
            var urls = this.panelCtrl.panel.urls;
            var rtime = this.panelCtrl.retrieveTimeVar();
            var curl = JSON.parse(JSON.stringify(urls));

            for (var i = 0; i < curl.length; i++) {
              //Change name var
              curl[i].base_url = _.replace(curl[i].base_url, /\$name/g, y); //Set up helper

              if (curl[i].usehelper == true) {
                var tf = curl[i].helper.format;
                var vh = card.values[curl[i].helper.index]; //let helper: any = this.dashboard.formatDate(+vh, tf)

                var helper = this.formatHelper(vh, tf);
                curl[i].base_url = _.replace(curl[i].base_url, /\$helper/g, helper);
              } //Change time var


              curl[i].base_url = _.replace(curl[i].base_url, /\$time/g, rtime); //Replace vars

              curl[i].base_url = this.panelCtrl.renderLink(curl[i].base_url, this.panelCtrl.variableSrv.variables);
            }

            if (this.panelCtrl.panel.usingUrl == true) {
              tooltipHtml += "\n                <div bs-tooltip='Settings' data-placement=\"right\">\n                  ".concat(_.join(_.map(curl, function (v) {
                return "<div ><a   href=\"".concat(v.forcelowercase ? v.base_url.toLowerCase() : v.base_url, "\" target=\"_blank\"><div class=\"dashlist-item\">\n                  <p  class=\"dashlist-link dashlist-link-dash-db\"><span style=\"word-wrap: break-word;\" class=\"dash-title\">").concat(v.label ? v.label : v.base_url != "" ? _.truncate(v.base_url) : "Empty URL", "</span><span class=\"dashlist-star\">\n                        <i class=\"fa fa-").concat(v.icon_fa, "\"></i>\n                      </span></p> </div></a><div>");
              }), ""), "\n                </div> <br>");
            } //   "Ambiguous bucket state: Multiple values!";


            if (!this.panel.useMax && card.multipleValues) {
              tooltipHtml += "<div><b>Error:</b> ".concat(this.panelCtrl.dataWarnings.multipleValues.title, "</div>");
            } // Discrete mode errors


            if (this.panel.color.mode === 'discrete') {
              if (card.noColorDefined) {
                var badValues = this.panelCtrl.discreteHelper.getNotColoredValues(values);
                tooltipHtml += "<div><b>Error:</b> ".concat(this.panelCtrl.dataWarnings.noColorDefined.title, "\n                    <br>not colored values:\n                    <ul>\n                    ").concat(_.join(_.map(badValues, function (v) {
                  return "<li>".concat(v, "</li>");
                }), ""), "\n                    </ul>\n                    </div>");
              }
            }

            this.tooltip.html(tooltipHtml);
            this.move(pos);
          }
        }, {
          key: "formatHelper",
          value: function formatHelper(value, type) {
            var helper = '';

            switch (type) {
              case HelperFormatValue.Date:
                helper = this.dashboard.formatDate(+value, type);
                return helper;

              case HelperFormatValue.Raw:
                helper = value;
                return helper;

              default:
                return helper;
            }
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

        return StatusHeatmapTooltipHelper;
      }());
    }
  };
});
//# sourceMappingURL=tooltiphelper.js.map

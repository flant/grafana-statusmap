"use strict";

System.register(["d3", "jquery", "lodash"], function (_export, _context) {
  "use strict";

  var d3, $, _, TOOLTIP_PADDING_X, TOOLTIP_PADDING_Y, DefaultValueDateFormat, StatusmapTooltip;

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
      TOOLTIP_PADDING_Y = 5; // TODO rename file to tooltip_ctrl.ts
      // TODO move DefaultValueDateFormat into tooltip.ts, as it used in several places (migration, partial and tooltip render)

      DefaultValueDateFormat = 'YYYY/MM/DD/HH_mm_ss';

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

          _defineProperty(this, "panelElem", void 0);

          _defineProperty(this, "mouseOverBucket", void 0);

          _defineProperty(this, "originalFillColor", void 0);

          _defineProperty(this, "tooltipWidth", void 0);

          _defineProperty(this, "tooltipFrozen", void 0);

          this.scope = scope;
          this.dashboard = scope.ctrl.dashboard;
          this.panelCtrl = scope.ctrl;
          this.panel = scope.ctrl.panel;
          this.panelElem = elem;
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
              this.move(e, this.tooltip);
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

            this.move(e, this.tooltip);
          }
        }, {
          key: "add",
          value: function add() {
            this.tooltip = d3.select("body").append("div").attr("class", "graph-tooltip statusmap-tooltip");
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
          key: "removeFrozen",
          value: function removeFrozen() {
            if (this.tooltipFrozen) {
              this.tooltipFrozen.remove();
              this.tooltipFrozen = null;
            }
          }
        }, {
          key: "showFrozen",
          value: function showFrozen(pos) {
            this.removeFrozen();
            this.tooltipFrozen = d3.select(this.panelElem[0]).append("div").attr("class", "graph-tooltip statusmap-tooltip statusmap-tooltip-frozen");
            this.displayTooltip(pos, this.tooltipFrozen, true);
            this.moveRelative(pos, this.tooltipFrozen);
          }
        }, {
          key: "show",
          value: function show(pos) {
            if (!this.panel.tooltip.show || !this.tooltip) {
              return;
            } // TODO support for shared tooltip mode


            if (pos.panelRelY) {
              return;
            }

            this.displayTooltip(pos, this.tooltip, false);
            this.move(pos, this.tooltip);
          } // Retrieve bucket and create html content inside tooltip’s div element.

        }, {
          key: "displayTooltip",
          value: function displayTooltip(pos, tooltip, frozen) {
            var cardEl = d3.select(pos.target);
            var yid = cardEl.attr('yid');
            var xid = cardEl.attr('xid');
            var bucket = this.panelCtrl.bucketMatrix.get(yid, xid); // TODO string-to-number conversion for xid

            if (!bucket || bucket.isEmpty()) {
              this.destroy();
              return;
            }

            var timestamp = bucket.to;
            var yLabel = bucket.yLabel;
            var value = bucket.value;
            var values = bucket.values; // TODO create option for this formatting.

            var tooltipTimeFormat = 'YYYY-MM-DD HH:mm:ss';
            var time = this.dashboard.formatDate(+timestamp, tooltipTimeFormat); // Close button for the frozen tooltip.

            var tooltipClose = "";

            if (frozen) {
              tooltipClose = "\n<a class=\"pointer pull-right small tooltip-close\">\n      <i class=\"fa fa-remove\"></i>\n</a>\n";
            }

            var tooltipHtml = "<div class=\"graph-tooltip-time\">".concat(time).concat(tooltipClose, "</div>");

            if (this.panel.color.mode === 'discrete') {
              var statuses;

              if (this.panel.seriesFilterIndex >= 0) {
                statuses = this.panelCtrl.discreteExtraSeries.convertValueToTooltips(value);
              } else {
                statuses = this.panelCtrl.discreteExtraSeries.convertValuesToTooltips(values);
              }

              var statusTitle = "status:";

              if (statuses.length > 1) {
                statusTitle = "statuses:";
              }

              tooltipHtml += "\n      <div>\n        name: <b>".concat(yLabel, "</b>\n        <br>\n        <span>").concat(statusTitle, "</span>\n        <ul>\n          ").concat(_.join(_.map(statuses, function (v) {
                return "<li style=\"background-color: ".concat(v.color, "; text-align:center\" class=\"discrete-item\">").concat(v.tooltip, "</li>");
              }), ""), "\n        </ul>\n      </div>");
            } else {
              if (values.length === 1) {
                tooltipHtml += "<div> \n      name: <b>".concat(yLabel, "</b> <br>\n      value: <b>").concat(value, "</b> <br>\n      </div>");
              } else {
                tooltipHtml += "<div>\n      name: <b>".concat(yLabel, "</b> <br>\n      values:\n      <ul>\n        ").concat(_.join(_.map(values, function (v) {
                  return "<li>".concat(v, "</li>");
                }), ""), "\n      </ul>\n      </div>");
              }
            }

            tooltipHtml += "<div class=\"statusmap-histogram\"></div>";

            if (this.panel.tooltip.showItems) {
              // Additional information: urls, etc.
              // Clone additional items
              var items = JSON.parse(JSON.stringify(this.panel.tooltip.items));
              var scopedVars = {};
              var valueVar;

              for (var i = 0; i < bucket.values.length; i++) {
                valueVar = "__value_".concat(i);
                scopedVars[valueVar] = {
                  value: bucket.values[i]
                };
              }

              scopedVars["__value"] = {
                value: bucket.value
              };
              scopedVars["__y_label"] = {
                value: yLabel
              }; // Grafana 7.0 compatible

              scopedVars["__url_time_range"] = {
                value: this.panelCtrl.retrieveTimeVar()
              };
              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  var item = _step.value;

                  if (_.isEmpty(item.urlTemplate)) {
                    item.link = "#";
                  } else {
                    var dateFormat = item.valueDateFormat;

                    if (dateFormat == '') {
                      dateFormat = DefaultValueDateFormat;
                    }

                    var valueDateVar = void 0;

                    for (var _i = 0; _i < bucket.values.length; _i++) {
                      valueDateVar = "__value_".concat(_i, "_date");
                      scopedVars[valueDateVar] = {
                        value: this.dashboard.formatDate(+bucket.values[_i], dateFormat)
                      };
                    }

                    scopedVars["__value_date"] = {
                      value: this.dashboard.formatDate(+bucket.value, dateFormat)
                    };
                    item.link = this.panelCtrl.templateSrv.replace(item.urlTemplate, scopedVars); // Force lowercase for link

                    if (item.urlToLowerCase) {
                      item.link = item.link.toLowerCase();
                    }
                  }

                  item.label = item.urlText;

                  if (_.isEmpty(item.label)) {
                    item.label = _.isEmpty(item.urlTemplate) ? "Empty URL" : _.truncate(item.link);
                  }
                }
              } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                    _iterator["return"]();
                  }
                } finally {
                  if (_didIteratorError) {
                    throw _iteratorError;
                  }
                }
              }

              tooltipHtml += _.join(_.map(items, function (v) {
                return "\n          <div>\n            <a href=\"".concat(v.link, "\" target=\"_blank\">\n            <div class=\"dashlist-item\">\n            <p class=\"dashlist-link dashlist-link-dash-db\">\n              <span style=\"word-wrap: break-word;\" class=\"dash-title\">").concat(v.label, "</span><span class=\"dashlist-star\">\n              <i class=\"fa fa-").concat(v.urlIcon, "\"></i>\n            </span></p> </div></a><div>");
              }), "\n");
            } // Ambiguous state: there multiple values in bucket!
            // TODO rename useMax to expectMultipleValues


            if (!this.panel.useMax && bucket.multipleValues) {
              tooltipHtml += "<div><b>Error:</b> ".concat(this.panelCtrl.dataWarnings.multipleValues.title, "</div>");
            } // Discrete mode errors


            if (this.panel.color.mode === 'discrete') {
              if (bucket.noColorDefined) {
                var badValues = this.panelCtrl.discreteExtraSeries.getNotColoredValues(values);
                tooltipHtml += "<div><b>Error:</b> ".concat(this.panelCtrl.dataWarnings.noColorDefined.title, "\n        <br>not colored values:\n        <ul>\n          ").concat(_.join(_.map(badValues, function (v) {
                  return "<li>".concat(v, "</li>");
                }), ""), "\n        </ul>\n        </div>");
              }
            }

            tooltip.html(tooltipHtml); // Assign mouse event handlers for "frozen" tooltip.

            if (frozen) {
              // Stop propagation mouse events up to parents to allow interaction with frozen tooltip’s elements.
              tooltip.on("click", function () {
                d3.event.stopPropagation();
              }).on("mousedown", function () {
                d3.event.stopPropagation();
              }).on("mouseup", function () {
                d3.event.stopPropagation();
              }); // Activate close button

              tooltip.select("a.tooltip-close").on("click", this.removeFrozen.bind(this));
            }
          } // Move tooltip as absolute positioned element.

        }, {
          key: "move",
          value: function move(pos, tooltip) {
            if (!tooltip) {
              return;
            }

            var elem = $(tooltip.node())[0];
            var tooltipWidth = elem.clientWidth;
            this.tooltipWidth = tooltipWidth;
            var tooltipHeight = elem.clientHeight;
            var left = pos.pageX + TOOLTIP_PADDING_X;
            var top = pos.pageY + TOOLTIP_PADDING_Y;

            if (pos.pageX + tooltipWidth + 40 > window.innerWidth) {
              left = pos.pageX - tooltipWidth - TOOLTIP_PADDING_X;
            }

            if (pos.pageY - window.pageYOffset + tooltipHeight + 20 > window.innerHeight) {
              top = pos.pageY - tooltipHeight - TOOLTIP_PADDING_Y;
            }

            return tooltip.style("left", left + "px").style("top", top + "px");
          } // Move tooltip relative to svg element of panel.

        }, {
          key: "moveRelative",
          value: function moveRelative(pos, tooltip) {
            if (!tooltip) {
              return;
            }

            var panelX = pos.pageX - this.panelElem.offset().left;
            var panelY = pos.pageY - this.panelElem.offset().top;
            var panelWidth = this.panelElem.width();
            var panelHeight = this.panelElem.height(); // 'position: relative' sets tooltip’s width to 100% of panel element.
            // Restore width from floating tooltip and add more space for 'Close' button.

            var tooltipWidth = this.tooltipWidth + 25; // Left property is clamped so tooltip stays inside panel bound box.

            var tooltipLeft = panelX + TOOLTIP_PADDING_X;

            if (tooltipLeft + tooltipWidth > panelWidth) {
              tooltipLeft = panelWidth - tooltipWidth;
            }

            if (tooltipLeft < 0) {
              tooltipLeft = 0;
            } // Frozen tooltip’s root element is appended next to panel’s svg element,
            // so top property is adjusted to move tooltip’s root element
            // up to the mouse pointer position.


            var tooltipTop = -(panelHeight - panelY + TOOLTIP_PADDING_Y);
            return tooltip.style("left", tooltipLeft + "px").style("top", tooltipTop + "px").style("width", tooltipWidth + "px");
          }
        }]);

        return StatusmapTooltip;
      }());
    }
  };
});
//# sourceMappingURL=tooltip.js.map

"use strict";

System.register(["d3", "jquery", "lodash"], function (_export, _context) {
  "use strict";

  var d3, $, _, TOOLTIP_PADDING_X, TOOLTIP_PADDING_Y, AnnotationTooltip;

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
      TOOLTIP_PADDING_Y = 10;

      _export("AnnotationTooltip", AnnotationTooltip =
      /*#__PURE__*/
      function () {
        function AnnotationTooltip(elem, scope) {
          _classCallCheck(this, AnnotationTooltip);

          _defineProperty(this, "scope", void 0);

          _defineProperty(this, "dashboard", void 0);

          _defineProperty(this, "panelCtrl", void 0);

          _defineProperty(this, "panel", void 0);

          _defineProperty(this, "mouseOverAnnotationTick", void 0);

          _defineProperty(this, "tooltipBase", void 0);

          _defineProperty(this, "tooltip", void 0);

          this.scope = scope;
          this.dashboard = scope.ctrl.dashboard;
          this.panelCtrl = scope.ctrl;
          this.panel = scope.ctrl.panel;
          this.mouseOverAnnotationTick = false;
          elem.on("mouseover", this.onMouseOver.bind(this));
          elem.on("mouseleave", this.onMouseLeave.bind(this));
        }

        _createClass(AnnotationTooltip, [{
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
            this.tooltipBase = d3.select("body").append("div").attr("class", "statusmap-annotation-tooltip drop drop-popover drop-popover--annotation drop-element drop-enabled drop-target-attached-center drop-open drop-open-transitionend drop-after-open").style("position", "absolute");
            this.tooltip = this.tooltipBase.append("div").attr("class", "drop-content").append("div").append("annotation-tooltip").append("div").attr("class", "graph-annotation");
          }
        }, {
          key: "destroy",
          value: function destroy() {
            if (this.tooltip) {
              this.tooltip.remove();
            }

            this.tooltip = null;

            if (this.tooltipBase) {
              this.tooltipBase.remove();
            }

            this.tooltipBase = null;
          }
        }, {
          key: "show",
          value: function show(pos) {
            if (!this.panel.tooltip.show || !this.tooltip) {
              return;
            } // shared tooltip mode
            //if (pos.panelRelY) {
            //  return;
            //}


            var annoId = d3.select(pos.target).attr('annoId');

            if (!annoId) {
              this.destroy();
              return;
            }

            var anno = this.panelCtrl.annotations[annoId];

            if (!anno) {
              this.destroy();
              return;
            }

            var annoTitle = "";
            var tooltipTimeFormat = 'YYYY-MM-DD HH:mm:ss';
            var annoTime = this.dashboard.formatDate(anno.time, tooltipTimeFormat);
            var annoText = anno.text;
            var annoTags = [];

            if (anno.tags) {
              annoTags = _.map(anno.tags, function (t) {
                return {
                  "text": t,
                  "backColor": "rgb(63, 43, 91)",
                  "borderColor": "rgb(101, 81, 129)"
                };
              });
            }

            var tooltipHtml = "<div class=\"graph-annotation__header\">\n      <span class=\"graph-annotation__title\">".concat(annoTitle, "</span>\n    <span class=\"graph-annotation__time\">").concat(annoTime, "</span></div>\n    <div class=\"graph-annotation__body\">\n      <div>").concat(annoText, "</div>\n      ").concat(_.join(_.map(annoTags, function (t) {
              return "<span class=\"label label-tag small\" style=\"background-color: ".concat(t.backColor, "; border-color: ").concat(t.borderColor, "\">").concat(t.text, "</span>");
            }), ""), "\n    </div>\n      <div class=\"statusmap-histogram\"></div>");
            this.tooltip.html(tooltipHtml);
            this.move(pos);
          }
        }, {
          key: "move",
          value: function move(pos) {
            if (!this.tooltipBase) {
              return;
            }

            var elem = $(this.tooltipBase.node())[0];
            var tooltipWidth = elem.clientWidth;
            var tooltipHeight = elem.clientHeight;
            var left = pos.pageX - tooltipWidth / 2;
            var top = pos.pageY + TOOLTIP_PADDING_Y;

            if (pos.pageX + tooltipWidth / 2 + 10 > window.innerWidth) {
              left = pos.pageX - tooltipWidth - TOOLTIP_PADDING_X;
            }

            if (pos.pageY - window.pageYOffset + tooltipHeight + 20 > window.innerHeight) {
              top = pos.pageY - tooltipHeight - TOOLTIP_PADDING_Y;
            }

            return this.tooltipBase.style("left", left + "px").style("top", top + "px");
          }
        }]);

        return AnnotationTooltip;
      }());
    }
  };
});
//# sourceMappingURL=annotations.js.map

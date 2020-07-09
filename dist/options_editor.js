"use strict";

System.register(["app/core/utils/kbn"], function (_export, _context) {
  "use strict";

  var kbn, StatusHeatmapOptionsEditorCtrl;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  /** @ngInject */
  function optionsEditorCtrl() {
    'use strict';

    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'public/plugins/flant-statusmap-panel/partials/options_editor.html',
      controller: StatusHeatmapOptionsEditorCtrl
    };
  }

  _export("optionsEditorCtrl", optionsEditorCtrl);

  return {
    setters: [function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }],
    execute: function () {
      _export("StatusHeatmapOptionsEditorCtrl", StatusHeatmapOptionsEditorCtrl =
      /*#__PURE__*/
      function () {
        StatusHeatmapOptionsEditorCtrl.$inject = ["$scope"];

        /** @ngInject */
        function StatusHeatmapOptionsEditorCtrl($scope) {
          _classCallCheck(this, StatusHeatmapOptionsEditorCtrl);

          _defineProperty(this, "panel", void 0);

          _defineProperty(this, "panelCtrl", void 0);

          _defineProperty(this, "unitFormats", void 0);

          $scope.editor = this;
          this.panelCtrl = $scope.ctrl;
          this.panel = this.panelCtrl.panel;
          this.unitFormats = kbn.getUnitFormats();
        }

        _createClass(StatusHeatmapOptionsEditorCtrl, [{
          key: "setUnitFormat",
          value: function setUnitFormat(subItem) {
            this.panel.data.unitFormat = subItem.value;
            this.panelCtrl.render();
          }
        }, {
          key: "render",
          value: function render() {
            this.panelCtrl.render();
          }
        }, {
          key: "onAddThreshold",
          value: function onAddThreshold() {
            this.panel.color.thresholds.push({
              color: this.panel.defaultColor
            });
            this.render();
          }
        }, {
          key: "onRemoveThreshold",
          value: function onRemoveThreshold(index) {
            this.panel.color.thresholds.splice(index, 1);
            this.render();
          }
        }, {
          key: "onRemoveThresholds",
          value: function onRemoveThresholds() {
            this.panel.color.thresholds = [];
            this.render();
          }
        }, {
          key: "onAddThreeLights",
          value: function onAddThreeLights() {
            this.panel.color.thresholds.push({
              color: "red",
              value: 2,
              tooltip: "error"
            });
            this.panel.color.thresholds.push({
              color: "yellow",
              value: 1,
              tooltip: "warning"
            });
            this.panel.color.thresholds.push({
              color: "green",
              value: 0,
              tooltip: "ok"
            });
            this.render();
          }
          /* https://ethanschoonover.com/solarized/ */

        }, {
          key: "onAddSolarized",
          value: function onAddSolarized() {
            this.panel.color.thresholds.push({
              color: "#b58900",
              value: 0,
              tooltip: "yellow"
            });
            this.panel.color.thresholds.push({
              color: "#cb4b16",
              value: 1,
              tooltip: "orange"
            });
            this.panel.color.thresholds.push({
              color: "#dc322f",
              value: 2,
              tooltip: "red"
            });
            this.panel.color.thresholds.push({
              color: "#d33682",
              value: 3,
              tooltip: "magenta"
            });
            this.panel.color.thresholds.push({
              color: "#6c71c4",
              value: 4,
              tooltip: "violet"
            });
            this.panel.color.thresholds.push({
              color: "#268bd2",
              value: 5,
              tooltip: "blue"
            });
            this.panel.color.thresholds.push({
              color: "#2aa198",
              value: 6,
              tooltip: "cyan"
            });
            this.panel.color.thresholds.push({
              color: "#859900",
              value: 7,
              tooltip: "green"
            });
            this.render();
          }
        }]);

        return StatusHeatmapOptionsEditorCtrl;
      }());
    }
  };
});
//# sourceMappingURL=options_editor.js.map

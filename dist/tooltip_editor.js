"use strict";

System.register([], function (_export, _context) {
  "use strict";

  var emptyTooltipItem, TooltipEditorCtrl;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function tooltipEditorCtrl() {
    'use strict';

    return {
      restrict: 'E',
      scope: true,
      templateUrl: 'public/plugins/flant-statusmap-panel/partials/tooltip_editor.html',
      controller: TooltipEditorCtrl
    };
  }

  _export("tooltipEditorCtrl", tooltipEditorCtrl);

  return {
    setters: [],
    execute: function () {
      emptyTooltipItem = {
        urlText: '',
        urlTemplate: '',
        urlIcon: 'external-link',
        urlToLowerCase: true,
        valueDateFormat: ''
      };

      _export("TooltipEditorCtrl", TooltipEditorCtrl =
      /*#__PURE__*/
      function () {
        function TooltipEditorCtrl($scope) {
          _classCallCheck(this, TooltipEditorCtrl);

          _defineProperty(this, "panel", void 0);

          _defineProperty(this, "panelCtrl", void 0);

          $scope.editor = this;
          this.panelCtrl = $scope.ctrl;
          this.panel = this.panelCtrl.panel;
        }

        _createClass(TooltipEditorCtrl, [{
          key: "render",
          value: function render() {
            this.panelCtrl.render();
          }
        }, {
          key: "onAddUrl",
          value: function onAddUrl() {
            this.panel.tooltip.items.push(Object.assign({}, emptyTooltipItem));
            this.render();
          }
        }, {
          key: "onRemoveUrl",
          value: function onRemoveUrl(index) {
            this.panel.tooltip.items.splice(index, 1);
            this.render();
          }
        }, {
          key: "onRemoveUrls",
          value: function onRemoveUrls() {
            this.panel.tooltip.items = [];
            this.render();
          }
        }, {
          key: "getFAIconClasses",
          value: function getFAIconClasses() {
            return ['external-link', 'plus', 'anchor', 'ban', 'globe', 'gear', 'cloud', 'download', 'cloud-download'];
          }
        }, {
          key: "getValueDateFormats",
          value: function getValueDateFormats() {
            return ['YYYY/MM/DD/HH_mm_ss', 'YYYYMMDDHHmmss', 'YYYY-MM-DD-HH-mm-ss'];
          }
        }]);

        return TooltipEditorCtrl;
      }());
    }
  };
});
//# sourceMappingURL=tooltip_editor.js.map

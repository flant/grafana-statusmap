'use strict';

System.register(['app/plugins/sdk', './status_heatmap_ctrl'], function (_export, _context) {
  "use strict";

  var loadPluginCss, StatusHeatmapCtrl;
  return {
    setters: [function (_appPluginsSdk) {
      loadPluginCss = _appPluginsSdk.loadPluginCss;
    }, function (_status_heatmap_ctrl) {
      StatusHeatmapCtrl = _status_heatmap_ctrl.StatusHeatmapCtrl;
    }],
    execute: function () {

      loadPluginCss({
        dark: 'plugins/flant-statusmap-panel/css/statusmap.dark.css',
        light: 'plugins/flant-statusmap-panel/css/statusmap.light.css'
      });

      _export('PanelCtrl', StatusHeatmapCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map

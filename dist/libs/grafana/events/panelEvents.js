"use strict";

System.register([], function (_export, _context) {
  "use strict";

  var refresh, render, dataError, dataReceived, dataSnapshotLoad, editModeInitialized;

  function fallbackToStringEvents() {
    _export("refresh", refresh = 'refresh');

    _export("render", render = 'render');

    _export("dataError", dataError = 'data-error');

    _export("dataReceived", dataReceived = 'data-received');

    _export("dataSnapshotLoad", dataSnapshotLoad = 'data-snapshot-load');

    _export("editModeInitialized", editModeInitialized = 'init-edit-mode');
  }

  _export("fallbackToStringEvents", fallbackToStringEvents);

  return {
    setters: [],
    execute: function () {
      _export("refresh", refresh = {
        name: 'refresh'
      });

      _export("render", render = {
        name: 'render'
      });

      _export("dataError", dataError = {
        name: 'data-error'
      });

      _export("dataReceived", dataReceived = {
        name: 'data-received'
      });

      _export("dataSnapshotLoad", dataSnapshotLoad = {
        name: 'data-snapshot-load'
      });

      _export("editModeInitialized", editModeInitialized = {
        name: 'init-edit-mode'
      });
    }
  };
});
//# sourceMappingURL=panelEvents.js.map

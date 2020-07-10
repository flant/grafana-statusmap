"use strict";

System.register(["./events", "./panelEvents"], function (_export, _context) {
  "use strict";

  var CoreEvents, PanelEvents;
  return {
    setters: [function (_events) {
      CoreEvents = _events;
    }, function (_panelEvents) {
      PanelEvents = _panelEvents;
    }],
    execute: function () {
      _export("CoreEvents", CoreEvents);

      _export("PanelEvents", PanelEvents);
    }
  };
});
//# sourceMappingURL=index.js.map

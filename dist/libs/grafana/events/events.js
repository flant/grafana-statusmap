"use strict";

System.register([], function (_export, _context) {
  "use strict";

  var graphHover, graphHoverClear;

  function fallbackToStringEvents() {
    _export("graphHover", graphHover = 'graph-hover');

    _export("graphHoverClear", graphHoverClear = 'graph-hover-clear');
  }

  _export("fallbackToStringEvents", fallbackToStringEvents);

  return {
    setters: [],
    execute: function () {
      _export("graphHover", graphHover = {
        name: 'graph-hover'
      });

      _export("graphHoverClear", graphHoverClear = {
        name: 'graph-hover-clear'
      });
    }
  };
});
//# sourceMappingURL=events.js.map

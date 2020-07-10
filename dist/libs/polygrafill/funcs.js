"use strict";

System.register([], function (_export, _context) {
  "use strict";

  // Old Grafana releases use strings as event ids and
  // new event ids in form of object {name: "event-id"} are not
  // supported properly: first defined listener will receive
  // all emitted events despite of the value in 'name' field.
  //
  // This method detects this behaviour and return true
  // only for new Grafana versions.
  function hasAppEventCompatibleEmitter(emitter) {
    var receiveEvents = 0;
    var eventId = {
      name: "non-existed-event-id"
    };
    var eventId2 = {
      name: "non-existed-event-id-2"
    };
    emitter.on(eventId, function () {
      receiveEvents++;
    });
    emitter.emit(eventId);
    emitter.emit(eventId2);
    emitter.removeAllListeners(eventId); // New Grafana versions should receive one event.

    return receiveEvents == 1;
  }

  _export("hasAppEventCompatibleEmitter", hasAppEventCompatibleEmitter);

  return {
    setters: [],
    execute: function () {}
  };
});
//# sourceMappingURL=funcs.js.map

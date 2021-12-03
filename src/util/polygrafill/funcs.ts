import { Emitter } from 'grafana/app/core/utils/emitter';

// Old Grafana releases use strings as event ids and
// new event ids in form of object {name: "event-id"} are not
// supported properly: first defined listener will receive
// all emitted events despite of the value in 'name' field.
//
// This method detects this behaviour and return true
// only for new Grafana versions.
export function hasAppEventCompatibleEmitter(emitter: Emitter): boolean {
  // Grafana 7.4 has new event bus for Angular plugins. It is has a 'subscribe' method.
  let emitterProto = Object.getPrototypeOf(emitter);
  if (Object.prototype.hasOwnProperty.call(emitterProto, 'subscribe')) {
    return true;
  }

  let receiveEvents = 0;
  let eventId: any = { name: 'non-existed-event-id' };
  let eventId2: any = { name: 'non-existed-event-id-2' };
  emitter.on(eventId, function () {
    receiveEvents++;
  });
  emitter.emit(eventId);
  emitter.emit(eventId2);
  emitter.removeAllListeners(eventId);

  // New Grafana versions should receive one event.
  return receiveEvents === 1;
}

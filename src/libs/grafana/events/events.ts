import { AppEvent } from './appEvents';

export interface GraphHoverPayload {
  pos: any;
  panel: {
    id: number;
  };
}

export var graphHover: AppEvent<GraphHoverPayload> | string = { name: 'graph-hover' };
export var graphHoverClear: AppEvent<any> | string = { name: 'graph-hover-clear' };

export function fallbackToStringEvents() {
  graphHover = 'graph-hover';
  graphHoverClear = 'graph-hover-clear';
}

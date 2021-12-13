import { eventFactory } from '@grafana/data';

export interface GraphHoverPayload {
  pos: any;
  panel: {
    id: number;
  };
}

export const graphHover = eventFactory<GraphHoverPayload>('statusmap-graph-hover');
export const graphHoverClear = eventFactory('statusmap-graph-hover-clear');
export const renderComplete = eventFactory('statusmap-render-complete');

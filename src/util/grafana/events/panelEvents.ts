import { AppEvent } from './appEvents';

export interface DataQueryError {
  data?: {
    message?: string;
    error?: string;
  };
  message?: string;
  status?: string;
  statusText?: string;
  refId?: string;
  cancelled?: boolean;
}

export var refresh: AppEvent<undefined> | string = { name: 'refresh' };
export var render: AppEvent<any> | string = { name: 'render' };
export var dataError: AppEvent<DataQueryError> | string = { name: 'data-error' };
export var dataReceived: AppEvent<any[]> | string = { name: 'data-received' };
export var dataSnapshotLoad: AppEvent<any[]> | string = { name: 'data-snapshot-load' };
export var editModeInitialized: AppEvent<undefined> | string = { name: 'init-edit-mode' };

export function fallbackToStringEvents() {
  refresh = 'refresh';
  render = 'render';
  dataError = 'data-error';
  dataReceived = 'data-received';
  dataSnapshotLoad = 'data-snapshot-load';
  editModeInitialized = 'init-edit-mode';
}

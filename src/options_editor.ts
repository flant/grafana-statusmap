import kbn from 'grafana/app/core/utils/kbn';
import { StatusHeatmapCtrl } from './module';

export class StatusHeatmapOptionsEditorCtrl {
  panel: any;
  panelCtrl: StatusHeatmapCtrl;
  unitFormats: any;

  /** @ngInject */
  constructor($scope: any) {
    $scope.editor = this;
    this.panelCtrl = $scope.ctrl as StatusHeatmapCtrl;
    this.panel = this.panelCtrl.panel;

    this.unitFormats = kbn.getUnitFormats();
  }

  setUnitFormat(subItem) {
    this.panel.data.unitFormat = subItem.value;
    this.panelCtrl.render();
  }

  render() {
    this.panelCtrl.render();
  }

  onAddThreshold() {
    this.panel.color.thresholds.push({ color: this.panel.defaultColor });
    this.render();
  }

  onRemoveThreshold(index: number) {
    this.panel.color.thresholds.splice(index, 1);
    this.render();
  }

  onRemoveThresholds() {
    this.panel.color.thresholds = [];
    this.render();
  }

  onAddThreeLights() {
    this.panel.color.thresholds.push({ color: 'red', value: 2, tooltip: 'error' });
    this.panel.color.thresholds.push({ color: 'yellow', value: 1, tooltip: 'warning' });
    this.panel.color.thresholds.push({ color: 'green', value: 0, tooltip: 'ok' });
    this.render();
  }

  /* https://ethanschoonover.com/solarized/ */
  onAddSolarized() {
    this.panel.color.thresholds.push({ color: '#b58900', value: 0, tooltip: 'yellow' });
    this.panel.color.thresholds.push({ color: '#cb4b16', value: 1, tooltip: 'orange' });
    this.panel.color.thresholds.push({ color: '#dc322f', value: 2, tooltip: 'red' });
    this.panel.color.thresholds.push({ color: '#d33682', value: 3, tooltip: 'magenta' });
    this.panel.color.thresholds.push({ color: '#6c71c4', value: 4, tooltip: 'violet' });
    this.panel.color.thresholds.push({ color: '#268bd2', value: 5, tooltip: 'blue' });
    this.panel.color.thresholds.push({ color: '#2aa198', value: 6, tooltip: 'cyan' });
    this.panel.color.thresholds.push({ color: '#859900', value: 7, tooltip: 'green' });
    this.render();
  }
}

/** @ngInject */
export function optionsEditorCtrl() {
  'use strict';
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'public/plugins/flant-statusmap-panel/partials/options_editor.html',
    controller: StatusHeatmapOptionsEditorCtrl,
  };
}

import { StatusHeatmapCtrl } from './module';

let emptyTooltipItem = {
  urlText: '',
  urlTemplate: '',
  urlIcon: 'external-link',
  urlToLowerCase: true,
  valueDateFormat: '',
};

export class TooltipEditorCtrl {
  panel: any;
  panelCtrl: StatusHeatmapCtrl;

  /** @ngInject */
  constructor($scope: any) {
    $scope.editor = this;
    this.panelCtrl = $scope.ctrl as StatusHeatmapCtrl;
    this.panel = this.panelCtrl.panel;
  }

  render() {
    this.panelCtrl.render();
  }

  onAddUrl() {
    this.panel.tooltip.items.push(Object.assign({}, emptyTooltipItem));
    this.render();
  }

  onRemoveUrl(index: number) {
    this.panel.tooltip.items.splice(index, 1);
    this.render();
  }

  onRemoveUrls() {
    this.panel.tooltip.items = [];
    this.render();
  }

  getFAIconClasses() {
    return ['external-link', 'plus', 'anchor', 'ban', 'globe', 'gear', 'cloud', 'download', 'cloud-download'];
  }

  getValueDateFormats() {
    return ['YYYY/MM/DD/HH_mm_ss', 'YYYYMMDDHHmmss', 'YYYY-MM-DD-HH-mm-ss'];
  }
}

export function tooltipEditorCtrl() {
  'use strict';
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'public/plugins/flant-statusmap-panel/partials/tooltip_editor.html',
    controller: TooltipEditorCtrl,
  };
}

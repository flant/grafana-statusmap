import d3 from 'd3';
import $ from 'jquery';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';

let TOOLTIP_PADDING_X = 30;
let TOOLTIP_PADDING_Y = 5;
let HISTOGRAM_WIDTH = 160;
let HISTOGRAM_HEIGHT = 40;

export class StatusHeatmapTooltip {
  constructor(elem, scope) {
    this.scope = scope;
    this.dashboard = scope.ctrl.dashboard;
    this.panelCtrl = scope.ctrl;
    this.panel = scope.ctrl.panel;
    this.heatmapPanel = elem;
    this.mouseOverBucket = false;
    this.originalFillColor = null;

    elem.on("mouseover", this.onMouseOver.bind(this));
    elem.on("mouseleave", this.onMouseLeave.bind(this));
  }

  onMouseOver(e) {
    if (!this.panel.tooltip.show || !this.scope.ctrl.data || _.isEmpty(this.scope.ctrl.data)) { return; }

    if (!this.tooltip) {
      this.add();
      this.move(e);
    }
  }

  onMouseLeave() {
    this.destroy();
  }

  onMouseMove(e) {
    if (!this.panel.tooltip.show) { return; }

    this.move(e);
  }

  add() {
    this.tooltip = d3.select("body")
      .append("div")
      .attr("class", "heatmap-tooltip graph-tooltip grafana-tooltip");
  }

  destroy() {
    if (this.tooltip) {
      this.tooltip.remove();
    }

    this.tooltip = null;
  }

  show(pos, x, y, value) {
    if (!this.panel.tooltip.show) { return; }
    // shared tooltip mode
    if (pos.panelRelY) {
      return;
    }

    if (!x || !y || !this.tooltip) {
      this.destroy();
      return;
    }

    let tooltipTimeFormat = 'YYYY-MM-DD HH:mm:ss';
    let time = this.dashboard.formatDate(+x, tooltipTimeFormat);

    let tooltipHtml = `<div class="graph-tooltip-time">${time}</div>
      <div class="status-heatmap-histogram"></div>`;

    tooltipHtml += `<div>
      name: <b>${y}</b> <br>
      value: <b>${value}</b> <br>
    </div>`;

    this.tooltip.html(tooltipHtml);

    this.move(pos);
  }

  move(pos) {
    if (!this.tooltip) { return; }

    let elem = $(this.tooltip.node())[0];
    let tooltipWidth = elem.clientWidth;
    let tooltipHeight = elem.clientHeight;

    let left = pos.pageX + TOOLTIP_PADDING_X;
    let top = pos.pageY + TOOLTIP_PADDING_Y;

    if (pos.pageX + tooltipWidth + 40 > window.innerWidth) {
      left = pos.pageX - tooltipWidth - TOOLTIP_PADDING_X;
    }

    if (pos.pageY - window.pageYOffset + tooltipHeight + 20 > window.innerHeight) {
      top = pos.pageY - tooltipHeight - TOOLTIP_PADDING_Y;
    }

    return this.tooltip
      .style("left", left + "px")
      .style("top", top + "px");
  }
}

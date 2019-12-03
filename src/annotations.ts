import d3 from 'd3';
import $ from 'jquery';
import _ from 'lodash';

let TOOLTIP_PADDING_X = 30;
let TOOLTIP_PADDING_Y = 10;

export class AnnotationTooltip {
  scope: any;
  dashboard: any;
  panelCtrl: any;
  panel: any;
  mouseOverAnnotationTick: boolean;

  tooltipBase: any;
  tooltip: any;

  constructor(elem, scope) {
    this.scope = scope;
    this.dashboard = scope.ctrl.dashboard;
    this.panelCtrl = scope.ctrl;
    this.panel = scope.ctrl.panel;
    this.mouseOverAnnotationTick = false;

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
    this.tooltipBase = d3.select("body")
    .append("div")
    .attr("class", "statusmap-annotation-tooltip drop drop-popover drop-popover--annotation drop-element drop-enabled drop-target-attached-center drop-open drop-open-transitionend drop-after-open")
    .style("position", "absolute")
    this.tooltip = this.tooltipBase
      .append("div")
      .attr("class", "drop-content")
      .append("div")
      .append("annotation-tooltip")
      .append("div")
      .attr("class", "graph-annotation");
  }

  destroy() {
    if (this.tooltip) {
      this.tooltip.remove();
    }

    this.tooltip = null;

    if (this.tooltipBase) {
      this.tooltipBase.remove();
    }

    this.tooltipBase = null;

  }

  show(pos) {
    if (!this.panel.tooltip.show || !this.tooltip) { return; }
    // shared tooltip mode
    //if (pos.panelRelY) {
    //  return;
    //}

    let annoId = d3.select(pos.target).attr('annoId');
    if (!annoId) {
      this.destroy();
      return;
    }

    let anno = this.panelCtrl.annotations[annoId];
    if (!anno) {
      this.destroy();
      return;
    }

    let annoTitle = "";

    let tooltipTimeFormat = 'YYYY-MM-DD HH:mm:ss';
    let annoTime = this.dashboard.formatDate(anno.time, tooltipTimeFormat);
    let annoText = anno.text;
    let annoTags:any = [];
    if (anno.tags) {
      annoTags = _.map(anno.tags, t => ({"text": t, "backColor": "rgb(63, 43, 91)", "borderColor":"rgb(101, 81, 129)"}))
    }

    let tooltipHtml = `<div class="graph-annotation__header">
      <span class="graph-annotation__title">${annoTitle}</span>
    <span class="graph-annotation__time">${annoTime}</span></div>
    <div class="graph-annotation__body">
      <div>${annoText}</div>
      ${_.join(_.map(annoTags, t => `<span class="label label-tag small" style="background-color: ${t.backColor}; border-color: ${t.borderColor}">${t.text}</span>`), "")}
    </div>
      <div class="statusmap-histogram"></div>`;

    this.tooltip.html(tooltipHtml);

    this.move(pos);
  }

  move(pos) {
    if (!this.tooltipBase) { return; }

    let elem = $(this.tooltipBase.node())[0];
    let tooltipWidth = elem.clientWidth;
    let tooltipHeight = elem.clientHeight;

    let left = pos.pageX - tooltipWidth/2;
    let top = pos.pageY + TOOLTIP_PADDING_Y;

    if (pos.pageX + tooltipWidth/2 + 10 > window.innerWidth) {
      left = pos.pageX - tooltipWidth - TOOLTIP_PADDING_X;
    }

    if (pos.pageY - window.pageYOffset + tooltipHeight + 20 > window.innerHeight) {
      top = pos.pageY - tooltipHeight - TOOLTIP_PADDING_Y;
    }

    return this.tooltipBase
      .style("left", left + "px")
      .style("top", top + "px");
  }
}

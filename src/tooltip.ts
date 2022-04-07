import * as d3 from 'd3';
import $ from 'jquery';
import _ from 'lodash';

import { StatusHeatmapCtrl } from './module';

let TOOLTIP_PADDING_X = 30;
let TOOLTIP_PADDING_Y = 5;

// TODO rename file to tooltip_ctrl.ts
// TODO move DefaultValueDateFormat into tooltip.ts, as it used in several places (migration, partial and tooltip render)
let DefaultValueDateFormat = 'YYYY/MM/DD/HH_mm_ss';

export class StatusmapTooltip {
  tooltip: any;
  scope: any;
  dashboard: any;
  panelCtrl: StatusHeatmapCtrl;
  panel: any;
  panelElem: any;
  mouseOverBucket: any;
  originalFillColor: any;

  tooltipWidth: number;
  tooltipFrozen: any;

  constructor(elem: any, scope: any) {
    this.scope = scope;
    this.dashboard = scope.ctrl.dashboard;
    this.panelCtrl = scope.ctrl;
    this.panel = scope.ctrl.panel;
    this.panelElem = elem;
    this.mouseOverBucket = false;
    this.originalFillColor = null;

    elem.on('mouseover', this.onMouseOver.bind(this));
    elem.on('mouseleave', this.onMouseLeave.bind(this));
  }

  onMouseOver(e) {
    if (!this.panel.tooltip.show || !this.scope.ctrl.data || _.isEmpty(this.scope.ctrl.data)) {
      return;
    }

    if (!this.tooltip) {
      this.add();
      this.move(e, this.tooltip);
    }
  }

  onMouseLeave() {
    this.destroy();
  }

  onMouseMove(e) {
    if (!this.panel.tooltip.show) {
      return;
    }

    this.move(e, this.tooltip);
  }

  add() {
    this.tooltip = d3.select('body').append('div').attr('class', 'graph-tooltip statusmap-tooltip');
  }

  destroy() {
    if (this.tooltip) {
      this.tooltip.remove();
    }

    this.tooltip = null;
  }

  removeFrozen() {
    if (this.tooltipFrozen) {
      this.tooltipFrozen.remove();
      this.tooltipFrozen = null;
    }
  }

  showFrozen(pos: any) {
    this.removeFrozen();
    this.tooltipFrozen = d3
      .select(this.panelElem[0])
      .append('div')
      .attr('class', 'graph-tooltip statusmap-tooltip statusmap-tooltip-frozen');
    this.displayTooltip(pos, this.tooltipFrozen, true);
    this.moveRelative(pos, this.tooltipFrozen);
  }

  show(pos: any) {
    if (!this.panel.tooltip.show || !this.tooltip) {
      return;
    }

    // TODO support for shared tooltip mode
    if (pos.panelRelY) {
      return;
    }

    this.displayTooltip(pos, this.tooltip, false);

    this.move(pos, this.tooltip);
  }

  // Retrieve bucket and create html content inside tooltip’s div element.
  displayTooltip(pos: any, tooltip: any, frozen: boolean) {
    let cardEl = d3.select(pos.target);
    let yid = cardEl.attr('yid');
    let xid = cardEl.attr('xid');
    // @ts-ignore
    let bucket = this.panelCtrl.bucketMatrix.get(yid, xid); // TODO string-to-number conversion for xid
    if (!bucket || bucket.isEmpty()) {
      this.destroy();
      return;
    }

    let timestamp = bucket.to;
    let yLabel = bucket.yLabel;
    let pLabels = bucket.pLabels;
    let value = bucket.value;
    let values = bucket.values;
    // TODO create option for this formatting.
    let tooltipTimeFormat = 'YYYY-MM-DD HH:mm:ss';
    let time: Date = this.dashboard.formatDate(+timestamp, tooltipTimeFormat);

    // Close button for the frozen tooltip.
    let tooltipClose = ``;
    if (frozen) {
      tooltipClose = `
<a class="pointer pull-right small tooltip-close">
      <i class="fa fa-remove"></i>
</a>
`;
    }

    let tooltipHtml = `<div class="graph-tooltip-time">${time}${tooltipClose}</div>`;

    if (this.panel.color.mode === 'discrete') {
      let statuses;
      if (this.panel.seriesFilterIndex >= 0) {
        statuses = this.panelCtrl.discreteExtraSeries.convertValueToTooltips(value);
      } else {
        statuses = this.panelCtrl.discreteExtraSeries.convertValuesToTooltips(values);
      }

      let statusTitle = 'status:';
      if (statuses.length > 1) {
        statusTitle = 'statuses:';
      }
      tooltipHtml += `
      <div>
        name: <b>${yLabel}</b>
        <br>
        <span>${statusTitle}</span>
        <ul>
          ${_.join(
            _.map(
              statuses,
              v => `<li style="background-color: ${v.color}; text-align:center" class="discrete-item">${v.tooltip}</li>`
            ),
            ''
          )}
        </ul>
      </div>`;
    } else {
      if (values.length === 1) {
        tooltipHtml += `<div>
      name: <b>${yLabel}</b> <br>
      value: <b>${value}</b> <br>
      </div>`;
      } else {
        tooltipHtml += `<div>
      name: <b>${yLabel}</b> <br>
      values:
      <ul>
        ${_.join(
          _.map(values, v => `<li>${v}</li>`),
          ''
        )}
      </ul>
      </div>`;
      }
    }

    tooltipHtml += `<div class="statusmap-histogram"></div>`;

    if (this.panel.tooltip.showItems) {
      // Additional information: urls, etc.
      // Clone additional items
      let items: any = JSON.parse(JSON.stringify(this.panel.tooltip.items));

      let scopedVars = {};

      let valueVar;
      for (let i = 0; i < bucket.values.length; i++) {
        valueVar = `__value_${i}`;
        scopedVars[valueVar] = { value: bucket.values[i] };
      }
      scopedVars['__value'] = { value: bucket.value };
      scopedVars['__y_label'] = { value: yLabel };
      scopedVars['__y_label_trim'] = { value: yLabel.trim() };
      // Grafana 7.0 compatible
      scopedVars['__url_time_range'] = { value: this.panelCtrl.retrieveTimeVar() };

      //New vars based on partialLabels:
      for (let i in pLabels) {
        scopedVars[`__y_label_${i}`] = { value: pLabels[i] };
      }

      let bucketRangeExtension = Math.ceil((bucket.to - bucket.from) * 0.012);
      scopedVars[`__bucket_from`] = { value: bucket.from - bucketRangeExtension };
      scopedVars[`__bucket_to`] = { value: bucket.to + bucketRangeExtension };

      for (let item of items) {
        if (_.isEmpty(item.urlTemplate)) {
          item.link = '#';
        } else {
          let dateFormat = item.valueDateFormat;
          if (dateFormat === '') {
            dateFormat = DefaultValueDateFormat;
          }
          let valueDateVar;
          for (let i = 0; i < bucket.values.length; i++) {
            valueDateVar = `__value_${i}_date`;
            scopedVars[valueDateVar] = { value: this.dashboard.formatDate(+bucket.values[i], dateFormat) };
          }
          scopedVars['__value_date'] = { value: this.dashboard.formatDate(+bucket.value, dateFormat) };

          item.link = this.panelCtrl.templateSrv.replace(item.urlTemplate, scopedVars);

          // Force lowercase for link
          if (item.urlToLowerCase) {
            item.link = item.link.toLowerCase();
          }
        }

        item.label = item.urlText;
        if (_.isEmpty(item.label)) {
          item.label = _.isEmpty(item.urlTemplate) ? 'Empty URL' : _.truncate(item.link);
        }
      }

      if (this.panel.tooltip.showCustomContent) {
        let customContent: string = this.panelCtrl.templateSrv.replace(this.panel.tooltip.customContent, scopedVars);
        tooltipHtml += `<div>${customContent}</div>`;
      }

      tooltipHtml += _.join(
        _.map(
          items,
          v => `
          <div>
            <a href="${v.link}" target="_blank">
            <div class="dashlist-item">
            <p class="dashlist-link dashlist-link-dash-db">
              <span style="word-wrap: break-word;" class="dash-title">${v.label}</span><span class="dashlist-star">
              <i class="fa fa-${v.urlIcon}"></i>
            </span></p> </div></a><div>`
        ),
        '\n'
      );
    }

    // Ambiguous state: there multiple values in bucket!
    // TODO rename useMax to expectMultipleValues
    if (!this.panel.useMax && bucket.multipleValues) {
      tooltipHtml += `<div><b>Error:</b> ${this.panelCtrl.dataWarnings.multipleValues.title}</div>`;
    }

    // Discrete mode errors
    if (this.panel.color.mode === 'discrete') {
      if (bucket.noColorDefined) {
        let badValues = this.panelCtrl.discreteExtraSeries.getNotColoredValues(values);
        tooltipHtml += `<div><b>Error:</b> ${this.panelCtrl.dataWarnings.noColorDefined.title}
        <br>not colored values:
        <ul>
          ${_.join(
            _.map(badValues, v => `<li>${v}</li>`),
            ''
          )}
        </ul>
        </div>`;
      }
    }

    tooltip.html(tooltipHtml);

    // Assign mouse event handlers for "frozen" tooltip.
    if (frozen) {
      // Stop propagation mouse events up to parents to allow interaction with frozen tooltip’s elements.
      tooltip
        .on('click', function () {
          // @ts-ignore
          d3.event.stopPropagation();
        })
        .on('mousedown', function () {
          // @ts-ignore
          d3.event.stopPropagation();
        })
        .on('mouseup', function () {
          // @ts-ignore
          d3.event.stopPropagation();
        });

      // Activate close button
      tooltip.select('a.tooltip-close').on('click', this.removeFrozen.bind(this));
    }
  }

  // Move tooltip as absolute positioned element.
  move(pos, tooltip) {
    if (!tooltip) {
      return;
    }

    let elem = $(tooltip.node())[0];
    let tooltipWidth = elem.clientWidth;
    this.tooltipWidth = tooltipWidth;
    let tooltipHeight = elem.clientHeight;

    let left = pos.pageX + TOOLTIP_PADDING_X;
    let top = pos.pageY + TOOLTIP_PADDING_Y;

    if (pos.pageX + tooltipWidth + 40 > window.innerWidth) {
      left = pos.pageX - tooltipWidth - TOOLTIP_PADDING_X;
    }

    if (pos.pageY - window.pageYOffset + tooltipHeight + 20 > window.innerHeight) {
      top = pos.pageY - tooltipHeight - TOOLTIP_PADDING_Y;
    }

    return tooltip.style('left', left + 'px').style('top', top + 'px');
  }

  // Move tooltip relative to svg element of panel.
  moveRelative(pos, tooltip) {
    if (!tooltip) {
      return;
    }

    let panelX = pos.pageX - this.panelElem.offset().left;
    let panelY = pos.pageY - this.panelElem.offset().top;
    let panelWidth = this.panelElem.width();
    let panelHeight = this.panelElem.height();

    // 'position: relative' sets tooltip’s width to 100% of panel element.
    // Restore width from floating tooltip and add more space for 'Close' button.
    let tooltipWidth = this.tooltipWidth + 25;

    // Left property is clamped so tooltip stays inside panel bound box.
    let tooltipLeft = panelX + TOOLTIP_PADDING_X;
    if (tooltipLeft + tooltipWidth > panelWidth) {
      tooltipLeft = panelWidth - tooltipWidth;
    }
    if (tooltipLeft < 0) {
      tooltipLeft = 0;
    }

    // Frozen tooltip’s root element is appended next to panel’s svg element,
    // so top property is adjusted to move tooltip’s root element
    // up to the mouse pointer position.
    let tooltipTop = -(panelHeight - panelY + TOOLTIP_PADDING_Y);

    return tooltip
      .style('left', tooltipLeft + 'px')
      .style('top', tooltipTop + 'px')
      .style('width', tooltipWidth + 'px');
  }
}

import d3 from 'd3';
import _ from 'lodash';
import $ from 'jquery';
import { ExtraSeriesFormatValue } from './extra_series_format';

const TOOLTIP_PADDING_X = -50;
const TOOLTIP_PADDING_Y = 5;

export class StatusHeatmapTooltipExtraSeries {
    scope: any;
    dashboard: any;
    panelCtrl: any;
    panel: any;
    heatmapPanel: any;
    mouseOverBucket: any;
    originalFillColor: any;
    tooltip: any;

    constructor(elem: any, scope: any) {
        this.scope = scope;
        this.dashboard = scope.ctrl.dashboard;
        this.panelCtrl = scope.ctrl;
        this.panel = scope.ctrl.panel;
        this.heatmapPanel = elem;
        this.mouseOverBucket = false;
        this.originalFillColor = null;
    
        elem.on("mouseover", this.onMouseOver.bind(this));
        elem.on("click", this.onMouseClick.bind(this));
    }

        public onMouseOver(e: Event) {
            if (!this.panel.usingUrl || !this.scope.ctrl.data || _.isEmpty(this.scope.ctrl.data)) { 
                return; 
            }
        }

        public onMouseClick(e: Event) {
            if (!this.panel.usingUrl) { 
                return; 
            }

            this.destroy();
            this.add();
        }

        public add() {
            this.tooltip = d3.select("body")
              .append("div")
              .attr("class", "statusmap-tooltip-extraseries graph-tooltip grafana-tooltip");
        }

        public destroy() {
            if (this.tooltip) {
              this.tooltip.remove();
            }
        
            this.tooltip = null;
        }

        public show(pos: any) {
            if (!this.panel.usingUrl || !this.tooltip) { 
                return; 
            }

            // shared tooltip mode
            if (pos.panelRelY) {
                return;
            }

            let cardId: any = d3.select(pos.target).attr('cardId');
            
            if (!cardId) {
              this.destroy();
              
              return;
            }
            
            let card: any = this.panelCtrl.cardsData.cards[cardId];
            
            if (!card) {
              this.destroy();
              
              return;
            } 
            
            if (card.value == null) {
                this.destroy();
                
                return;
              }
              
            let x: any = card.x;
            let y: any = card.y;
            let value: any = card.value;
            let values: any = card.values;
            let tooltipTimeFormat: string = 'YYYY-MM-DD HH:mm:ss';
            let time: Date = this.dashboard.formatDate(+x, tooltipTimeFormat);
          
            let tooltipHtml: string = `<div class="graph-tooltip-time">${time}</div>`              
        
            if (this.panel.color.mode === 'discrete') {
            let statuses: any = "";
                
            if (this.panelCtrl.panel.seriesFilterIndex == -1) {
              statuses = this.panelCtrl.discreteExtraSeries.convertValuesToTooltips(values);
            } else {
                statuses = this.panelCtrl.discreteExtraSeries.convertValueToTooltips(value);
            }
          
            tooltipHtml += `
                <div>
                name: <b>${y}</b>
                <div>
                <br>
                <span>status:</span>
                <ul>
                  ${_.join(_.map(statuses, v => `<p style="background-color: ${v.color}; text-align:center" class="discrete-item">${v.tooltip}</p>`), "")}
                </ul>
                </div>      
                </div> <br>`;
            }
              
            tooltipHtml += `<div class="statusmap-histogram"></div>`;
              
            let urls: any = this.panelCtrl.panel.urls
            let rtime: any = this.panelCtrl.retrieveTimeVar();              

            let curl: any = JSON.parse(JSON.stringify(urls));

            for (let i = 0; i < curl.length; i++) {
                //Change name var
                curl[i].base_url = _.replace(curl[i].base_url, /\$series_label/g, y)
                //Set up extra series
                if (curl[i].useExtraSeries == true) {
                  let tf: any = curl[i].extraSeries.format
                  let vh: any = card.values[curl[i].extraSeries.index]
                  //let extraSeries: any = this.dashboard.formatDate(+vh, tf)
                  let series_extra: any = this.formatExtraSeries(vh,tf);

                  curl[i].base_url = _.replace(curl[i].base_url, /\$series_extra/g, series_extra)
                }
                //Change time var
                curl[i].base_url = _.replace(curl[i].base_url, /\$time/g, rtime)
          
                //Replace vars
                curl[i].base_url = this.panelCtrl.renderLink(curl[i].base_url, this.panelCtrl.variableSrv.variables)
            }
              
            if (this.panelCtrl.panel.usingUrl == true) {
                tooltipHtml += `
                <div bs-tooltip='Settings' data-placement="right">
                  ${_.join(_.map(curl, v => `<div ><a   href="${v.forcelowercase ? v.base_url.toLowerCase() : v.base_url}" target="_blank"><div class="dashlist-item">
                  <p  class="dashlist-link dashlist-link-dash-db"><span style="word-wrap: break-word;" class="dash-title">${v.label ? v.label : (v.base_url != "" ? _.truncate(v.base_url) : "Empty URL" )}</span><span class="dashlist-star">
                        <i class="fa fa-${v.icon_fa}"></i>
                      </span></p> </div></a><div>`), "")}
                </div> <br>`;
            }

            //   "Ambiguous bucket state: Multiple values!";
            if (!this.panel.useMax && card.multipleValues) {
                tooltipHtml += `<div><b>Error:</b> ${this.panelCtrl.dataWarnings.multipleValues.title}</div>`;
            }

            // Discrete mode errors
            if (this.panel.color.mode === 'discrete') {
                if (card.noColorDefined) {
                    let badValues: any = this.panelCtrl.discreteExtraSeries.getNotColoredValues(values);
                    tooltipHtml += `<div><b>Error:</b> ${this.panelCtrl.dataWarnings.noColorDefined.title}
                    <br>not colored values:
                    <ul>
                    ${_.join(_.map(badValues, v => `<li>${v}</li>`), "")}
                    </ul>
                    </div>`;
                }
            }

            this.tooltip.html(tooltipHtml);

            this.move(pos);
        }

        public formatExtraSeries (value: any, type: any) {
            let extraSeries: any = '';

            switch(type) {
                case ExtraSeriesFormatValue.Date:
                    extraSeries = this.dashboard.formatDate(+value, type);
                    return extraSeries;
                case ExtraSeriesFormatValue.Raw:
                    extraSeries = value;
                    return extraSeries;
                default:
                    return extraSeries;
            }
        }

        public move(pos: any) {
            if (!this.tooltip) { 
                return; 
            }

            let elem: any = $(this.tooltip.node())[0];
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
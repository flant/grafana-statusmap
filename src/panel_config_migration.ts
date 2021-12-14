import _ from 'lodash';

function migrate_V0_V1(panel: any) {
  // Remove unused fields.
  if (_.has(panel, 'xAxis.labelFormat')) {
    delete panel.xAxis.labelFormat;
  }
  if (_.has(panel, 'xAxis.minBucketWidthToShowWeekends')) {
    delete panel.xAxis.minBucketWidthToShowWeekends;
  }
  if (_.has(panel, 'xAxis.showCrosshair')) {
    delete panel.xAxis.showCrosshair;
  }
  if (_.has(panel, 'xAxis.showWeekends')) {
    delete panel.xAxis.showWeekends;
  }
  if (_.has(panel, 'yAxis.showCrosshair')) {
    delete panel.yAxis.showCrosshair;
  }
  if (_.has(panel, 'data.unitFormat')) {
    delete panel.data;
  }

  // Migrate cardSpacing value. Seems rare (update from version 0.0.2).
  if (_.has(panel, 'cards.cardSpacing')) {
    if (!_.has(panel, 'cards.cardVSpacing')) {
      if (panel.cards.cardSpacing) {
        panel.cards.cardVSpacing = panel.cards.cardSpacing;
        panel.cards.cardHSpacing = panel.cards.cardSpacing;
      }
    }
    delete panel.cards.cardSpacing;
  }

  // Migrate initial config for urls in tooltip (pull/86).
  // 'usingUrl' was used to show tooltip with urls on click or not.
  if (_.has(panel, 'usingUrl')) {
    if (!_.has(panel, 'tooltip.freezeOnClick')) {
      panel.tooltip.freezeOnClick = panel.usingUrl;
    }
    delete panel.usingUrl;
  }

  // 'urls' array is now tooltip.items array. Also items are changed.
  if (_.has(panel, 'urls')) {
    if (!_.has(panel, 'tooltip.items')) {
      panel.tooltip.items = [];
      let hasRealItems = true;
      if (panel.urls.length === 0) {
        hasRealItems = false;
      }
      if (panel.urls.length === 1) {
        let url = panel.urls[0];
        if (url.base_url === '' && url.label === '') {
          hasRealItems = false;
        }
      }
      if (hasRealItems) {
        panel.tooltip.showItems = true;
        for (let url of panel.urls) {
          let item = {
            urlTemplate: _.toString(url.base_url),
            urlText: _.toString(url.label),
            urlIcon: _.toString(url.icon_fa),
            urlToLowerCase: url.forcelowercase,
            valueDateFormat: '',
          };
          // replace $vars with new ${__vars} if url template is not empty
          if (item.urlTemplate !== '') {
            // $time was a graph time with prepended &
            item.urlTemplate = _.replace(url.base_url, /\$time/g, '&${__url_time_range}');
            // $series_label was a y axis label
            item.urlTemplate = _.replace(item.urlTemplate, /\$series_label/, '${__y_label}');
            // $series_extra was a value from bucket. This value has format options and index.
            let valueVar = '__value';
            if (url.useExtraSeries === true) {
              // index?
              if (url.extraSeries.index > -1) {
                valueVar += '_' + url.extraSeries.index;
              }

              let format = _.toString(url.extraSeries.format);
              if (format === 'YYYY/MM/DD/HH_mm_ss') {
                valueVar += '_date';
                item.valueDateFormat = format;
              }
            }

            item.urlTemplate = _.replace(item.urlTemplate, /\$series_extra/, `\${${valueVar}}`);
          }
          panel.tooltip.items.push(item);
        }
      }
    }
    delete panel.urls;
  }

  // create statusmap metadata
  panel.statusmap = {
    ConfigVersion: 'v1',
  };
}

export function migratePanelConfig(panel: any) {
  if (_.has(panel, 'statusmap')) {
    if (panel.statusmap.ConfigVersion === 'v1') {
      return;
    }
  } else {
    migrate_V0_V1(panel);
  }
  return;
}

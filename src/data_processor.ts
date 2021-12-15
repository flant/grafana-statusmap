import { find } from 'lodash';
// import { colors } from '@grafana/ui';
import {
  DataFrame,
  dateTime,
  Field,
  FieldType,
  // getColorForTheme,
  getFieldDisplayName,
  getTimeField,
  TimeRange,
} from '@grafana/data';
import TimeSeries from 'grafana/app/core/time_series2';
// import config from 'grafana/app/core/config';

type Options = {
  dataList: DataFrame[];
  range?: TimeRange;
};

export class DataProcessor {
  constructor(private panel: any, private grafanaVersion: number) {}

  getSeriesList(options: Options): TimeSeries[] {
    const list: TimeSeries[] = [];
    const { dataList, range } = options;

    if (!dataList || !dataList.length) {
      return list;
    }

    for (let i = 0; i < dataList.length; i++) {
      const series = dataList[i];
      const { timeField } = getTimeField(series);

      if (!timeField) {
        continue;
      }

      for (let j = 0; j < series.fields.length; j++) {
        const field = series.fields[j];

        if (field.type !== FieldType.number) {
          continue;
        }
        /**
         * Since v8.x getFieldDisplayName() will return series name as: column_name + tag_value
         * column_name is redundant and be omitted for concise label display
         *
         * e.g. "input_qty 1395T2776201" ==> "1395T2776201"
         */
        const fullname = getFieldDisplayName(field, series, dataList);
        let name = fullname;
        if (this.grafanaVersion >= 8) {
          const spcpos = fullname.indexOf(' ');
          name = spcpos >= 0 ? fullname.slice(spcpos) : name;
        }
        const datapoints = [];

        for (let r = 0; r < series.length; r++) {
          datapoints.push([field.values.get(r), dateTime(timeField.values.get(r)).valueOf()]);
        }
        const timeSeries = {
          ...this.toTimeSeries(field, name, i, j, datapoints, list.length, range),
          target: name,
          refId: series.refId,
        };
        list.push(timeSeries as any);
      }
    }

    // Merge all the rows if we want to show a histogram
    /* if (this.panel.xaxis.mode === 'histogram' && !this.panel.stack && list.length > 1) {
      const first = list[0];
      first.alias = first.aliasEscaped = 'Count';

      for (let i = 1; i < list.length; i++) {
        first.datapoints = first.datapoints.concat(list[i].datapoints);
      }

      return [first];
    } */

    return list;
  }

  private toTimeSeries(
    field: Field,
    alias: string,
    dataFrameIndex: number,
    fieldIndex: number,
    datapoints: any[][],
    index: number,
    range?: TimeRange
  ) {
    // const colorIndex = index % colors.length;
    // const color = this.panel.aliasColors[alias] || colors[colorIndex];

    const series = new TimeSeries({
      datapoints: datapoints || [],
      alias: alias,
      // color: getColorForTheme(color, config.theme),
      unit: field.config ? field.config.unit : undefined,
      dataFrameIndex,
      fieldIndex,
    });

    if (datapoints && datapoints.length > 0 && range) {
      const last = datapoints[datapoints.length - 1][1];
      const from = range.from;

      if (last - from.valueOf() < -10000) {
        // If the data is in reverse order
        const first = datapoints[0][1];
        if (first - from.valueOf() < -10000) {
          series.isOutsideRange = true;
        }
      }
    }
    return series;
  }

  setPanelDefaultsForNewXAxisMode() {
    switch (this.panel.xaxis.mode) {
      case 'time': {
        this.panel.bars = false;
        this.panel.lines = true;
        this.panel.points = false;
        this.panel.legend.show = true;
        this.panel.tooltip.shared = true;
        this.panel.xaxis.values = [];
        break;
      }
      case 'series': {
        this.panel.bars = true;
        this.panel.lines = false;
        this.panel.points = false;
        this.panel.stack = false;
        this.panel.legend.show = false;
        this.panel.tooltip.shared = false;
        this.panel.xaxis.values = ['total'];
        break;
      }
      case 'histogram': {
        this.panel.bars = true;
        this.panel.lines = false;
        this.panel.points = false;
        this.panel.stack = false;
        this.panel.legend.show = false;
        this.panel.tooltip.shared = false;
        break;
      }
    }
  }

  validateXAxisSeriesValue() {
    switch (this.panel.xaxis.mode) {
      case 'series': {
        if (this.panel.xaxis.values.length === 0) {
          this.panel.xaxis.values = ['total'];
          return;
        }

        const validOptions = this.getXAxisValueOptions({});
        const found: any = find(validOptions, { value: this.panel.xaxis.values[0] });
        if (!found) {
          this.panel.xaxis.values = ['total'];
        }
        return;
      }
    }
  }

  getXAxisValueOptions(options: any) {
    switch (this.panel.xaxis.mode) {
      case 'series': {
        return [
          { text: 'Avg', value: 'avg' },
          { text: 'Min', value: 'min' },
          { text: 'Max', value: 'max' },
          { text: 'Total', value: 'total' },
          { text: 'Count', value: 'count' },
        ];
      }
    }

    return [];
  }

  pluckDeep(obj: any, property: string) {
    const propertyParts = property.split('.');
    let value = obj;
    for (let i = 0; i < propertyParts.length; ++i) {
      if (value[propertyParts[i]]) {
        value = value[propertyParts[i]];
      } else {
        return undefined;
      }
    }
    return value;
  }
}

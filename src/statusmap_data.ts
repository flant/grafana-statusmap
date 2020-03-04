// A holder of a group of values
class Bucket {
  // uniq id
  id: number = 0;
  // Array of values in this bucket
  values: any[] = [];
  columns: any[] = []; // From pr/86
  // a bucket has multiple values
  multipleValues: boolean = false;
  // a bucket has values that has no mapped color
  noColorDefined: boolean = false;
  // y label
  y: string = "";
  yLabel: string = "";
  // This value can be used to calculate a x coordinate on a graph
  x: number = 0;
  xid: number = 0;
  // a time range of this bucket
  from: number = 0;
  to: number = 0;
  // to and from relative to real "from"
  relFrom: number = 0;
  relTo: number = 0;

  mostRecent: boolean = false;

  // Saved minimum and maximum of values in this bucket
  minValue: number = 0;
  maxValue: number = 0;
  // A value if multiple values is not allowed
  value: number = 0;

  constructor() {
  }

  belong(ts: number): boolean {
    return ts >= this.from && ts <= this.to;
  }

  put(value: any) {
    this.values.push(value);
  }

  done() {
    // calculate min, max, value
  }

  isEmpty(): boolean {
    return this.values.length == 0;
  }

}


class BucketMatrix {
  // buckets for each y label
  buckets: {[yLabel: string]: Bucket[]} = {};
  maxValue: number = 0;
  minValue: number = 0;
  multipleValues: boolean = false;
  noColorDefined: boolean = false;
  // a flag that indicate that buckets has stub values
  noDatapoints: boolean = false;

  targets: string[] = [];
  rangeMs: number = 0;
  intervalMs: number = 0;

  xBucketSize: number = 0; // TODO remove: a transition from CardsData

  constructor() {
  }

  get(yid: string, xid: number): Bucket {
    if (yid in this.buckets) {
      if (xid in this.buckets[yid]) {
        return this.buckets[yid][xid];
      }
    }
    return new Bucket();
  }

  hasData(): boolean {
    let hasData = false;
    if (this.targets.length > 0) {
      this.targets.map((target:string) => {
        if (this.buckets[target].length > 0) {
          hasData = true;
        }
      });
    }
    return hasData;
  }
}

export {Bucket, BucketMatrix };
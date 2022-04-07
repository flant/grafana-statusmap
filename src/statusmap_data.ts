// A holder of a group of values
class Bucket {
  // uniq id
  id = 0;
  // Array of values in this bucket
  values: any[] = [];
  columns: any[] = []; // From pr/86
  // a bucket has multiple values
  multipleValues = false;
  // a bucket has values that has no mapped color
  noColorDefined = false;
  // y label
  y = '';
  yLabel = '';
  pLabels: string[] = [];

  // This value can be used to calculate a x coordinate on a graph
  x = 0;
  xid = 0;
  // a time range of this bucket
  from = 0;
  to = 0;
  // to and from relative to real "from"
  relFrom = 0;
  relTo = 0;

  mostRecent = false;

  // Saved minimum and maximum of values in this bucket
  minValue = 0;
  maxValue = 0;
  // A value if multiple values is not allowed
  value = 0;

  constructor() {}

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
    return this.values.length === 0;
  }
}

class BucketMatrix {
  // buckets for each y label
  buckets: { [yLabel: string]: Bucket[] } = {};
  maxValue = 0;
  minValue = 0;
  multipleValues = false;
  noColorDefined = false;
  // a flag that indicate that buckets has stub values
  noDatapoints = false;

  // An array of row labels
  targets: string[] = [];
  pLabels: { [target: string]: string[] } = {};
  rangeMs = 0;
  intervalMs = 0;

  xBucketSize = 0; // TODO remove: a transition from CardsData

  constructor() {}

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
      this.targets.map((target: string) => {
        if (this.buckets[target].length > 0) {
          hasData = true;
        }
      });
    }
    return hasData;
  }
}

export var pagerChanged: any = { name: 'statusmap-pager-changed' };

class BucketMatrixPager {
  bucketMatrix: BucketMatrix;
  enable: boolean;
  defaultPageSize = -1;
  pageSize = -1;
  currentPage = 0;

  constructor() {
    let m = new BucketMatrix();

    this.bucketMatrix = m;
  }

  // An array of row labels for current page.
  targets(): string[] {
    if (!this.enable) {
      return this.bucketMatrix.targets;
    }

    return this.bucketMatrix.targets.slice(this.pageSize * this.currentPage, this.pageSize * (this.currentPage + 1));
  }

  buckets(): { [yLabel: string]: Bucket[] } {
    if (!this.enable) {
      return this.bucketMatrix.buckets;
    }

    let buckets: { [yLabel: string]: Bucket[] } = {};
    let me = this;

    this.targets().map(function (rowLabel) {
      buckets[rowLabel] = me.bucketMatrix.buckets[rowLabel];
    });

    return buckets;
  }

  setEnable(enable: boolean) {
    this.enable = enable;
  }

  setCurrent(num: number): void {
    this.currentPage = num;
  }

  setDefaultPageSize(num: number): void {
    this.defaultPageSize = num;
  }

  setPageSize(num: number): void {
    this.pageSize = num;
  }

  pages(): number {
    return Math.ceil(this.totalRows() / this.pageSize);
  }

  totalRows(): number {
    return this.bucketMatrix.targets.length;
  }

  pageStartRow(): number {
    if (!this.enable) {
      return 1;
    }
    return this.pageSize * this.currentPage + 1;
  }

  pageEndRow(): number {
    if (!this.enable) {
      return this.totalRows();
    }

    let last = this.pageSize * (this.currentPage + 1);
    if (last > this.totalRows()) {
      return this.totalRows();
    }

    return last;
  }

  hasNext(): boolean {
    if (!this.enable) {
      return false;
    }

    if ((this.currentPage + 1) * this.pageSize >= this.totalRows()) {
      return false;
    }

    return true;
    // currentPage >= ctrl.bucketMatrix.targets.length/ctrl.pageSizeViewer - 1 || ctrl.numberOfPages == 0
  }

  hasPrev(): boolean {
    if (!this.enable) {
      return false;
    }

    return this.currentPage > 0;
  }

  switchToNext() {
    if (this.hasNext()) {
      this.currentPage = this.currentPage + 1;
    }
  }

  switchToPrev() {
    if (this.hasPrev()) {
      this.currentPage = this.currentPage - 1;
    }
  }
}

export { Bucket, BucketMatrix, BucketMatrixPager };

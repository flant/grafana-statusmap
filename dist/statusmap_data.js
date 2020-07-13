"use strict";

System.register([], function (_export, _context) {
  "use strict";

  var Bucket, BucketMatrix, pagerChanged, BucketMatrixPager;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  return {
    setters: [],
    execute: function () {
      // A holder of a group of values
      _export("Bucket", Bucket =
      /*#__PURE__*/
      function () {
        // uniq id
        // Array of values in this bucket
        // From pr/86
        // a bucket has multiple values
        // a bucket has values that has no mapped color
        // y label
        // This value can be used to calculate a x coordinate on a graph
        // a time range of this bucket
        // to and from relative to real "from"
        // Saved minimum and maximum of values in this bucket
        // A value if multiple values is not allowed
        function Bucket() {
          _classCallCheck(this, Bucket);

          _defineProperty(this, "id", 0);

          _defineProperty(this, "values", []);

          _defineProperty(this, "columns", []);

          _defineProperty(this, "multipleValues", false);

          _defineProperty(this, "noColorDefined", false);

          _defineProperty(this, "y", "");

          _defineProperty(this, "yLabel", "");

          _defineProperty(this, "x", 0);

          _defineProperty(this, "xid", 0);

          _defineProperty(this, "from", 0);

          _defineProperty(this, "to", 0);

          _defineProperty(this, "relFrom", 0);

          _defineProperty(this, "relTo", 0);

          _defineProperty(this, "mostRecent", false);

          _defineProperty(this, "minValue", 0);

          _defineProperty(this, "maxValue", 0);

          _defineProperty(this, "value", 0);
        }

        _createClass(Bucket, [{
          key: "belong",
          value: function belong(ts) {
            return ts >= this.from && ts <= this.to;
          }
        }, {
          key: "put",
          value: function put(value) {
            this.values.push(value);
          }
        }, {
          key: "done",
          value: function done() {// calculate min, max, value
          }
        }, {
          key: "isEmpty",
          value: function isEmpty() {
            return this.values.length == 0;
          }
        }]);

        return Bucket;
      }());

      _export("BucketMatrix", BucketMatrix =
      /*#__PURE__*/
      function () {
        // buckets for each y label
        // a flag that indicate that buckets has stub values
        // An array of row labels
        // TODO remove: a transition from CardsData
        function BucketMatrix() {
          _classCallCheck(this, BucketMatrix);

          _defineProperty(this, "buckets", {});

          _defineProperty(this, "maxValue", 0);

          _defineProperty(this, "minValue", 0);

          _defineProperty(this, "multipleValues", false);

          _defineProperty(this, "noColorDefined", false);

          _defineProperty(this, "noDatapoints", false);

          _defineProperty(this, "targets", []);

          _defineProperty(this, "rangeMs", 0);

          _defineProperty(this, "intervalMs", 0);

          _defineProperty(this, "xBucketSize", 0);
        }

        _createClass(BucketMatrix, [{
          key: "get",
          value: function get(yid, xid) {
            if (yid in this.buckets) {
              if (xid in this.buckets[yid]) {
                return this.buckets[yid][xid];
              }
            }

            return new Bucket();
          }
        }, {
          key: "hasData",
          value: function hasData() {
            var _this = this;

            var hasData = false;

            if (this.targets.length > 0) {
              this.targets.map(function (target) {
                if (_this.buckets[target].length > 0) {
                  hasData = true;
                }
              });
            }

            return hasData;
          }
        }]);

        return BucketMatrix;
      }());

      _export("pagerChanged", pagerChanged = {
        name: 'statusmap-pager-changed'
      });

      _export("BucketMatrixPager", BucketMatrixPager =
      /*#__PURE__*/
      function () {
        function BucketMatrixPager() {
          _classCallCheck(this, BucketMatrixPager);

          _defineProperty(this, "bucketMatrix", void 0);

          _defineProperty(this, "enable", void 0);

          _defineProperty(this, "defaultPageSize", -1);

          _defineProperty(this, "pageSize", -1);

          _defineProperty(this, "currentPage", 0);

          var m = new BucketMatrix();
          this.bucketMatrix = m;
        } // An array of row labels for current page.


        _createClass(BucketMatrixPager, [{
          key: "targets",
          value: function targets() {
            if (!this.enable) {
              return this.bucketMatrix.targets;
            }

            return this.bucketMatrix.targets.slice(this.pageSize * this.currentPage, this.pageSize * (this.currentPage + 1));
          }
        }, {
          key: "buckets",
          value: function buckets() {
            if (!this.enable) {
              return this.bucketMatrix.buckets;
            }

            var buckets = {};
            var me = this;
            this.targets().map(function (rowLabel) {
              buckets[rowLabel] = me.bucketMatrix.buckets[rowLabel];
            });
            return buckets;
          }
        }, {
          key: "setEnable",
          value: function setEnable(enable) {
            this.enable = enable;
          }
        }, {
          key: "setCurrent",
          value: function setCurrent(num) {
            this.currentPage = num;
          }
        }, {
          key: "setDefaultPageSize",
          value: function setDefaultPageSize(num) {
            this.defaultPageSize = num;
          }
        }, {
          key: "setPageSize",
          value: function setPageSize(num) {
            this.pageSize = num;
          }
        }, {
          key: "pages",
          value: function pages() {
            return Math.ceil(this.totalRows() / this.pageSize);
          }
        }, {
          key: "totalRows",
          value: function totalRows() {
            return this.bucketMatrix.targets.length;
          }
        }, {
          key: "pageStartRow",
          value: function pageStartRow() {
            if (!this.enable) {
              return 1;
            }

            return this.pageSize * this.currentPage + 1;
          }
        }, {
          key: "pageEndRow",
          value: function pageEndRow() {
            if (!this.enable) {
              return this.totalRows();
            }

            var last = this.pageSize * (this.currentPage + 1);

            if (last > this.totalRows()) {
              return this.totalRows();
            }

            return last;
          }
        }, {
          key: "hasNext",
          value: function hasNext() {
            if (!this.enable) {
              return false;
            }

            if ((this.currentPage + 1) * this.pageSize >= this.totalRows()) {
              return false;
            }

            return true; // currentPage >= ctrl.bucketMatrix.targets.length/ctrl.pageSizeViewer - 1 || ctrl.numberOfPages == 0
          }
        }, {
          key: "hasPrev",
          value: function hasPrev() {
            if (!this.enable) {
              return false;
            }

            return this.currentPage > 0;
          }
        }, {
          key: "switchToNext",
          value: function switchToNext() {
            if (this.hasNext()) {
              this.currentPage = this.currentPage + 1;
            }
          }
        }, {
          key: "switchToPrev",
          value: function switchToPrev() {
            if (this.hasPrev()) {
              this.currentPage = this.currentPage - 1;
            }
          }
        }]);

        return BucketMatrixPager;
      }());
    }
  };
});
//# sourceMappingURL=statusmap_data.js.map

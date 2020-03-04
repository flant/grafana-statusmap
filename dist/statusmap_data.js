"use strict";

System.register([], function (_export, _context) {
  "use strict";

  var Bucket, BucketMatrix;

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
    }
  };
});
//# sourceMappingURL=statusmap_data.js.map

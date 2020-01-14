"use strict";

System.register([], function (_export, _context) {
  "use strict";

  var Card, CardsStorage;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  return {
    setters: [],
    execute: function () {
      // A holder of values
      _export("Card", Card = // uniq
      // Array of values in this bucket
      // card has multiple values
      // card has values that has no color
      //
      //
      //
      function Card() {
        _classCallCheck(this, Card);

        _defineProperty(this, "id", 0);

        _defineProperty(this, "values", []);

        _defineProperty(this, "columns", []);

        _defineProperty(this, "multipleValues", false);

        _defineProperty(this, "noColorDefined", false);

        _defineProperty(this, "y", "");

        _defineProperty(this, "x", 0);

        _defineProperty(this, "minValue", 0);

        _defineProperty(this, "maxValue", 0);

        _defineProperty(this, "value", 0);
      });

      _export("CardsStorage", CardsStorage = function CardsStorage() {
        _classCallCheck(this, CardsStorage);

        _defineProperty(this, "cards", []);

        _defineProperty(this, "xBucketSize", 0);

        _defineProperty(this, "yBucketSize", 0);

        _defineProperty(this, "maxValue", void 0);

        _defineProperty(this, "minValue", void 0);

        _defineProperty(this, "multipleValues", false);

        _defineProperty(this, "noColorDefined", false);

        _defineProperty(this, "targets", []);

        _defineProperty(this, "targetIndex", void 0);

        this.maxValue = 0;
        this.minValue = 0;
      });
    }
  };
});
//# sourceMappingURL=statusmap_data.js.map

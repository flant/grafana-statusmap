"use strict";

System.register([], function (_export, _context) {
  "use strict";

  var ExtraSeriesFormat, ExtraSeriesFormatValue;

  _export({
    ExtraSeriesFormat: void 0,
    ExtraSeriesFormatValue: void 0
  });

  return {
    setters: [],
    execute: function () {
      (function (ExtraSeriesFormat) {
        ExtraSeriesFormat["Date"] = "Date";
        ExtraSeriesFormat["Raw"] = "Raw";
      })(ExtraSeriesFormat || _export("ExtraSeriesFormat", ExtraSeriesFormat = {}));

      (function (ExtraSeriesFormatValue) {
        ExtraSeriesFormatValue["Date"] = "YYYY/MM/DD/HH_mm_ss";
        ExtraSeriesFormatValue["Raw"] = "";
      })(ExtraSeriesFormatValue || _export("ExtraSeriesFormatValue", ExtraSeriesFormatValue = {}));
    }
  };
});
//# sourceMappingURL=extra_series_format.js.map

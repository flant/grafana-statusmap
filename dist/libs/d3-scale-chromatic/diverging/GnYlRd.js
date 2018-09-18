"use strict";

System.register(["../colors", "../ramp"], function (_export, _context) {
  "use strict";

  var colors, ramp, scheme;
  return {
    setters: [function (_colors) {
      colors = _colors.default;
    }, function (_ramp) {
      ramp = _ramp.default;
    }],
    execute: function () {
      _export("scheme", scheme = new Array(3).concat("91cf60ffffbffc8d59", "1a9641a6d96afdae61d7191c", "1a9641a6d96affffbffdae61d7191c", "1a985091cf60d9ef8bfee08bfc8d59d73027", "1a985091cf60d9ef8bffffbffee08bfc8d59d73027", "1a985066bd63a6d96ad9ef8bfee08bfdae61f46d43d73027", "1a985066bd63a6d96ad9ef8bffffbffee08bfdae61f46d43d73027", "0068371a985066bd63a6d96ad9ef8bfee08bfdae61f46d43d73027a50026", "0068371a985066bd63a6d96ad9ef8bffffbffee08bfdae61f46d43d73027a50026").map(colors));

      _export("scheme", scheme);

      _export("default", ramp(scheme));
    }
  };
});
//# sourceMappingURL=GnYlRd.js.map

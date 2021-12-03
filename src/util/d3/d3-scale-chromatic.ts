import * as d3 from 'd3';
import * as d3ScaleChromaticOrig from 'd3-scale-chromatic';

// Add GnYlRd color schema to d3-scale-chromatic

let GnYlRdScheme = new Array(3)
  .concat(
    '91cf60ffffbffc8d59',
    '1a9641a6d96afdae61d7191c',
    '1a9641a6d96affffbffdae61d7191c',
    '1a985091cf60d9ef8bfee08bfc8d59d73027',
    '1a985091cf60d9ef8bffffbffee08bfc8d59d73027',
    '1a985066bd63a6d96ad9ef8bfee08bfdae61f46d43d73027',
    '1a985066bd63a6d96ad9ef8bffffbffee08bfdae61f46d43d73027',
    '0068371a985066bd63a6d96ad9ef8bfee08bfdae61f46d43d73027a50026',
    '0068371a985066bd63a6d96ad9ef8bffffbffee08bfdae61f46d43d73027a50026'
  )
  .map(function (specifier) {
    var n = (specifier.length / 6) | 0,
      colors = new Array(n),
      i = 0;
    while (i < n) {
      colors[i] = '#' + specifier.slice(i * 6, ++i * 6);
    }
    return colors;
  });

let GnYlRd = d3.interpolateRgbBasis(GnYlRdScheme[GnYlRdScheme.length - 1]);

let d3ScaleChromatic = {
  ...d3ScaleChromaticOrig,
  interpolateGnYlRd: GnYlRd,
};

export { d3ScaleChromatic };

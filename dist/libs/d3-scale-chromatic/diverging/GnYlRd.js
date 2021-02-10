import colors from "../colors";
import ramp from "../ramp";

export var scheme = new Array(3).concat(
  "91cf60ffffbffc8d59",
  "1a9641a6d96afdae61d7191c",
  "1a9641a6d96affffbffdae61d7191c",
  "1a985091cf60d9ef8bfee08bfc8d59d73027",
  "1a985091cf60d9ef8bffffbffee08bfc8d59d73027",
  "1a985066bd63a6d96ad9ef8bfee08bfdae61f46d43d73027",
  "1a985066bd63a6d96ad9ef8bffffbffee08bfdae61f46d43d73027",
  "0068371a985066bd63a6d96ad9ef8bfee08bfdae61f46d43d73027a50026",
  "0068371a985066bd63a6d96ad9ef8bffffbffee08bfdae61f46d43d73027a50026"
).map(colors);

export default ramp(scheme);

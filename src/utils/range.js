/**
 * Create a range of string numbers from start to stop
 * start is inclusive and stop is exclusive
 */

module.exports.range = (start, stop) => {
  return Array.from(new Array(stop - start), (_, i) => (i + start).toString());
};
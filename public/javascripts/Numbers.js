Number.prototype.round = function(p) {
  p = p || 10;
  return parseFloat( this.toFixed(p) );
};
define('c', ['a', 'b'], function(b, c) {
  return b + c;
});
define('a', [], function() {
  return 1;
});
define('b', [], function() {
  return 3;
});
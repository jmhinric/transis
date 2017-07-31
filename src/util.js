var toString = Object.prototype.toString;

var seenObjects = [];

// Internal: Used by `detectRecursion` to check to see if the given pair of objects has been
// encountered yet on a previous recursive call.
//
// o1 - The first object to check for recursion.
// o2 - The paired object to check for recursion.
//
// Returns `true` if the pair has been seen previously and `false` otherwise.
function seen(o1, o2) {
  var i, len;

  for (i = 0, len = seenObjects.length; i < len; i++) {
    if (seenObjects[i][0] === o1 && seenObjects[i][1] === o2) {
      return true;
    }
  }

  return false;
}

// Internal: Used by `detectRecursion` to mark the given pair of objects as seen before recursing.
//
// o1 - The first object to mark.
// o2 - The paired object to mark.
//
// Returns nothing.
function mark(o1, o2) { seenObjects.push([o1, o2]); }

// Internal: Used by `detectRecursion` to unmark the given pair of objects after a recursive call
// has completed.
//
// o1 - The first object to unmark.
// o2 - The paired object to unmark.
//
// Returns nothing.
function unmark(o1, o2) {
  var i, n;

  for (i = 0, n = seenObjects.length; i < n; i++) {
    if (seenObjects[i][0] === o1 && seenObjects[i][1] === o2) {
      seenObjects.splice(i, 1);
      return;
    }
  }
}

// Internal: Used by `getPath` to resolve a path into a value.
//
// o            - The object to resolve the path from.
// pathSegments - An array of strings representing segments of the path to resolve.
//
// Returns the resolved value or `undefined` if some segment of the path does not exist.
function _getPath(o, pathSegments) {
  if (o == null) { return undefined; }

  var head = pathSegments[0], tail = pathSegments.slice(1);

  if (Array.isArray(o) && !(head in o)) {
    o = o.reduce(function(acc, x) {
      if (!x) { return acc; }

      var y = x[head];

      if (Array.isArray(y)) { acc.push.apply(acc, y); }
      else { acc.push(y); }

      return acc;
    }, []);
  }
  else {
    o = o[head];
  }

  if (!tail.length) { return o; }
  else { return o ? _getPath(o, tail) : undefined; }
}

// Internal: Used to detect cases of recursion on the same pair of objects. Returns `true` if the
// given objects have already been seen. Otherwise the given function is called and `false` is
// returned.
//
// This function is used internally when traversing objects and arrays to avoid getting stuck in
// infinite loops when circular objects are encountered. It should be wrapped around all recursive
// function calls where a circular object may be encountered. See `Transis.eq` for an example.
//
// o1 - The first object to check for recursion.
// o2 - The paired object to check for recursion (default: `undefined`).
// f  - A function that make the recursive funciton call.
//
// Returns `true` if recursion on the given objects has been detected. If the given pair of objects
//   has yet to be seen, calls `f` and returns `false`.
export function detectRecursion(o1, o2, f) {
  if (arguments.length === 2) { f = o2; o2 = undefined; }

  if (seen(o1, o2)) {
    return true;
  }
  else {
    mark(o1, o2);
    try { f(); } finally { unmark(o1, o2); }
    return false;
  }
};

// Public: Returns a string indicating the type of the given object. This can be considered an
// enhanced version of the javascript `typeof` operator.
//
// Examples
//
//   Transis.type([])       // => 'array'
//   Transis.type({})       // => 'object'
//   Transis.type(9)        // => 'number'
//   Transis.type(/fo*/)    // => 'regexp'
//   Transis.type(new Date) // => 'date'
//
// o - The object to get the type of.
//
// Returns a string indicating the object's type.
export function type(o) {
  if (o === null)      { return 'null'; }
  if (o === undefined) { return 'undefined'; }
  if (o !== o)         { return 'NaN'; }

  switch (toString.call(o)) {
  case '[object Array]':
    return 'array';
  case '[object Arguments]':
    return 'arguments';
  case '[object Function]':
    return 'function';
  case '[object String]':
    return 'string';
  case '[object Number]':
    return 'number';
  case '[object Boolean]':
    return 'boolean';
  case '[object Date]':
    return 'date';
  case '[object RegExp]':
    return 'regexp';
  case '[object Object]':
    if (o.hasOwnProperty('callee')) { return 'arguments'; } // ie fallback
    else { return 'object'; }
  }

  return 'unknown';
};

// Public: Performs an object equality test. If the first argument is a `Transis.Object` then it is
// sent the `eq` method, otherwise custom equality code is run based on the object type.
//
// a - Any object.
// b - Any object.
//
// Returns `true` if the objects are equal and `false` otherwise.
export function eq(a, b) {
  var atype, btype;

  // identical objects are equal
  if (a === b) { return true; }

  // if the first argument is a Transis.Object, delegate to its `eq` method
  if (a && a.objectId && typeof a.eq === 'function') { return a.eq(b); }

  atype = type(a);
  btype = type(b);

  // native objects that are not of the same type are not equal
  if (atype !== btype) { return false; }

  switch (atype) {
  case 'boolean':
  case 'string':
  case 'date':
  case 'number':
    return a.valueOf() === b.valueOf();
  case 'regexp':
    return a.source     === b.source    &&
           a.global     === b.global    &&
           a.multiline  === b.multiline &&
           a.ignoreCase === b.ignoreCase;
  case 'array':
    return arrayEq(a, b);
  case 'object':
    return objectEq(a, b);
  default:
    return false;
  }
}

// Public: Performs a a deep array equality test.
//
// a - An Array object.
// b - An Array object.
//
// Returns `true` if the objects are equal and `false` otherwise.
export function arrayEq(a, b) {
  var r;

  if (!Array.isArray(a) || !Array.isArray(b)) { return false; }

  if (a.length !== b.length) { return false; }

  r = true;

  detectRecursion(a, b, function() {
    var i, len;

    for (i = 0, len = a.length; i < len; i++) {
      if (!eq(a[i], b[i])) { r = false; break; }
    }
  });

  return r;
}

// Public: Performs a a deep object equality test.
//
// a - Any object.
// b - Any object.
//
// Returns `true` if the objects are equal and `false` otherwise.
export function objectEq(a, b) {
  var akeys = Object.keys(a), bkeys = Object.keys(b), r;

  if (akeys.length !== bkeys.length) { return false; }

  r = true;

  detectRecursion(a, b, function() {
    var i, len, key;

    for (i = 0, len = akeys.length; i < len; i++) {
      key = akeys[i];
      if (!b.hasOwnProperty(key)) { r = false; break; }
      if (!eq(a[key], b[key])) { r = false; break; }
    }
  });

  return r;
}

// Public: Converts the given string to CamelCase.
export function camelize(s) {
  return typeof s === 'string' ?
    s.replace(/(?:[-_])(\w)/g, function(_, c) { return c ? c.toUpperCase() : ''; }) : s;
}

// Public: Converts the given string to under_score_case.
export function underscore(s) {
  return typeof s === 'string' ?
    s.replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase() : s;
}

// Public: Capitalizes the first letter of the given string.
export function capitalize(s) {
  return typeof s === 'string' && s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

// Public: Resolves a path into a value. The path must be relative to the given object.
//
// If an array is encountered in the middle of a path and the next segment does not match a property
// of the array, then the property is accessed from each item within the array.
//
// o    - The object to resolve the path from.
// path - A string containing the dot separated path to resolve.
//
// Returns the resolved value or `undefined` if some segment of the path does not exist.
export function getPath(o, path) {
  return _getPath(o, path.split('.'));
}

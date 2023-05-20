// src/lib/array.js
var concat = (x) => (m) => x.concat(m);
function runTraverse(name, fn) {
  return function(acc, x) {
    const m = fn(x);
    return m.map((v) => concat([v])).ap(acc);
  };
}
function sequence(f, m) {
  return m.reduceRight(
    runTraverse("sequence", (x) => x),
    f([])
  );
}
var array = {
  sequence
};

// src/lib/async.js
var Async = (fork) => ({
  ["@@type"]: "Async",
  fork,
  toPromise: () => new Promise((resolve, reject) => fork(reject, resolve)),
  ap: (other) => Async((rej, res) => fork(rej, (f) => other.fork(rej, (x) => res(f(x))))),
  map: (fn) => Async((rej, res) => fork(rej, (x) => res(fn(x)))),
  bimap: (f, g) => Async(
    (rej, res) => fork(
      (x) => rej(f(x)),
      (x) => res(g(x))
    )
  ),
  chain: (fn) => Async((rej, res) => fork(rej, (x) => fn(x).fork(rej, res))),
  bichain: (f, g) => Async(
    (rej, res) => fork(
      (x) => f(x).fork(rej, res),
      (x) => g(x).fork(rej, res)
    )
  ),
  fold: (f, g) => Async(
    (rej, res) => fork(
      (x) => f(x).fork(rej, res),
      (x) => g(x).fork(rej, res)
    )
  )
});
var of = (x) => Async((rej, res) => res(x));
var Resolved = (x) => Async((rej, res) => res(x));
var Rejected = (x) => Async((rej, res) => rej(x));
var all = (xs) => {
  if (!(Boolean(xs.reduce) && xs.reduce((a, x) => a && x["@@type"] === "Async", true))) {
    throw new Error("Async.all: Argument must be foldable of asyncs");
  }
  if (Array.isArray(xs)) {
    return array.sequence(of, xs);
  }
};
var fromPromise = (f) => (...args) => Async(
  (rej, res) => f(...args).then(res).catch(rej)
);

// src/write/transfer.js
function transfer(state, action) {
  return of({ state, action }).chain(validate).map(({ state: state2, action: action2 }) => {
    state2.balances[action2.caller] -= action2.input.qty;
    state2.balances[action2.input.target] += action2.input.qty;
    return { state: state2 };
  });
}
function validate({ state, action }) {
  if (!action.caller || action.caller.length !== 43) {
    return Rejected("Caller is not valid");
  }
  if (!action.input.qty || typeof action.input.qty !== "number") {
    return Rejected("qty is not defined or is not a number");
  }
  if (!action.input.target || action.input.target.length !== 43) {
    return Rejected("target is not valid");
  }
  if (action.caller === action.input.target) {
    return Rejected("target cannot be caller");
  }
  if (!state.balances[action.input.target]) {
    state.balances[action.input.target] = 0;
  }
  if (!state.balances[action.caller]) {
    state.balances[action.caller] = 0;
  }
  if (state.balances[action.caller] < action.input.qty) {
    return Rejected("not enough balance to transfer");
  }
  return Resolved({ state, action });
}

// node_modules/ramda/es/internal/_isPlaceholder.js
function _isPlaceholder(a) {
  return a != null && typeof a === "object" && a["@@functional/placeholder"] === true;
}

// node_modules/ramda/es/internal/_curry1.js
function _curry1(fn) {
  return function f1(a) {
    if (arguments.length === 0 || _isPlaceholder(a)) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
}

// node_modules/ramda/es/internal/_curry2.js
function _curry2(fn) {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;
      case 1:
        return _isPlaceholder(a) ? f2 : _curry1(function(_b) {
          return fn(a, _b);
        });
      default:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function(_a) {
          return fn(_a, b);
        }) : _isPlaceholder(b) ? _curry1(function(_b) {
          return fn(a, _b);
        }) : fn(a, b);
    }
  };
}

// node_modules/ramda/es/add.js
var add = /* @__PURE__ */ _curry2(function add2(a, b) {
  return Number(a) + Number(b);
});
var add_default = add;

// node_modules/ramda/es/internal/_arity.js
function _arity(n, fn) {
  switch (n) {
    case 0:
      return function() {
        return fn.apply(this, arguments);
      };
    case 1:
      return function(a0) {
        return fn.apply(this, arguments);
      };
    case 2:
      return function(a0, a1) {
        return fn.apply(this, arguments);
      };
    case 3:
      return function(a0, a1, a2) {
        return fn.apply(this, arguments);
      };
    case 4:
      return function(a0, a1, a2, a3) {
        return fn.apply(this, arguments);
      };
    case 5:
      return function(a0, a1, a2, a3, a4) {
        return fn.apply(this, arguments);
      };
    case 6:
      return function(a0, a1, a2, a3, a4, a5) {
        return fn.apply(this, arguments);
      };
    case 7:
      return function(a0, a1, a2, a3, a4, a5, a6) {
        return fn.apply(this, arguments);
      };
    case 8:
      return function(a0, a1, a2, a3, a4, a5, a6, a7) {
        return fn.apply(this, arguments);
      };
    case 9:
      return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
        return fn.apply(this, arguments);
      };
    case 10:
      return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        return fn.apply(this, arguments);
      };
    default:
      throw new Error("First argument to _arity must be a non-negative integer no greater than ten");
  }
}

// node_modules/ramda/es/internal/_curryN.js
function _curryN(length3, received, fn) {
  return function() {
    var combined = [];
    var argsIdx = 0;
    var left = length3;
    var combinedIdx = 0;
    while (combinedIdx < received.length || argsIdx < arguments.length) {
      var result;
      if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
        result = received[combinedIdx];
      } else {
        result = arguments[argsIdx];
        argsIdx += 1;
      }
      combined[combinedIdx] = result;
      if (!_isPlaceholder(result)) {
        left -= 1;
      }
      combinedIdx += 1;
    }
    return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length3, combined, fn));
  };
}

// node_modules/ramda/es/curryN.js
var curryN = /* @__PURE__ */ _curry2(function curryN2(length3, fn) {
  if (length3 === 1) {
    return _curry1(fn);
  }
  return _arity(length3, _curryN(length3, [], fn));
});
var curryN_default = curryN;

// node_modules/ramda/es/internal/_curry3.js
function _curry3(fn) {
  return function f3(a, b, c) {
    switch (arguments.length) {
      case 0:
        return f3;
      case 1:
        return _isPlaceholder(a) ? f3 : _curry2(function(_b, _c) {
          return fn(a, _b, _c);
        });
      case 2:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function(_a, _c) {
          return fn(_a, b, _c);
        }) : _isPlaceholder(b) ? _curry2(function(_b, _c) {
          return fn(a, _b, _c);
        }) : _curry1(function(_c) {
          return fn(a, b, _c);
        });
      default:
        return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function(_a, _b) {
          return fn(_a, _b, c);
        }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function(_a, _c) {
          return fn(_a, b, _c);
        }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function(_b, _c) {
          return fn(a, _b, _c);
        }) : _isPlaceholder(a) ? _curry1(function(_a) {
          return fn(_a, b, c);
        }) : _isPlaceholder(b) ? _curry1(function(_b) {
          return fn(a, _b, c);
        }) : _isPlaceholder(c) ? _curry1(function(_c) {
          return fn(a, b, _c);
        }) : fn(a, b, c);
    }
  };
}

// node_modules/ramda/es/internal/_isArray.js
var isArray_default = Array.isArray || function _isArray(val) {
  return val != null && val.length >= 0 && Object.prototype.toString.call(val) === "[object Array]";
};

// node_modules/ramda/es/internal/_isTransformer.js
function _isTransformer(obj) {
  return obj != null && typeof obj["@@transducer/step"] === "function";
}

// node_modules/ramda/es/internal/_dispatchable.js
function _dispatchable(methodNames, transducerCreator, fn) {
  return function() {
    if (arguments.length === 0) {
      return fn();
    }
    var obj = arguments[arguments.length - 1];
    if (!isArray_default(obj)) {
      var idx = 0;
      while (idx < methodNames.length) {
        if (typeof obj[methodNames[idx]] === "function") {
          return obj[methodNames[idx]].apply(obj, Array.prototype.slice.call(arguments, 0, -1));
        }
        idx += 1;
      }
      if (_isTransformer(obj)) {
        var transducer = transducerCreator.apply(null, Array.prototype.slice.call(arguments, 0, -1));
        return transducer(obj);
      }
    }
    return fn.apply(this, arguments);
  };
}

// node_modules/ramda/es/internal/_reduced.js
function _reduced(x) {
  return x && x["@@transducer/reduced"] ? x : {
    "@@transducer/value": x,
    "@@transducer/reduced": true
  };
}

// node_modules/ramda/es/internal/_xfBase.js
var xfBase_default = {
  init: function() {
    return this.xf["@@transducer/init"]();
  },
  result: function(result) {
    return this.xf["@@transducer/result"](result);
  }
};

// node_modules/ramda/es/internal/_arrayFromIterator.js
function _arrayFromIterator(iter) {
  var list = [];
  var next;
  while (!(next = iter.next()).done) {
    list.push(next.value);
  }
  return list;
}

// node_modules/ramda/es/internal/_includesWith.js
function _includesWith(pred, x, list) {
  var idx = 0;
  var len = list.length;
  while (idx < len) {
    if (pred(x, list[idx])) {
      return true;
    }
    idx += 1;
  }
  return false;
}

// node_modules/ramda/es/internal/_functionName.js
function _functionName(f) {
  var match = String(f).match(/^function (\w*)/);
  return match == null ? "" : match[1];
}

// node_modules/ramda/es/internal/_has.js
function _has(prop3, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop3);
}

// node_modules/ramda/es/internal/_objectIs.js
function _objectIs(a, b) {
  if (a === b) {
    return a !== 0 || 1 / a === 1 / b;
  } else {
    return a !== a && b !== b;
  }
}
var objectIs_default = typeof Object.is === "function" ? Object.is : _objectIs;

// node_modules/ramda/es/internal/_isArguments.js
var toString = Object.prototype.toString;
var _isArguments = /* @__PURE__ */ function() {
  return toString.call(arguments) === "[object Arguments]" ? function _isArguments2(x) {
    return toString.call(x) === "[object Arguments]";
  } : function _isArguments2(x) {
    return _has("callee", x);
  };
}();
var isArguments_default = _isArguments;

// node_modules/ramda/es/keys.js
var hasEnumBug = !/* @__PURE__ */ {
  toString: null
}.propertyIsEnumerable("toString");
var nonEnumerableProps = ["constructor", "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
var hasArgsEnumBug = /* @__PURE__ */ function() {
  "use strict";
  return arguments.propertyIsEnumerable("length");
}();
var contains = function contains2(list, item) {
  var idx = 0;
  while (idx < list.length) {
    if (list[idx] === item) {
      return true;
    }
    idx += 1;
  }
  return false;
};
var keys = typeof Object.keys === "function" && !hasArgsEnumBug ? /* @__PURE__ */ _curry1(function keys2(obj) {
  return Object(obj) !== obj ? [] : Object.keys(obj);
}) : /* @__PURE__ */ _curry1(function keys3(obj) {
  if (Object(obj) !== obj) {
    return [];
  }
  var prop3, nIdx;
  var ks = [];
  var checkArgsLength = hasArgsEnumBug && isArguments_default(obj);
  for (prop3 in obj) {
    if (_has(prop3, obj) && (!checkArgsLength || prop3 !== "length")) {
      ks[ks.length] = prop3;
    }
  }
  if (hasEnumBug) {
    nIdx = nonEnumerableProps.length - 1;
    while (nIdx >= 0) {
      prop3 = nonEnumerableProps[nIdx];
      if (_has(prop3, obj) && !contains(ks, prop3)) {
        ks[ks.length] = prop3;
      }
      nIdx -= 1;
    }
  }
  return ks;
});
var keys_default = keys;

// node_modules/ramda/es/type.js
var type = /* @__PURE__ */ _curry1(function type2(val) {
  return val === null ? "Null" : val === void 0 ? "Undefined" : Object.prototype.toString.call(val).slice(8, -1);
});
var type_default = type;

// node_modules/ramda/es/internal/_equals.js
function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
  var a = _arrayFromIterator(aIterator);
  var b = _arrayFromIterator(bIterator);
  function eq(_a, _b) {
    return _equals(_a, _b, stackA.slice(), stackB.slice());
  }
  return !_includesWith(function(b2, aItem) {
    return !_includesWith(eq, aItem, b2);
  }, b, a);
}
function _equals(a, b, stackA, stackB) {
  if (objectIs_default(a, b)) {
    return true;
  }
  var typeA = type_default(a);
  if (typeA !== type_default(b)) {
    return false;
  }
  if (typeof a["fantasy-land/equals"] === "function" || typeof b["fantasy-land/equals"] === "function") {
    return typeof a["fantasy-land/equals"] === "function" && a["fantasy-land/equals"](b) && typeof b["fantasy-land/equals"] === "function" && b["fantasy-land/equals"](a);
  }
  if (typeof a.equals === "function" || typeof b.equals === "function") {
    return typeof a.equals === "function" && a.equals(b) && typeof b.equals === "function" && b.equals(a);
  }
  switch (typeA) {
    case "Arguments":
    case "Array":
    case "Object":
      if (typeof a.constructor === "function" && _functionName(a.constructor) === "Promise") {
        return a === b;
      }
      break;
    case "Boolean":
    case "Number":
    case "String":
      if (!(typeof a === typeof b && objectIs_default(a.valueOf(), b.valueOf()))) {
        return false;
      }
      break;
    case "Date":
      if (!objectIs_default(a.valueOf(), b.valueOf())) {
        return false;
      }
      break;
    case "Error":
      return a.name === b.name && a.message === b.message;
    case "RegExp":
      if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
        return false;
      }
      break;
  }
  var idx = stackA.length - 1;
  while (idx >= 0) {
    if (stackA[idx] === a) {
      return stackB[idx] === b;
    }
    idx -= 1;
  }
  switch (typeA) {
    case "Map":
      if (a.size !== b.size) {
        return false;
      }
      return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));
    case "Set":
      if (a.size !== b.size) {
        return false;
      }
      return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));
    case "Arguments":
    case "Array":
    case "Object":
    case "Boolean":
    case "Number":
    case "String":
    case "Date":
    case "Error":
    case "RegExp":
    case "Int8Array":
    case "Uint8Array":
    case "Uint8ClampedArray":
    case "Int16Array":
    case "Uint16Array":
    case "Int32Array":
    case "Uint32Array":
    case "Float32Array":
    case "Float64Array":
    case "ArrayBuffer":
      break;
    default:
      return false;
  }
  var keysA = keys_default(a);
  if (keysA.length !== keys_default(b).length) {
    return false;
  }
  var extendedStackA = stackA.concat([a]);
  var extendedStackB = stackB.concat([b]);
  idx = keysA.length - 1;
  while (idx >= 0) {
    var key = keysA[idx];
    if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
      return false;
    }
    idx -= 1;
  }
  return true;
}

// node_modules/ramda/es/equals.js
var equals = /* @__PURE__ */ _curry2(function equals2(a, b) {
  return _equals(a, b, [], []);
});
var equals_default = equals;

// node_modules/ramda/es/internal/_map.js
function _map(fn, functor) {
  var idx = 0;
  var len = functor.length;
  var result = Array(len);
  while (idx < len) {
    result[idx] = fn(functor[idx]);
    idx += 1;
  }
  return result;
}

// node_modules/ramda/es/internal/_toISOString.js
var pad = function pad2(n) {
  return (n < 10 ? "0" : "") + n;
};
var _toISOString = typeof Date.prototype.toISOString === "function" ? function _toISOString2(d) {
  return d.toISOString();
} : function _toISOString3(d) {
  return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds()) + "." + (d.getUTCMilliseconds() / 1e3).toFixed(3).slice(2, 5) + "Z";
};

// node_modules/ramda/es/internal/_arrayReduce.js
function _arrayReduce(reducer, acc, list) {
  var index = 0;
  var length3 = list.length;
  while (index < length3) {
    acc = reducer(acc, list[index]);
    index += 1;
  }
  return acc;
}

// node_modules/ramda/es/internal/_filter.js
function _filter(fn, list) {
  var idx = 0;
  var len = list.length;
  var result = [];
  while (idx < len) {
    if (fn(list[idx])) {
      result[result.length] = list[idx];
    }
    idx += 1;
  }
  return result;
}

// node_modules/ramda/es/internal/_isObject.js
function _isObject(x) {
  return Object.prototype.toString.call(x) === "[object Object]";
}

// node_modules/ramda/es/internal/_xfilter.js
var XFilter = /* @__PURE__ */ function() {
  function XFilter2(f, xf) {
    this.xf = xf;
    this.f = f;
  }
  XFilter2.prototype["@@transducer/init"] = xfBase_default.init;
  XFilter2.prototype["@@transducer/result"] = xfBase_default.result;
  XFilter2.prototype["@@transducer/step"] = function(result, input) {
    return this.f(input) ? this.xf["@@transducer/step"](result, input) : result;
  };
  return XFilter2;
}();
function _xfilter(f) {
  return function(xf) {
    return new XFilter(f, xf);
  };
}

// node_modules/ramda/es/filter.js
var filter = /* @__PURE__ */ _curry2(
  /* @__PURE__ */ _dispatchable(["fantasy-land/filter", "filter"], _xfilter, function(pred, filterable) {
    return _isObject(filterable) ? _arrayReduce(function(acc, key) {
      if (pred(filterable[key])) {
        acc[key] = filterable[key];
      }
      return acc;
    }, {}, keys_default(filterable)) : (
      // else
      _filter(pred, filterable)
    );
  })
);
var filter_default = filter;

// node_modules/ramda/es/internal/_xmap.js
var XMap = /* @__PURE__ */ function() {
  function XMap2(f, xf) {
    this.xf = xf;
    this.f = f;
  }
  XMap2.prototype["@@transducer/init"] = xfBase_default.init;
  XMap2.prototype["@@transducer/result"] = xfBase_default.result;
  XMap2.prototype["@@transducer/step"] = function(result, input) {
    return this.xf["@@transducer/step"](result, this.f(input));
  };
  return XMap2;
}();
var _xmap = function _xmap2(f) {
  return function(xf) {
    return new XMap(f, xf);
  };
};
var xmap_default = _xmap;

// node_modules/ramda/es/map.js
var map = /* @__PURE__ */ _curry2(
  /* @__PURE__ */ _dispatchable(["fantasy-land/map", "map"], xmap_default, function map2(fn, functor) {
    switch (Object.prototype.toString.call(functor)) {
      case "[object Function]":
        return curryN_default(functor.length, function() {
          return fn.call(this, functor.apply(this, arguments));
        });
      case "[object Object]":
        return _arrayReduce(function(acc, key) {
          acc[key] = fn(functor[key]);
          return acc;
        }, {}, keys_default(functor));
      default:
        return _map(fn, functor);
    }
  })
);
var map_default = map;

// node_modules/ramda/es/internal/_isInteger.js
var isInteger_default = Number.isInteger || function _isInteger(n) {
  return n << 0 === n;
};

// node_modules/ramda/es/internal/_isString.js
function _isString(x) {
  return Object.prototype.toString.call(x) === "[object String]";
}

// node_modules/ramda/es/nth.js
var nth = /* @__PURE__ */ _curry2(function nth2(offset, list) {
  var idx = offset < 0 ? list.length + offset : offset;
  return _isString(list) ? list.charAt(idx) : list[idx];
});
var nth_default = nth;

// node_modules/ramda/es/prop.js
var prop = /* @__PURE__ */ _curry2(function prop2(p, obj) {
  if (obj == null) {
    return;
  }
  return isInteger_default(p) ? nth_default(p, obj) : obj[p];
});
var prop_default = prop;

// node_modules/ramda/es/pluck.js
var pluck = /* @__PURE__ */ _curry2(function pluck2(p, list) {
  return map_default(prop_default(p), list);
});
var pluck_default = pluck;

// node_modules/ramda/es/internal/_isArrayLike.js
var _isArrayLike = /* @__PURE__ */ _curry1(function isArrayLike(x) {
  if (isArray_default(x)) {
    return true;
  }
  if (!x) {
    return false;
  }
  if (typeof x !== "object") {
    return false;
  }
  if (_isString(x)) {
    return false;
  }
  if (x.length === 0) {
    return true;
  }
  if (x.length > 0) {
    return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
  }
  return false;
});
var isArrayLike_default = _isArrayLike;

// node_modules/ramda/es/internal/_createReduce.js
var symIterator = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
function _createReduce(arrayReduce, methodReduce, iterableReduce) {
  return function _reduce(xf, acc, list) {
    if (isArrayLike_default(list)) {
      return arrayReduce(xf, acc, list);
    }
    if (list == null) {
      return acc;
    }
    if (typeof list["fantasy-land/reduce"] === "function") {
      return methodReduce(xf, acc, list, "fantasy-land/reduce");
    }
    if (list[symIterator] != null) {
      return iterableReduce(xf, acc, list[symIterator]());
    }
    if (typeof list.next === "function") {
      return iterableReduce(xf, acc, list);
    }
    if (typeof list.reduce === "function") {
      return methodReduce(xf, acc, list, "reduce");
    }
    throw new TypeError("reduce: list must be array or iterable");
  };
}

// node_modules/ramda/es/internal/_xArrayReduce.js
function _xArrayReduce(xf, acc, list) {
  var idx = 0;
  var len = list.length;
  while (idx < len) {
    acc = xf["@@transducer/step"](acc, list[idx]);
    if (acc && acc["@@transducer/reduced"]) {
      acc = acc["@@transducer/value"];
      break;
    }
    idx += 1;
  }
  return xf["@@transducer/result"](acc);
}

// node_modules/ramda/es/bind.js
var bind = /* @__PURE__ */ _curry2(function bind2(fn, thisObj) {
  return _arity(fn.length, function() {
    return fn.apply(thisObj, arguments);
  });
});
var bind_default = bind;

// node_modules/ramda/es/internal/_xReduce.js
function _xIterableReduce(xf, acc, iter) {
  var step = iter.next();
  while (!step.done) {
    acc = xf["@@transducer/step"](acc, step.value);
    if (acc && acc["@@transducer/reduced"]) {
      acc = acc["@@transducer/value"];
      break;
    }
    step = iter.next();
  }
  return xf["@@transducer/result"](acc);
}
function _xMethodReduce(xf, acc, obj, methodName) {
  return xf["@@transducer/result"](obj[methodName](bind_default(xf["@@transducer/step"], xf), acc));
}
var _xReduce = /* @__PURE__ */ _createReduce(_xArrayReduce, _xMethodReduce, _xIterableReduce);
var xReduce_default = _xReduce;

// node_modules/ramda/es/internal/_xwrap.js
var XWrap = /* @__PURE__ */ function() {
  function XWrap2(fn) {
    this.f = fn;
  }
  XWrap2.prototype["@@transducer/init"] = function() {
    throw new Error("init not implemented on XWrap");
  };
  XWrap2.prototype["@@transducer/result"] = function(acc) {
    return acc;
  };
  XWrap2.prototype["@@transducer/step"] = function(acc, x) {
    return this.f(acc, x);
  };
  return XWrap2;
}();
function _xwrap(fn) {
  return new XWrap(fn);
}

// node_modules/ramda/es/reduce.js
var reduce = /* @__PURE__ */ _curry3(function(xf, acc, list) {
  return xReduce_default(typeof xf === "function" ? _xwrap(xf) : xf, acc, list);
});
var reduce_default = reduce;

// node_modules/ramda/es/always.js
var always = /* @__PURE__ */ _curry1(function always2(val) {
  return function() {
    return val;
  };
});
var always_default = always;

// node_modules/ramda/es/values.js
var values = /* @__PURE__ */ _curry1(function values2(obj) {
  var props = keys_default(obj);
  var len = props.length;
  var vals = [];
  var idx = 0;
  while (idx < len) {
    vals[idx] = obj[props[idx]];
    idx += 1;
  }
  return vals;
});
var values_default = values;

// node_modules/ramda/es/internal/_assoc.js
function _assoc(prop3, val, obj) {
  if (isInteger_default(prop3) && isArray_default(obj)) {
    var arr = [].concat(obj);
    arr[prop3] = val;
    return arr;
  }
  var result = {};
  for (var p in obj) {
    result[p] = obj[p];
  }
  result[prop3] = val;
  return result;
}

// node_modules/ramda/es/isNil.js
var isNil = /* @__PURE__ */ _curry1(function isNil2(x) {
  return x == null;
});
var isNil_default = isNil;

// node_modules/ramda/es/assocPath.js
var assocPath = /* @__PURE__ */ _curry3(function assocPath2(path3, val, obj) {
  if (path3.length === 0) {
    return val;
  }
  var idx = path3[0];
  if (path3.length > 1) {
    var nextObj = !isNil_default(obj) && _has(idx, obj) && typeof obj[idx] === "object" ? obj[idx] : isInteger_default(path3[1]) ? [] : {};
    val = assocPath2(Array.prototype.slice.call(path3, 1), val, nextObj);
  }
  return _assoc(idx, val, obj);
});
var assocPath_default = assocPath;

// node_modules/ramda/es/assoc.js
var assoc = /* @__PURE__ */ _curry3(function assoc2(prop3, val, obj) {
  return assocPath_default([prop3], val, obj);
});
var assoc_default = assoc;

// node_modules/ramda/es/internal/_makeFlat.js
function _makeFlat(recursive) {
  return function flatt(list) {
    var value, jlen, j;
    var result = [];
    var idx = 0;
    var ilen = list.length;
    while (idx < ilen) {
      if (isArrayLike_default(list[idx])) {
        value = recursive ? flatt(list[idx]) : list[idx];
        j = 0;
        jlen = value.length;
        while (j < jlen) {
          result[result.length] = value[j];
          j += 1;
        }
      } else {
        result[result.length] = list[idx];
      }
      idx += 1;
    }
    return result;
  };
}

// node_modules/ramda/es/internal/_cloneRegExp.js
function _cloneRegExp(pattern) {
  return new RegExp(pattern.source, pattern.flags ? pattern.flags : (pattern.global ? "g" : "") + (pattern.ignoreCase ? "i" : "") + (pattern.multiline ? "m" : "") + (pattern.sticky ? "y" : "") + (pattern.unicode ? "u" : "") + (pattern.dotAll ? "s" : ""));
}

// node_modules/ramda/es/internal/_clone.js
function _clone(value, deep, map3) {
  map3 || (map3 = new _ObjectMap());
  if (_isPrimitive(value)) {
    return value;
  }
  var copy = function copy2(copiedValue) {
    var cachedCopy = map3.get(value);
    if (cachedCopy) {
      return cachedCopy;
    }
    map3.set(value, copiedValue);
    for (var key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        copiedValue[key] = deep ? _clone(value[key], true, map3) : value[key];
      }
    }
    return copiedValue;
  };
  switch (type_default(value)) {
    case "Object":
      return copy(Object.create(Object.getPrototypeOf(value)));
    case "Array":
      return copy([]);
    case "Date":
      return new Date(value.valueOf());
    case "RegExp":
      return _cloneRegExp(value);
    case "Int8Array":
    case "Uint8Array":
    case "Uint8ClampedArray":
    case "Int16Array":
    case "Uint16Array":
    case "Int32Array":
    case "Uint32Array":
    case "Float32Array":
    case "Float64Array":
    case "BigInt64Array":
    case "BigUint64Array":
      return value.slice();
    default:
      return value;
  }
}
function _isPrimitive(param) {
  var type3 = typeof param;
  return param == null || type3 != "object" && type3 != "function";
}
var _ObjectMap = /* @__PURE__ */ function() {
  function _ObjectMap2() {
    this.map = {};
    this.length = 0;
  }
  _ObjectMap2.prototype.set = function(key, value) {
    const hashedKey = this.hash(key);
    let bucket = this.map[hashedKey];
    if (!bucket) {
      this.map[hashedKey] = bucket = [];
    }
    bucket.push([key, value]);
    this.length += 1;
  };
  _ObjectMap2.prototype.hash = function(key) {
    let hashedKey = [];
    for (var value in key) {
      hashedKey.push(Object.prototype.toString.call(key[value]));
    }
    return hashedKey.join();
  };
  _ObjectMap2.prototype.get = function(key) {
    if (this.length <= 180) {
      for (const p in this.map) {
        const bucket2 = this.map[p];
        for (let i = 0; i < bucket2.length; i += 1) {
          const element = bucket2[i];
          if (element[0] === key) {
            return element[1];
          }
        }
      }
      return;
    }
    const hashedKey = this.hash(key);
    const bucket = this.map[hashedKey];
    if (!bucket) {
      return;
    }
    for (let i = 0; i < bucket.length; i += 1) {
      const element = bucket[i];
      if (element[0] === key) {
        return element[1];
      }
    }
  };
  return _ObjectMap2;
}();

// node_modules/ramda/es/internal/_pipe.js
function _pipe(f, g) {
  return function() {
    return g.call(this, f.apply(this, arguments));
  };
}

// node_modules/ramda/es/internal/_checkForMethod.js
function _checkForMethod(methodname, fn) {
  return function() {
    var length3 = arguments.length;
    if (length3 === 0) {
      return fn();
    }
    var obj = arguments[length3 - 1];
    return isArray_default(obj) || typeof obj[methodname] !== "function" ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length3 - 1));
  };
}

// node_modules/ramda/es/slice.js
var slice = /* @__PURE__ */ _curry3(
  /* @__PURE__ */ _checkForMethod("slice", function slice2(fromIndex, toIndex, list) {
    return Array.prototype.slice.call(list, fromIndex, toIndex);
  })
);
var slice_default = slice;

// node_modules/ramda/es/tail.js
var tail = /* @__PURE__ */ _curry1(
  /* @__PURE__ */ _checkForMethod(
    "tail",
    /* @__PURE__ */ slice_default(1, Infinity)
  )
);
var tail_default = tail;

// node_modules/ramda/es/pipe.js
function pipe() {
  if (arguments.length === 0) {
    throw new Error("pipe requires at least one argument");
  }
  return _arity(arguments[0].length, reduce_default(_pipe, arguments[0], tail_default(arguments)));
}

// node_modules/ramda/es/reverse.js
var reverse = /* @__PURE__ */ _curry1(function reverse2(list) {
  return _isString(list) ? list.split("").reverse().join("") : Array.prototype.slice.call(list, 0).reverse();
});
var reverse_default = reverse;

// node_modules/ramda/es/compose.js
function compose() {
  if (arguments.length === 0) {
    throw new Error("compose requires at least one argument");
  }
  return pipe.apply(this, reverse_default(arguments));
}

// node_modules/ramda/es/internal/_xreduceBy.js
var XReduceBy = /* @__PURE__ */ function() {
  function XReduceBy2(valueFn, valueAcc, keyFn, xf) {
    this.valueFn = valueFn;
    this.valueAcc = valueAcc;
    this.keyFn = keyFn;
    this.xf = xf;
    this.inputs = {};
  }
  XReduceBy2.prototype["@@transducer/init"] = xfBase_default.init;
  XReduceBy2.prototype["@@transducer/result"] = function(result) {
    var key;
    for (key in this.inputs) {
      if (_has(key, this.inputs)) {
        result = this.xf["@@transducer/step"](result, this.inputs[key]);
        if (result["@@transducer/reduced"]) {
          result = result["@@transducer/value"];
          break;
        }
      }
    }
    this.inputs = null;
    return this.xf["@@transducer/result"](result);
  };
  XReduceBy2.prototype["@@transducer/step"] = function(result, input) {
    var key = this.keyFn(input);
    this.inputs[key] = this.inputs[key] || [key, _clone(this.valueAcc, false)];
    this.inputs[key][1] = this.valueFn(this.inputs[key][1], input);
    return result;
  };
  return XReduceBy2;
}();
function _xreduceBy(valueFn, valueAcc, keyFn) {
  return function(xf) {
    return new XReduceBy(valueFn, valueAcc, keyFn, xf);
  };
}

// node_modules/ramda/es/reduceBy.js
var reduceBy = /* @__PURE__ */ _curryN(
  4,
  [],
  /* @__PURE__ */ _dispatchable([], _xreduceBy, function reduceBy2(valueFn, valueAcc, keyFn, list) {
    var xf = _xwrap(function(acc, elt) {
      var key = keyFn(elt);
      var value = valueFn(_has(key, acc) ? acc[key] : _clone(valueAcc, false), elt);
      if (value && value["@@transducer/reduced"]) {
        return _reduced(acc);
      }
      acc[key] = value;
      return acc;
    });
    return xReduce_default(xf, {}, list);
  })
);
var reduceBy_default = reduceBy;

// node_modules/ramda/es/internal/_xfind.js
var XFind = /* @__PURE__ */ function() {
  function XFind2(f, xf) {
    this.xf = xf;
    this.f = f;
    this.found = false;
  }
  XFind2.prototype["@@transducer/init"] = xfBase_default.init;
  XFind2.prototype["@@transducer/result"] = function(result) {
    if (!this.found) {
      result = this.xf["@@transducer/step"](result, void 0);
    }
    return this.xf["@@transducer/result"](result);
  };
  XFind2.prototype["@@transducer/step"] = function(result, input) {
    if (this.f(input)) {
      this.found = true;
      result = _reduced(this.xf["@@transducer/step"](result, input));
    }
    return result;
  };
  return XFind2;
}();
function _xfind(f) {
  return function(xf) {
    return new XFind(f, xf);
  };
}

// node_modules/ramda/es/find.js
var find = /* @__PURE__ */ _curry2(
  /* @__PURE__ */ _dispatchable(["find"], _xfind, function find2(fn, list) {
    var idx = 0;
    var len = list.length;
    while (idx < len) {
      if (fn(list[idx])) {
        return list[idx];
      }
      idx += 1;
    }
  })
);
var find_default = find;

// node_modules/ramda/es/internal/_xfindIndex.js
var XFindIndex = /* @__PURE__ */ function() {
  function XFindIndex2(f, xf) {
    this.xf = xf;
    this.f = f;
    this.idx = -1;
    this.found = false;
  }
  XFindIndex2.prototype["@@transducer/init"] = xfBase_default.init;
  XFindIndex2.prototype["@@transducer/result"] = function(result) {
    if (!this.found) {
      result = this.xf["@@transducer/step"](result, -1);
    }
    return this.xf["@@transducer/result"](result);
  };
  XFindIndex2.prototype["@@transducer/step"] = function(result, input) {
    this.idx += 1;
    if (this.f(input)) {
      this.found = true;
      result = _reduced(this.xf["@@transducer/step"](result, this.idx));
    }
    return result;
  };
  return XFindIndex2;
}();
function _xfindIndex(f) {
  return function(xf) {
    return new XFindIndex(f, xf);
  };
}

// node_modules/ramda/es/findIndex.js
var findIndex = /* @__PURE__ */ _curry2(
  /* @__PURE__ */ _dispatchable([], _xfindIndex, function findIndex2(fn, list) {
    var idx = 0;
    var len = list.length;
    while (idx < len) {
      if (fn(list[idx])) {
        return idx;
      }
      idx += 1;
    }
    return -1;
  })
);
var findIndex_default = findIndex;

// node_modules/ramda/es/flatten.js
var flatten = /* @__PURE__ */ _curry1(
  /* @__PURE__ */ _makeFlat(true)
);
var flatten_default = flatten;

// node_modules/ramda/es/fromPairs.js
var fromPairs = /* @__PURE__ */ _curry1(function fromPairs2(pairs) {
  var result = {};
  var idx = 0;
  while (idx < pairs.length) {
    result[pairs[idx][0]] = pairs[idx][1];
    idx += 1;
  }
  return result;
});
var fromPairs_default = fromPairs;

// node_modules/ramda/es/groupBy.js
var groupBy = /* @__PURE__ */ _curry2(
  /* @__PURE__ */ _checkForMethod(
    "groupBy",
    /* @__PURE__ */ reduceBy_default(function(acc, item) {
      acc.push(item);
      return acc;
    }, [])
  )
);
var groupBy_default = groupBy;

// node_modules/ramda/es/internal/_objectAssign.js
function _objectAssign(target) {
  if (target == null) {
    throw new TypeError("Cannot convert undefined or null to object");
  }
  var output = Object(target);
  var idx = 1;
  var length3 = arguments.length;
  while (idx < length3) {
    var source = arguments[idx];
    if (source != null) {
      for (var nextKey in source) {
        if (_has(nextKey, source)) {
          output[nextKey] = source[nextKey];
        }
      }
    }
    idx += 1;
  }
  return output;
}
var objectAssign_default = typeof Object.assign === "function" ? Object.assign : _objectAssign;

// node_modules/ramda/es/is.js
var is = /* @__PURE__ */ _curry2(function is2(Ctor, val) {
  return val instanceof Ctor || val != null && (val.constructor === Ctor || Ctor.name === "Object" && typeof val === "object");
});
var is_default = is;

// node_modules/ramda/es/internal/_isNumber.js
function _isNumber(x) {
  return Object.prototype.toString.call(x) === "[object Number]";
}

// node_modules/ramda/es/length.js
var length = /* @__PURE__ */ _curry1(function length2(list) {
  return list != null && _isNumber(list.length) ? list.length : NaN;
});
var length_default = length;

// node_modules/ramda/es/lens.js
var lens = /* @__PURE__ */ _curry2(function lens2(getter, setter) {
  return function(toFunctorFn) {
    return function(target) {
      return map_default(function(focus) {
        return setter(focus, target);
      }, toFunctorFn(getter(target)));
    };
  };
});
var lens_default = lens;

// node_modules/ramda/es/paths.js
var paths = /* @__PURE__ */ _curry2(function paths2(pathsArray, obj) {
  return pathsArray.map(function(paths3) {
    var val = obj;
    var idx = 0;
    var p;
    while (idx < paths3.length) {
      if (val == null) {
        return;
      }
      p = paths3[idx];
      val = isInteger_default(p) ? nth_default(p, val) : val[p];
      idx += 1;
    }
    return val;
  });
});
var paths_default = paths;

// node_modules/ramda/es/path.js
var path = /* @__PURE__ */ _curry2(function path2(pathAr, obj) {
  return paths_default([pathAr], obj)[0];
});
var path_default = path;

// node_modules/ramda/es/lensPath.js
var lensPath = /* @__PURE__ */ _curry1(function lensPath2(p) {
  return lens_default(path_default(p), assocPath_default(p));
});
var lensPath_default = lensPath;

// node_modules/ramda/es/lensProp.js
var lensProp = /* @__PURE__ */ _curry1(function lensProp2(k) {
  return lens_default(prop_default(k), assoc_default(k));
});
var lensProp_default = lensProp;

// node_modules/ramda/es/lte.js
var lte = /* @__PURE__ */ _curry2(function lte2(a, b) {
  return a <= b;
});
var lte_default = lte;

// node_modules/ramda/es/sum.js
var sum = /* @__PURE__ */ reduce_default(add_default, 0);
var sum_default = sum;

// node_modules/ramda/es/mergeAll.js
var mergeAll = /* @__PURE__ */ _curry1(function mergeAll2(list) {
  return objectAssign_default.apply(null, [{}].concat(list));
});
var mergeAll_default = mergeAll;

// node_modules/ramda/es/over.js
var Identity = function(x) {
  return {
    value: x,
    map: function(f) {
      return Identity(f(x));
    }
  };
};
var over = /* @__PURE__ */ _curry3(function over2(lens3, f, x) {
  return lens3(function(y) {
    return Identity(f(y));
  })(x).value;
});
var over_default = over;

// node_modules/ramda/es/propEq.js
var propEq = /* @__PURE__ */ _curry3(function propEq2(val, name, obj) {
  return equals_default(val, prop_default(name, obj));
});
var propEq_default = propEq;

// node_modules/ramda/es/set.js
var set = /* @__PURE__ */ _curry3(function set2(lens3, v, x) {
  return over_default(lens3, always_default(v), x);
});
var set_default = set;

// node_modules/ramda/es/toPairs.js
var toPairs = /* @__PURE__ */ _curry1(function toPairs2(obj) {
  var pairs = [];
  for (var prop3 in obj) {
    if (_has(prop3, obj)) {
      pairs[pairs.length] = [prop3, obj[prop3]];
    }
  }
  return pairs;
});
var toPairs_default = toPairs;

// node_modules/ramda/es/trim.js
var hasProtoTrim = typeof String.prototype.trim === "function";

// src/read/balance.js
function balance(env) {
  return (state, action) => {
    return of({ state, action }).chain(validate2).map(({ state: state2, action: action2 }) => ({
      result: {
        target: action2.input.target,
        balance: state2.balances[action2.input.target] || 0
      }
    }));
  };
}
function validate2({ state, action }) {
  if (!action.caller || action.caller.length !== 43) {
    return Rejected("Caller is not valid");
  }
  if (!action.input.target) {
    return Resolved({
      state,
      action: set_default(lensPath_default(["input", "target"]), action.caller, action)
    });
  }
  return Resolved({ state, action });
}

// src/write/stamp.js
function stamp({ readState, tags }) {
  const tx = compose(prop_default("value"), find_default(propEq_default("Data-Source", "name")))(tags);
  const addDataSource = set_default(lensPath_default(["action", "input", "tx"]), tx);
  const read = fromPromise(readState);
  return (state, action) => of({ state, action }).map(addDataSource).chain(validate3).chain(isVouched(read)).chain(update);
}
function validate3({ state, action }) {
  if (action.caller.length !== 43) {
    return Rejected("Caller is not found");
  }
  if (!action.input.tx || action.input.tx.length !== 43) {
    return Rejected("Data-Source Tag must be set to a transaction");
  }
  if (!state.stampHistory) {
    state.stampHistory = {};
  }
  if (state.stampHistory && state.stampHistory[`${action.input.tx}:${action.caller}`]) {
    return Rejected("Caller has already stamped!");
  }
  return Resolved({ state, action });
}
function isVouched(read) {
  return ({ state, action }) => read(state.vouchDAO).map(prop_default("vouched")).map(prop_default(action.caller)).chain(
    (res) => res ? Resolved({ state, action }) : Rejected("Caller is not vouched!")
  );
}
function update({ state, action }) {
  return Resolved({
    state: set_default(
      lensPath_default(["stamps", `${action.input.tx}:${action.caller}`]),
      { asset: action.input.tx, address: action.caller },
      state
    ),
    action
  });
}

// src/lib/mint.js
function mint(stamps, reward2) {
  const stampers = groupBy_default(prop_default("address"), stamps);
  const totalUniqueStampers = length_default(keys_default(stampers));
  var mintRemainder = reward2 % totalUniqueStampers;
  const allocation = parseInt(reward2 / totalUniqueStampers);
  return flatten_default(
    map_default(([_, value]) => {
      var rewardsFromStamper = allocation;
      if (mintRemainder > 0) {
        rewardsFromStamper++;
        mintRemainder--;
      }
      var stamperRemainder = rewardsFromStamper % value.length;
      const stamperAllocation = parseInt(rewardsFromStamper / value.length);
      return map_default((asset) => {
        var rewardsForAsset = stamperAllocation;
        if (stamperRemainder > 0) {
          rewardsForAsset++;
          stamperRemainder--;
        }
        return { asset, rewardsForAsset };
      }, pluck_default("asset", value));
    }, toPairs_default(stampers))
  ).reduce(
    (a, { asset, rewardsForAsset }) => a[asset] ? assoc_default(asset, a[asset] + rewardsForAsset, a) : assoc_default(asset, rewardsForAsset, a),
    {}
  );
}

// src/lib/allocate.js
function allocate(balances, reward2) {
  var total = reduce_default(
    add_default,
    0,
    values_default(balances).filter((v) => v > 0)
  );
  const allocation = mergeAll_default(
    reduce_default(
      (a, s) => {
        const asset = s[0];
        const balance2 = s[1];
        if (balance2 < 1) {
          return a;
        }
        var pct = balance2 / total * 100;
        const coins = Math.round(reward2 * (pct / 100));
        return [...a, { [asset]: Number(coins) }];
      },
      [],
      Object.entries(balances)
    )
  );
  var remainder = reward2 - sum_default(values_default(allocation));
  var iterator = keys_default(allocation).entries();
  while (remainder > 0) {
    allocation[iterator.next().value[1]]++;
    remainder--;
  }
  return allocation;
}

// src/cron/reward.js
var TOTAL_SUPPLY = 435e3 * 1e12;
var HALVING_SUPPLY = 315328 * 1e12;
var ORIGIN_HEIGHT = 1178473;
var CYCLE_INTERVAL = 1051200;
function reward(env) {
  const readState = fromPromise(env.readState);
  return (state, action) => of({ state, action }).chain(setReward(env.height)).chain(
    ({ state: state2, action: action2, reward: reward2 }) => state2.lastReward + 720 < env.height ? Resolved({ state: state2, action: action2, reward: reward2 }) : Rejected(state2)
  ).map(mintRewardsForStamps).map(allocateRegisteredAssets).chain(allocateAtomicAssets(readState, env.contractId)).map(updateBalances).map(({ state: state2, action: action2 }) => {
    if (!state2.stampHistory) {
      state2.stampHistory = {};
    }
    Object.keys(state2.stamps).forEach((k) => {
      state2.stampHistory[k] = 1;
    });
    state2.stamps = {};
    return { state: state2, action: action2 };
  }).map(({ state: state2, action: action2 }) => {
    state2.lastReward = env.height;
    return { state: state2, action: action2 };
  }).bichain(
    (_) => {
      return Resolved(state);
    },
    ({ state: state2, action: action2 }) => Resolved(state2)
  );
}
function setReward(height) {
  return ({ state, action }) => {
    const S100 = 1 * 1e12;
    const current = sum_default(values_default(state.balances)) || 0;
    if (current >= HALVING_SUPPLY) {
      if (!state.balances[contractId]) {
        state.balances[contractId] = 0;
      }
      if (state.balances[contractId] > S100) {
        state.balances[contractId] -= S100;
        return Resolved({ state, action, reward: S100 });
      }
      return Rejected(state);
    }
    const reward2 = getReward(
      HALVING_SUPPLY,
      CYCLE_INTERVAL,
      height,
      ORIGIN_HEIGHT
    );
    return Resolved({ state, action, reward: reward2 });
  };
}
function updateBalances(context) {
  const rewardList = compose(
    reduce_default((a, v) => [...a, ...toPairs_default(v)], []),
    values_default
  )(context.rewards);
  rewardList.forEach(([address, reward2]) => {
    if (!context.state.balances[address]) {
      context.state.balances[address] = 0;
    }
    context.state.balances[address] += reward2;
  });
  return context;
}
function mintRewardsForStamps({ state, action, reward: reward2 }) {
  return compose(
    (rewards) => ({ state, action, rewards }),
    (s) => mint(s, reward2),
    values_default,
    prop_default("stamps")
  )(state);
}
function allocateRegisteredAssets(context) {
  if (!context.state.assets) {
    context.state.assets = {};
  }
  return over_default(
    lensProp_default("rewards"),
    compose(
      fromPairs_default,
      map_default(
        ([asset, reward2]) => context.state.assets[asset] ? [asset, allocate(context.state.assets[asset].balances, reward2)] : [asset, reward2]
      ),
      toPairs_default
    ),
    context
  );
}
function allocateAtomicAssets(readState, contractId2) {
  return ({ state, action, rewards }) => all(
    compose(
      map_default(
        ([asset, reward2]) => is_default(Number, reward2) ? of(asset).chain(readState).map((assetState) => {
          return assetState.balances ? allocate(assetState.balances, reward2) : allocate({ [assetState.owner || contractId2]: 1 }, reward2);
        }).map((r) => [asset, r]).bichain((e) => {
          return Resolved([
            asset,
            {
              [contractId2]: reward2
            }
          ]);
        }, Resolved) : Resolved([asset, reward2])
      ),
      toPairs_default
    )(rewards)
  ).map((pairs) => ({ state, action, rewards: fromPairs_default(pairs) }));
}
function getReward(supply, interval, currentHeight, originHeight) {
  const blockHeight = currentHeight - originHeight;
  const currentCycle = Math.floor(blockHeight / interval) + 1;
  const divisor = Math.pow(2, currentCycle);
  const reward2 = Math.floor(Math.floor(supply / divisor) / 1.73 / 365);
  return reward2;
}

// src/cron/credit.js
function credit({ height }) {
  return (state, action) => {
    if (!state.credits) {
      state.credits = {};
      return state;
    }
    Object.keys(state.credits).filter((k) => k < height).forEach((k) => {
      state.credits[k].forEach((c) => {
        if (!state.balances[c.holder]) {
          state.balances[c.holder] = 0;
        }
        state.balances[c.holder] += c.qty;
      });
    });
    state.credits = compose(
      reduce_default((a, v) => assoc_default(v, state.credits[v], a), {}),
      filter_default(lte_default(height)),
      keys_default
    )(state.credits);
    return state;
  };
}

// src/lib/either.js
var Right = (x) => ({
  isLeft: false,
  chain: (f) => f(x),
  ap: (other) => other.map(x),
  alt: (other) => Right(x),
  extend: (f) => f(Right(x)),
  concat: (other) => other.fold(
    (x2) => other,
    (y) => Right(x.concat(y))
  ),
  traverse: (of3, f) => f(x).map(Right),
  map: (f) => Right(f(x)),
  fold: (_, g) => g(x),
  toString: () => `Right(${x})`,
  extract: () => x
});
var of2 = Right;

// src/write/register.js
function register(env) {
  const setTx = set_default(lensPath_default(["action", "input", "tx"]), env.id);
  return (state, action) => of2({ state, action }).map(setTx).map(add3);
}
function add3({ state, action }) {
  return {
    state: set_default(
      lensPath_default(["assets", action.input.tx, "balances", action.caller]),
      1,
      state
    )
  };
}

// src/write/super-stamps.js
var ANNUAL_BLOCKS = 720 * 365;
function superStamps(env) {
  return ({ state, action }) => {
    return of({ state, action }).chain(isSuperStamp).chain(getBalances(env.readState)).map(calculateRewards).map(({ state: state2, action: action2, balances, rewards, credits, fee }) => {
      const results = allocate(balances, rewards);
      Object.keys(results).forEach((k) => {
        if (!state2.balances[k]) {
          state2.balances[k] = 0;
        }
        state2.balances[k] += results[k];
      });
      if (!state2.balances[env.contractId]) {
        state2.balances[env.contractId] = 0;
      }
      state2.balances[env.contractId] += fee;
      return { state: state2, action: action2, balances, credits };
    }).map(updateCredits(env.height)).bichain(noSuperRejection(state), Resolved);
  };
}
function updateCredits(height) {
  return ({ state, action, balances, credits }) => {
    const fbh = height + ANNUAL_BLOCKS;
    if (!state.credits) {
      state.credits = {};
    }
    if (credits > 0) {
      const results = allocate(balances, credits);
      Object.keys(results).forEach((holder) => {
        if (!state.credits[fbh]) {
          state.credits[fbh] = [];
        }
        state.credits[fbh] = state.credits[fbh].concat([
          {
            holder,
            qty: results[holder],
            asset: action.input.tx
          }
        ]);
      });
    }
    return { state, action };
  };
}
function calculateRewards({ state, action, balances }) {
  const [rewards, credits, fee] = divideQty(action.input.qty);
  return { state, action, balances, rewards, credits, fee };
}
function getBalances(readState) {
  return ({ state, action }) => {
    if (action?.input?.tx && state.assets[action.input.tx]) {
      return Resolved({
        state,
        action,
        balances: state.assets[action.input.tx].balances
      });
    } else if (action?.input?.tx) {
      return fromPromise(readState)(action?.input?.tx).map((s) => ({
        state,
        action,
        balances: s.balances
      }));
    }
    return Rejected("NOT_SUPER_STAMP");
  };
}
function isSuperStamp({ state, action }) {
  if (!action.input.qty) {
    return Rejected("NOT_SUPER_STAMP");
  }
  if (!state.balances[action.caller]) {
    state.balances[action.caller] = 0;
  }
  if (state.balances[action.caller] < action.input.qty) {
    return Rejected("NOT_SUPER_STAMP");
  }
  return Resolved({ state, action });
}
function noSuperRejection(state) {
  return (msg) => {
    if (typeof msg === "string" && msg === "NOT_SUPER_STAMP") {
      return Resolved({ state });
    }
    return Rejected(msg);
  };
}
function divideQty(n) {
  if (n < 1) {
    return [0, 0, 0];
  }
  return [Math.floor(n * 0.8), Math.floor(n * 0.18), Math.floor(n * 0.02)];
}

// src/write/evolve.js
function evolve(state, action) {
  if (state.canEvolve) {
    if (state.creator === action.caller) {
      state.evolve = action.input.value;
    }
  }
  return { state };
}

// src/write/allow.js
function allow(env) {
  const id = env.id;
  const contractId2 = env.contractId;
  return (state, action) => {
    return of({ state, action }).chain(validate4(contractId2)).map(({ state: state2, action: action2 }) => {
      state2.balances[action2.caller] -= action2.input.qty;
      if (!state2.claimable) {
        state2.claimable = [];
      }
      state2.claimable.push({
        from: action2.caller,
        to: action2.input.target,
        qty: action2.input.qty,
        txID: id
      });
      return { state: state2 };
    });
  };
}
function validate4(contractId2) {
  return ({ state, action }) => {
    if (!Number.isInteger(action.input.qty) || action.input.qty === void 0) {
      return Rejected("Invalid value for quantity. Must be an integer.");
    }
    if (!action?.input?.target) {
      return Rejected("No target specified.");
    }
    if (action.input.target.length !== 43) {
      return Rejected("Target is not valid!");
    }
    if (action.input.target === contractId2) {
      return Rejected("Cant setup claim to transfer a balance to itself");
    }
    if (action.caller === action.input.target) {
      return Rejected("Invalid balance transfer");
    }
    if (!state.balances[action.caller]) {
      return Rejected("Caller does not have a balance");
    }
    if (state.balances[action.caller] < action.input.qty) {
      return Rejected("Caller balance is not high enough.");
    }
    return Resolved({ state, action });
  };
}

// src/write/claim.js
function claim(state, action) {
  return of({ state, action }).chain(validate5).map(({ state: state2, action: action2, idx }) => {
    if (!state2.balances[action2.caller]) {
      state2.balances[action2.caller] = 0;
    }
    state2.balances[action2.caller] += action2.input.qty;
    state2.claimable.splice(idx, 1);
    return { state: state2 };
  });
}
function validate5({ state, action }) {
  if (!action.input.txID) {
    return Rejected("txID is not found.");
  }
  if (!action.input.qty) {
    return Rejected("claim quantity is not specified.");
  }
  const idx = findIndex_default(propEq_default(action.input.txID, "txID"), state.claimable);
  if (idx < 0) {
    return Rejected("claimable not found.");
  }
  if (state.claimable[idx].qty !== action.input.qty) {
    return Rejected("claimable qty is not equal to claim qty.");
  }
  if (state.claimable[idx].to !== action.caller) {
    return Rejected("claim is not addressed to caller.");
  }
  return Resolved({ state, action, idx });
}

// src/cron/clear.js
function clear(env, state) {
  if (!state.stampHxClear) {
    state.stampHxClear = env.height - 1;
  }
  if (state.stampHxClear < env.height) {
    state.stampHistory = {};
    state.stampHxClear = env.height + 720 * 182;
  }
  return state;
}

// src/index.js
var EVOLVABLE = 1241679;
export async function handle(state, action) {
  const env = {
    vouchContract: state.vouchDAO,
    readState: async (contractTx) => {
      const result = await SmartWeave.contracts.readContractState(contractTx);
      return result;
    },
    height: SmartWeave?.block?.height,
    timestamp: SmartWeave?.block?.timestamp,
    id: SmartWeave?.transaction?.id,
    owner: SmartWeave?.transaction?.owner,
    tags: SmartWeave?.transaction?.tags,
    contractId: SmartWeave?.contract?.id
  };
  if (action.input.function === "stamp") {
    state = await reward(env)(state, action).toPromise().catch((_) => state);
    state = credit(env)(state, action);
    state = clear(env, state);
  }
  switch (action?.input?.function) {
    case "register":
      return register(env)(state, action).fold(handleError, handleSuccess);
    case "stamp":
      return stamp(env)(state, action).chain(superStamps(env)).toPromise().catch(handleError);
    case "balance":
      return balance(env)(state, action).toPromise().catch(handleError);
    case "transfer":
      return transfer(state, action).toPromise().catch(handleError);
    case "evolve":
      return env.height < EVOLVABLE ? evolve(state, action) : { state };
    case "allow":
      return allow(env)(state, action).toPromise().catch(handleError);
    case "claim":
      return claim(state, action).toPromise().catch(handleError);
    default:
      throw new ContractError("no function defined!");
  }
}
function handleError(msg) {
  throw new ContractError(msg);
}
function handleSuccess(result) {
  return result;
}


var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __commonJS = (callback, module) => () => {
  if (!module) {
    module = { exports: {} };
    callback(module.exports, module);
  }
  return module.exports;
};
var __exportStar = (target, module, desc) => {
  if (module && typeof module === "object" || typeof module === "function") {
    for (let key of __getOwnPropNames(module))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module) => {
  return __exportStar(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
};

// node_modules/ramda/src/internal/_isPlaceholder.js
var require_isPlaceholder = __commonJS((exports, module) => {
  function _isPlaceholder(a) {
    return a != null && typeof a === "object" && a["@@functional/placeholder"] === true;
  }
  module.exports = _isPlaceholder;
});

// node_modules/ramda/src/internal/_curry1.js
var require_curry1 = __commonJS((exports, module) => {
  var _isPlaceholder = require_isPlaceholder();
  function _curry1(fn) {
    return function f1(a) {
      if (arguments.length === 0 || _isPlaceholder(a)) {
        return f1;
      } else {
        return fn.apply(this, arguments);
      }
    };
  }
  module.exports = _curry1;
});

// node_modules/ramda/src/internal/_curry2.js
var require_curry2 = __commonJS((exports, module) => {
  var _curry1 = require_curry1();
  var _isPlaceholder = require_isPlaceholder();
  function _curry2(fn) {
    return function f2(a, b) {
      switch (arguments.length) {
        case 0:
          return f2;
        case 1:
          return _isPlaceholder(a) ? f2 : _curry1(function (_b) {
            return fn(a, _b);
          });
        default:
          return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {
            return fn(_a, b);
          }) : _isPlaceholder(b) ? _curry1(function (_b) {
            return fn(a, _b);
          }) : fn(a, b);
      }
    };
  }
  module.exports = _curry2;
});

// node_modules/ramda/src/internal/_isArray.js
var require_isArray = __commonJS((exports, module) => {
  module.exports = Array.isArray || function _isArray(val) {
    return val != null && val.length >= 0 && Object.prototype.toString.call(val) === "[object Array]";
  };
});

// node_modules/ramda/src/internal/_isTransformer.js
var require_isTransformer = __commonJS((exports, module) => {
  function _isTransformer(obj) {
    return obj != null && typeof obj["@@transducer/step"] === "function";
  }
  module.exports = _isTransformer;
});

// node_modules/ramda/src/internal/_dispatchable.js
var require_dispatchable = __commonJS((exports, module) => {
  var _isArray = require_isArray();
  var _isTransformer = require_isTransformer();
  function _dispatchable(methodNames, transducerCreator, fn) {
    return function () {
      if (arguments.length === 0) {
        return fn();
      }
      var obj = arguments[arguments.length - 1];
      if (!_isArray(obj)) {
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
  module.exports = _dispatchable;
});

// node_modules/ramda/src/internal/_map.js
var require_map = __commonJS((exports, module) => {
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
  module.exports = _map;
});

// node_modules/ramda/src/internal/_isString.js
var require_isString = __commonJS((exports, module) => {
  function _isString(x) {
    return Object.prototype.toString.call(x) === "[object String]";
  }
  module.exports = _isString;
});

// node_modules/ramda/src/internal/_isArrayLike.js
var require_isArrayLike = __commonJS((exports, module) => {
  var _curry1 = require_curry1();
  var _isArray = require_isArray();
  var _isString = require_isString();
  var _isArrayLike = /* @__PURE__ */ _curry1(function isArrayLike(x) {
    if (_isArray(x)) {
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
  module.exports = _isArrayLike;
});

// node_modules/ramda/src/internal/_xwrap.js
var require_xwrap = __commonJS((exports, module) => {
  var XWrap = /* @__PURE__ */ function () {
    function XWrap2(fn) {
      this.f = fn;
    }
    XWrap2.prototype["@@transducer/init"] = function () {
      throw new Error("init not implemented on XWrap");
    };
    XWrap2.prototype["@@transducer/result"] = function (acc) {
      return acc;
    };
    XWrap2.prototype["@@transducer/step"] = function (acc, x) {
      return this.f(acc, x);
    };
    return XWrap2;
  }();
  function _xwrap(fn) {
    return new XWrap(fn);
  }
  module.exports = _xwrap;
});

// node_modules/ramda/src/internal/_arity.js
var require_arity = __commonJS((exports, module) => {
  function _arity(n, fn) {
    switch (n) {
      case 0:
        return function () {
          return fn.apply(this, arguments);
        };
      case 1:
        return function (a0) {
          return fn.apply(this, arguments);
        };
      case 2:
        return function (a0, a1) {
          return fn.apply(this, arguments);
        };
      case 3:
        return function (a0, a1, a2) {
          return fn.apply(this, arguments);
        };
      case 4:
        return function (a0, a1, a2, a3) {
          return fn.apply(this, arguments);
        };
      case 5:
        return function (a0, a1, a2, a3, a4) {
          return fn.apply(this, arguments);
        };
      case 6:
        return function (a0, a1, a2, a3, a4, a5) {
          return fn.apply(this, arguments);
        };
      case 7:
        return function (a0, a1, a2, a3, a4, a5, a6) {
          return fn.apply(this, arguments);
        };
      case 8:
        return function (a0, a1, a2, a3, a4, a5, a6, a7) {
          return fn.apply(this, arguments);
        };
      case 9:
        return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
          return fn.apply(this, arguments);
        };
      case 10:
        return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
          return fn.apply(this, arguments);
        };
      default:
        throw new Error("First argument to _arity must be a non-negative integer no greater than ten");
    }
  }
  module.exports = _arity;
});

// node_modules/ramda/src/bind.js
var require_bind = __commonJS((exports, module) => {
  var _arity = require_arity();
  var _curry2 = require_curry2();
  var bind = /* @__PURE__ */ _curry2(function bind2(fn, thisObj) {
    return _arity(fn.length, function () {
      return fn.apply(thisObj, arguments);
    });
  });
  module.exports = bind;
});

// node_modules/ramda/src/internal/_reduce.js
var require_reduce = __commonJS((exports, module) => {
  var _isArrayLike = require_isArrayLike();
  var _xwrap = require_xwrap();
  var bind = require_bind();
  function _arrayReduce(xf, acc, list) {
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
  function _iterableReduce(xf, acc, iter) {
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
  function _methodReduce(xf, acc, obj, methodName) {
    return xf["@@transducer/result"](obj[methodName](bind(xf["@@transducer/step"], xf), acc));
  }
  var symIterator = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
  function _reduce(fn, acc, list) {
    if (typeof fn === "function") {
      fn = _xwrap(fn);
    }
    if (_isArrayLike(list)) {
      return _arrayReduce(fn, acc, list);
    }
    if (typeof list["fantasy-land/reduce"] === "function") {
      return _methodReduce(fn, acc, list, "fantasy-land/reduce");
    }
    if (list[symIterator] != null) {
      return _iterableReduce(fn, acc, list[symIterator]());
    }
    if (typeof list.next === "function") {
      return _iterableReduce(fn, acc, list);
    }
    if (typeof list.reduce === "function") {
      return _methodReduce(fn, acc, list, "reduce");
    }
    throw new TypeError("reduce: list must be array or iterable");
  }
  module.exports = _reduce;
});

// node_modules/ramda/src/internal/_xfBase.js
var require_xfBase = __commonJS((exports, module) => {
  module.exports = {
    init: function () {
      return this.xf["@@transducer/init"]();
    },
    result: function (result) {
      return this.xf["@@transducer/result"](result);
    }
  };
});

// node_modules/ramda/src/internal/_xmap.js
var require_xmap = __commonJS((exports, module) => {
  var _curry2 = require_curry2();
  var _xfBase = require_xfBase();
  var XMap = /* @__PURE__ */ function () {
    function XMap2(f, xf) {
      this.xf = xf;
      this.f = f;
    }
    XMap2.prototype["@@transducer/init"] = _xfBase.init;
    XMap2.prototype["@@transducer/result"] = _xfBase.result;
    XMap2.prototype["@@transducer/step"] = function (result, input) {
      return this.xf["@@transducer/step"](result, this.f(input));
    };
    return XMap2;
  }();
  var _xmap = /* @__PURE__ */ _curry2(function _xmap2(f, xf) {
    return new XMap(f, xf);
  });
  module.exports = _xmap;
});

// node_modules/ramda/src/internal/_curryN.js
var require_curryN = __commonJS((exports, module) => {
  var _arity = require_arity();
  var _isPlaceholder = require_isPlaceholder();
  function _curryN(length2, received, fn) {
    return function () {
      var combined = [];
      var argsIdx = 0;
      var left = length2;
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
      return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length2, combined, fn));
    };
  }
  module.exports = _curryN;
});

// node_modules/ramda/src/curryN.js
var require_curryN2 = __commonJS((exports, module) => {
  var _arity = require_arity();
  var _curry1 = require_curry1();
  var _curry2 = require_curry2();
  var _curryN = require_curryN();
  var curryN = /* @__PURE__ */ _curry2(function curryN2(length2, fn) {
    if (length2 === 1) {
      return _curry1(fn);
    }
    return _arity(length2, _curryN(length2, [], fn));
  });
  module.exports = curryN;
});

// node_modules/ramda/src/internal/_has.js
var require_has = __commonJS((exports, module) => {
  function _has(prop2, obj) {
    return Object.prototype.hasOwnProperty.call(obj, prop2);
  }
  module.exports = _has;
});

// node_modules/ramda/src/internal/_isArguments.js
var require_isArguments = __commonJS((exports, module) => {
  var _has = require_has();
  var toString = Object.prototype.toString;
  var _isArguments = /* @__PURE__ */ function () {
    return toString.call(arguments) === "[object Arguments]" ? function _isArguments2(x) {
      return toString.call(x) === "[object Arguments]";
    } : function _isArguments2(x) {
      return _has("callee", x);
    };
  }();
  module.exports = _isArguments;
});

// node_modules/ramda/src/keys.js
var require_keys = __commonJS((exports, module) => {
  var _curry1 = require_curry1();
  var _has = require_has();
  var _isArguments = require_isArguments();
  var hasEnumBug = !/* @__PURE__ */ {
    toString: null
  }.propertyIsEnumerable("toString");
  var nonEnumerableProps = ["constructor", "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
  var hasArgsEnumBug = /* @__PURE__ */ function () {
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
  var keys2 = typeof Object.keys === "function" && !hasArgsEnumBug ? /* @__PURE__ */ _curry1(function keys3(obj) {
    return Object(obj) !== obj ? [] : Object.keys(obj);
  }) : /* @__PURE__ */ _curry1(function keys3(obj) {
    if (Object(obj) !== obj) {
      return [];
    }
    var prop2, nIdx;
    var ks = [];
    var checkArgsLength = hasArgsEnumBug && _isArguments(obj);
    for (prop2 in obj) {
      if (_has(prop2, obj) && (!checkArgsLength || prop2 !== "length")) {
        ks[ks.length] = prop2;
      }
    }
    if (hasEnumBug) {
      nIdx = nonEnumerableProps.length - 1;
      while (nIdx >= 0) {
        prop2 = nonEnumerableProps[nIdx];
        if (_has(prop2, obj) && !contains(ks, prop2)) {
          ks[ks.length] = prop2;
        }
        nIdx -= 1;
      }
    }
    return ks;
  });
  module.exports = keys2;
});

// node_modules/ramda/src/map.js
var require_map2 = __commonJS((exports, module) => {
  var _curry2 = require_curry2();
  var _dispatchable = require_dispatchable();
  var _map = require_map();
  var _reduce = require_reduce();
  var _xmap = require_xmap();
  var curryN = require_curryN2();
  var keys2 = require_keys();
  var map3 = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["fantasy-land/map", "map"], _xmap, function map4(fn, functor) {
    switch (Object.prototype.toString.call(functor)) {
      case "[object Function]":
        return curryN(functor.length, function () {
          return fn.call(this, functor.apply(this, arguments));
        });
      case "[object Object]":
        return _reduce(function (acc, key) {
          acc[key] = fn(functor[key]);
          return acc;
        }, {}, keys2(functor));
      default:
        return _map(fn, functor);
    }
  }));
  module.exports = map3;
});

// node_modules/ramda/src/internal/_curry3.js
var require_curry3 = __commonJS((exports, module) => {
  var _curry1 = require_curry1();
  var _curry2 = require_curry2();
  var _isPlaceholder = require_isPlaceholder();
  function _curry3(fn) {
    return function f3(a, b, c) {
      switch (arguments.length) {
        case 0:
          return f3;
        case 1:
          return _isPlaceholder(a) ? f3 : _curry2(function (_b, _c) {
            return fn(a, _b, _c);
          });
        case 2:
          return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function (_a, _c) {
            return fn(_a, b, _c);
          }) : _isPlaceholder(b) ? _curry2(function (_b, _c) {
            return fn(a, _b, _c);
          }) : _curry1(function (_c) {
            return fn(a, b, _c);
          });
        default:
          return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function (_a, _b) {
            return fn(_a, _b, c);
          }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function (_a, _c) {
            return fn(_a, b, _c);
          }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function (_b, _c) {
            return fn(a, _b, _c);
          }) : _isPlaceholder(a) ? _curry1(function (_a) {
            return fn(_a, b, c);
          }) : _isPlaceholder(b) ? _curry1(function (_b) {
            return fn(a, _b, c);
          }) : _isPlaceholder(c) ? _curry1(function (_c) {
            return fn(a, b, _c);
          }) : fn(a, b, c);
      }
    };
  }
  module.exports = _curry3;
});

// node_modules/ramda/src/internal/_isInteger.js
var require_isInteger = __commonJS((exports, module) => {
  module.exports = Number.isInteger || function _isInteger(n) {
    return n << 0 === n;
  };
});

// node_modules/ramda/src/internal/_assoc.js
var require_assoc = __commonJS((exports, module) => {
  var _isArray = require_isArray();
  var _isInteger = require_isInteger();
  function _assoc(prop2, val, obj) {
    if (_isInteger(prop2) && _isArray(obj)) {
      var arr = [].concat(obj);
      arr[prop2] = val;
      return arr;
    }
    var result = {};
    for (var p in obj) {
      result[p] = obj[p];
    }
    result[prop2] = val;
    return result;
  }
  module.exports = _assoc;
});

// node_modules/ramda/src/isNil.js
var require_isNil = __commonJS((exports, module) => {
  var _curry1 = require_curry1();
  var isNil = /* @__PURE__ */ _curry1(function isNil2(x) {
    return x == null;
  });
  module.exports = isNil;
});

// node_modules/ramda/src/assocPath.js
var require_assocPath = __commonJS((exports, module) => {
  var _curry3 = require_curry3();
  var _has = require_has();
  var _isInteger = require_isInteger();
  var _assoc = require_assoc();
  var isNil = require_isNil();
  var assocPath = /* @__PURE__ */ _curry3(function assocPath2(path, val, obj) {
    if (path.length === 0) {
      return val;
    }
    var idx = path[0];
    if (path.length > 1) {
      var nextObj = !isNil(obj) && _has(idx, obj) ? obj[idx] : _isInteger(path[1]) ? [] : {};
      val = assocPath2(Array.prototype.slice.call(path, 1), val, nextObj);
    }
    return _assoc(idx, val, obj);
  });
  module.exports = assocPath;
});

// node_modules/ramda/src/assoc.js
var require_assoc2 = __commonJS((exports, module) => {
  var _curry3 = require_curry3();
  var assocPath = require_assocPath();
  var assoc3 = /* @__PURE__ */ _curry3(function assoc4(prop2, val, obj) {
    return assocPath([prop2], val, obj);
  });
  module.exports = assoc3;
});

// node_modules/ramda/src/internal/_isNumber.js
var require_isNumber = __commonJS((exports, module) => {
  function _isNumber(x) {
    return Object.prototype.toString.call(x) === "[object Number]";
  }
  module.exports = _isNumber;
});

// node_modules/ramda/src/length.js
var require_length = __commonJS((exports, module) => {
  var _curry1 = require_curry1();
  var _isNumber = require_isNumber();
  var length2 = /* @__PURE__ */ _curry1(function length3(list) {
    return list != null && _isNumber(list.length) ? list.length : NaN;
  });
  module.exports = length2;
});

// node_modules/ramda/src/reduce.js
var require_reduce2 = __commonJS((exports, module) => {
  var _curry3 = require_curry3();
  var _reduce = require_reduce();
  var reduce2 = /* @__PURE__ */ _curry3(_reduce);
  module.exports = reduce2;
});

// node_modules/ramda/src/values.js
var require_values = __commonJS((exports, module) => {
  var _curry1 = require_curry1();
  var keys2 = require_keys();
  var values2 = /* @__PURE__ */ _curry1(function values3(obj) {
    var props = keys2(obj);
    var len = props.length;
    var vals = [];
    var idx = 0;
    while (idx < len) {
      vals[idx] = obj[props[idx]];
      idx += 1;
    }
    return vals;
  });
  module.exports = values2;
});

// node_modules/ramda/src/add.js
var require_add = __commonJS((exports, module) => {
  var _curry2 = require_curry2();
  var add2 = /* @__PURE__ */ _curry2(function add3(a, b) {
    return Number(a) + Number(b);
  });
  module.exports = add2;
});

// node_modules/ramda/src/internal/_objectAssign.js
var require_objectAssign = __commonJS((exports, module) => {
  var _has = require_has();
  function _objectAssign(target) {
    if (target == null) {
      throw new TypeError("Cannot convert undefined or null to object");
    }
    var output = Object(target);
    var idx = 1;
    var length2 = arguments.length;
    while (idx < length2) {
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
  module.exports = typeof Object.assign === "function" ? Object.assign : _objectAssign;
});

// node_modules/ramda/src/mergeAll.js
var require_mergeAll = __commonJS((exports, module) => {
  var _objectAssign = require_objectAssign();
  var _curry1 = require_curry1();
  var mergeAll2 = /* @__PURE__ */ _curry1(function mergeAll3(list) {
    return _objectAssign.apply(null, [{}].concat(list));
  });
  module.exports = mergeAll2;
});

// node_modules/ramda/src/nth.js
var require_nth = __commonJS((exports, module) => {
  var _curry2 = require_curry2();
  var _isString = require_isString();
  var nth = /* @__PURE__ */ _curry2(function nth2(offset, list) {
    var idx = offset < 0 ? list.length + offset : offset;
    return _isString(list) ? list.charAt(idx) : list[idx];
  });
  module.exports = nth;
});

// node_modules/ramda/src/prop.js
var require_prop = __commonJS((exports, module) => {
  var _curry2 = require_curry2();
  var _isInteger = require_isInteger();
  var nth = require_nth();
  var prop2 = /* @__PURE__ */ _curry2(function prop3(p, obj) {
    if (obj == null) {
      return;
    }
    return _isInteger(p) ? nth(p, obj) : obj[p];
  });
  module.exports = prop2;
});

// node_modules/ramda/src/pluck.js
var require_pluck = __commonJS((exports, module) => {
  var _curry2 = require_curry2();
  var map3 = require_map2();
  var prop2 = require_prop();
  var pluck2 = /* @__PURE__ */ _curry2(function pluck3(p, list) {
    return map3(prop2(p), list);
  });
  module.exports = pluck2;
});

// node_modules/ramda/src/internal/_checkForMethod.js
var require_checkForMethod = __commonJS((exports, module) => {
  var _isArray = require_isArray();
  function _checkForMethod(methodname, fn) {
    return function () {
      var length2 = arguments.length;
      if (length2 === 0) {
        return fn();
      }
      var obj = arguments[length2 - 1];
      return _isArray(obj) || typeof obj[methodname] !== "function" ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length2 - 1));
    };
  }
  module.exports = _checkForMethod;
});

// node_modules/ramda/src/internal/_cloneRegExp.js
var require_cloneRegExp = __commonJS((exports, module) => {
  function _cloneRegExp(pattern) {
    return new RegExp(pattern.source, (pattern.global ? "g" : "") + (pattern.ignoreCase ? "i" : "") + (pattern.multiline ? "m" : "") + (pattern.sticky ? "y" : "") + (pattern.unicode ? "u" : ""));
  }
  module.exports = _cloneRegExp;
});

// node_modules/ramda/src/type.js
var require_type = __commonJS((exports, module) => {
  var _curry1 = require_curry1();
  var type = /* @__PURE__ */ _curry1(function type2(val) {
    return val === null ? "Null" : val === void 0 ? "Undefined" : Object.prototype.toString.call(val).slice(8, -1);
  });
  module.exports = type;
});

// node_modules/ramda/src/internal/_clone.js
var require_clone = __commonJS((exports, module) => {
  var _cloneRegExp = require_cloneRegExp();
  var type = require_type();
  function _clone(value, refFrom, refTo, deep) {
    var copy = function copy2(copiedValue) {
      var len = refFrom.length;
      var idx = 0;
      while (idx < len) {
        if (value === refFrom[idx]) {
          return refTo[idx];
        }
        idx += 1;
      }
      refFrom[idx] = value;
      refTo[idx] = copiedValue;
      for (var key in value) {
        if (value.hasOwnProperty(key)) {
          copiedValue[key] = deep ? _clone(value[key], refFrom, refTo, true) : value[key];
        }
      }
      return copiedValue;
    };
    switch (type(value)) {
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
  module.exports = _clone;
});

// node_modules/ramda/src/internal/_reduced.js
var require_reduced = __commonJS((exports, module) => {
  function _reduced(x) {
    return x && x["@@transducer/reduced"] ? x : {
      "@@transducer/value": x,
      "@@transducer/reduced": true
    };
  }
  module.exports = _reduced;
});

// node_modules/ramda/src/internal/_xreduceBy.js
var require_xreduceBy = __commonJS((exports, module) => {
  var _curryN = require_curryN();
  var _has = require_has();
  var _xfBase = require_xfBase();
  var XReduceBy = /* @__PURE__ */ function () {
    function XReduceBy2(valueFn, valueAcc, keyFn, xf) {
      this.valueFn = valueFn;
      this.valueAcc = valueAcc;
      this.keyFn = keyFn;
      this.xf = xf;
      this.inputs = {};
    }
    XReduceBy2.prototype["@@transducer/init"] = _xfBase.init;
    XReduceBy2.prototype["@@transducer/result"] = function (result) {
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
    XReduceBy2.prototype["@@transducer/step"] = function (result, input) {
      var key = this.keyFn(input);
      this.inputs[key] = this.inputs[key] || [key, this.valueAcc];
      this.inputs[key][1] = this.valueFn(this.inputs[key][1], input);
      return result;
    };
    return XReduceBy2;
  }();
  var _xreduceBy = /* @__PURE__ */ _curryN(4, [], function _xreduceBy2(valueFn, valueAcc, keyFn, xf) {
    return new XReduceBy(valueFn, valueAcc, keyFn, xf);
  });
  module.exports = _xreduceBy;
});

// node_modules/ramda/src/reduceBy.js
var require_reduceBy = __commonJS((exports, module) => {
  var _clone = require_clone();
  var _curryN = require_curryN();
  var _dispatchable = require_dispatchable();
  var _has = require_has();
  var _reduce = require_reduce();
  var _reduced = require_reduced();
  var _xreduceBy = require_xreduceBy();
  var reduceBy = /* @__PURE__ */ _curryN(4, [], /* @__PURE__ */ _dispatchable([], _xreduceBy, function reduceBy2(valueFn, valueAcc, keyFn, list) {
    return _reduce(function (acc, elt) {
      var key = keyFn(elt);
      var value = valueFn(_has(key, acc) ? acc[key] : _clone(valueAcc, [], [], false), elt);
      if (value && value["@@transducer/reduced"]) {
        return _reduced(acc);
      }
      acc[key] = value;
      return acc;
    }, {}, list);
  }));
  module.exports = reduceBy;
});

// node_modules/ramda/src/groupBy.js
var require_groupBy = __commonJS((exports, module) => {
  var _checkForMethod = require_checkForMethod();
  var _curry2 = require_curry2();
  var reduceBy = require_reduceBy();
  var groupBy2 = /* @__PURE__ */ _curry2(/* @__PURE__ */ _checkForMethod("groupBy", /* @__PURE__ */ reduceBy(function (acc, item) {
    acc.push(item);
    return acc;
  }, [])));
  module.exports = groupBy2;
});

// node_modules/ramda/src/toPairs.js
var require_toPairs = __commonJS((exports, module) => {
  var _curry1 = require_curry1();
  var _has = require_has();
  var toPairs2 = /* @__PURE__ */ _curry1(function toPairs3(obj) {
    var pairs = [];
    for (var prop2 in obj) {
      if (_has(prop2, obj)) {
        pairs[pairs.length] = [prop2, obj[prop2]];
      }
    }
    return pairs;
  });
  module.exports = toPairs2;
});

// node_modules/ramda/src/internal/_makeFlat.js
var require_makeFlat = __commonJS((exports, module) => {
  var _isArrayLike = require_isArrayLike();
  function _makeFlat(recursive) {
    return function flatt(list) {
      var value, jlen, j;
      var result = [];
      var idx = 0;
      var ilen = list.length;
      while (idx < ilen) {
        if (_isArrayLike(list[idx])) {
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
  module.exports = _makeFlat;
});

// node_modules/ramda/src/flatten.js
var require_flatten = __commonJS((exports, module) => {
  var _curry1 = require_curry1();
  var _makeFlat = require_makeFlat();
  var flatten2 = /* @__PURE__ */ _curry1(/* @__PURE__ */ _makeFlat(true));
  module.exports = flatten2;
});

// node_modules/ramda/src/sum.js
var require_sum = __commonJS((exports, module) => {
  var add2 = require_add();
  var reduce2 = require_reduce2();
  var sum2 = /* @__PURE__ */ reduce2(add2, 0);
  module.exports = sum2;
});

// node_modules/@verto/flex/dist/index.esm.js
var __defProp2 = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp2 = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop2 in b || (b = {}))
    if (__hasOwnProp2.call(b, prop2))
      __defNormalProp(a, prop2, b[prop2]);
  if (__getOwnPropSymbols)
    for (var prop2 of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop2))
        __defNormalProp(a, prop2, b[prop2]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var feeWallet = "SMft-XozLyxl0ztM-gPSYKvlZVCBiiftNIb4kGFI7wg";
var ensureValidTransfer = (tokenID, transferTx, caller) => __async(void 0, null, function* () {
  yield ensureValidInteraction(tokenID, transferTx);
  try {
    const tx = yield SmartWeave.unsafeClient.transactions.get(transferTx);
    tx.get("tags").forEach((tag) => {
      if (tag.get("name", { decode: true, string: true }) === "Input") {
        const input = JSON.parse(tag.get("value", { decode: true, string: true }));
        ContractAssert(input.function === "transfer", "The interaction is not a transfer");
        ContractAssert(input.target === getContractID(), "The target of this transfer is not this contract");
        ContractAssert(input.qty && input.qty > 0, "Invalid transfer quantity");
      }
    });
    const transferOwner = tx.get("owner");
    const transferOwnerAddress = yield SmartWeave.unsafeClient.wallets.ownerToAddress(transferOwner);
    ContractAssert(transferOwnerAddress === caller, "Transfer owner is not the order creator");
  } catch (err) {
    throw new ContractError(err);
  }
});
var ensureValidInteraction = (contractID, interactionID) => __async(void 0, null, function* () {
  const {
    validity: contractTxValidities
  } = yield SmartWeave.contracts.readContractState(contractID, void 0, true);
  ContractAssert(interactionID in contractTxValidities, "The interaction is not associated with this contract");
  ContractAssert(contractTxValidities[interactionID], "The interaction was invalid");
});
var isAddress = (addr) => /[a-z0-9_-]{43}/i.test(addr);
function tagPatch(tags) {
  if (Array.isArray(tags))
    return tags;
  const constructedArray = [];
  for (const field in tags) {
    constructedArray.push({
      name: field,
      value: tags[field]
    });
  }
  return constructedArray;
}
function getContractID() {
  const tags = tagPatch(SmartWeave.transaction.tags);
  const id = tags.find(({ name }) => name === "Contract").value;
  return id;
}
var AddPair = (state, action) => __async(void 0, null, function* () {
  var _a, _b;
  const caller = action.caller;
  const input = action.input;
  const pairs = state.pairs;
  const newPair = input.pair;
  ContractAssert(newPair !== getContractID(), "Cannot add self as a pair");
  ContractAssert(!pairs.find(({ pair: existingPair }) => existingPair.includes(newPair)), "This pair already exists");
  ContractAssert(/[a-z0-9_-]{43}/i.test(newPair), "Pair contract is invalid");
  try {
    const tokenState = yield SmartWeave.contracts.readContractState(newPair);
    ContractAssert((tokenState == null ? void 0 : tokenState.ticker) && (tokenState == null ? void 0 : tokenState.balances), "Contract is not a valid token");
    ContractAssert(typeof tokenState.ticker === "string", "Contract ticker is not a string");
    for (const addr in tokenState.balances) {
      ContractAssert(typeof tokenState.balances[addr] === "number", `Invalid balance for "${addr}" in contract "${newPair}"`);
    }
    const tradeableSetting = (_b = (_a = tokenState == null ? void 0 : tokenState.settings) == null ? void 0 : _a.find(([settingName]) => settingName === "isTradeable")) == null ? void 0 : _b[1];
    ContractAssert(tradeableSetting === true || tradeableSetting === void 0, `This token does not allow trading (${newPair})`);
    ContractAssert(!!tokenState.invocations, 'Contract does not have an "invocations" filed, making it incompatible with FCP');
    ContractAssert(!!tokenState.foreignCalls, 'Contract does not have an "foreignCalls" filed, making it incompatible with FCP');
  } catch (e) {
    throw new ContractError(e);
  }
  state.pairs.push({
    pair: [getContractID(), newPair],
    orders: []
  });
  return state;
});
var CancelOrder = (state, action) => __async(void 0, null, function* () {
  const caller = action.caller;
  const input = action.input;
  const orderTxID = input.orderID;
  ContractAssert(isAddress(orderTxID), "Invalid order ID");
  const allOrders = state.pairs.map((pair) => pair.orders).flat(1);
  const order = allOrders.find(({ id }) => id === orderTxID);
  ContractAssert(order !== void 0, "Order does not exist");
  ContractAssert(order.creator === caller, "Caller is not the creator of the order");
  state.foreignCalls.push({
    txID: SmartWeave.transaction.id,
    contract: order.token,
    input: {
      function: "transfer",
      target: caller,
      qty: order.quantity
    }
  });
  const acitvePair = state.pairs.find((pair) => pair.orders.find(({ id }) => id === orderTxID));
  acitvePair.orders = acitvePair.orders.filter(({ id }) => id !== orderTxID);
  return state;
});
var CreateOrder = (state, action) => __async(void 0, null, function* () {
  const caller = action.caller;
  const input = action.input;
  const pairs = state.pairs;
  const usedPair = input.pair;
  const tokenTx = input.transaction;
  const price = input.price;
  ContractAssert(isAddress(usedPair[0]) && isAddress(usedPair[1]), "One of two supplied pairs is invalid");
  ContractAssert(price === void 0 || price === null || price > 0, "Price must be greater than 0");
  let contractID = "";
  let contractInput;
  let transferTx;
  try {
    transferTx = yield SmartWeave.unsafeClient.transactions.get(tokenTx);
  } catch (err) {
    throw new ContractError(err);
  }
  transferTx.get("tags").forEach((tag) => {
    if (tag.get("name", { decode: true, string: true }) === "Contract") {
      contractID = tag.get("value", { decode: true, string: true });
    }
    if (tag.get("name", { decode: true, string: true }) === "Input") {
      contractInput = JSON.parse(tag.get("value", { decode: true, string: true }));
    }
  });
  ContractAssert(typeof contractID === "string", "Invalid contract ID in transfer: not a string");
  ContractAssert(contractID !== "", "No contract ID found in the transfer transaction");
  ContractAssert(!state.usedTransfers.includes(tokenTx), "This transfer has already been used for an order");
  ContractAssert(isAddress(contractID), "Invalid contract ID format");
  yield ensureValidTransfer(contractID, tokenTx, caller);
  const refundTransfer = () => state.foreignCalls.push({
    txID: SmartWeave.transaction.id,
    contract: contractID,
    input: {
      function: "transfer",
      target: caller,
      qty: contractInput.qty
    }
  });
  const fromToken = usedPair[0];
  if (fromToken !== contractID) {
    refundTransfer();
    return {
      state,
      result: {
        status: "failure",
        message: "Invalid transfer transaction, using the wrong token. The transferred token has to be the first item in the pair"
      }
    };
  }
  const pairIndex = pairs.findIndex(({ pair }) => pair.includes(usedPair[0]) && pair.includes(usedPair[1]));
  if (pairIndex === -1) {
    refundTransfer();
    return {
      state,
      result: {
        status: "failure",
        message: "This pair does not exist yet"
      }
    };
  }
  const sortedOrderbook = state.pairs[pairIndex].orders.sort((a, b) => a.price > b.price ? 1 : -1);
  const dominantToken = state.pairs[pairIndex].pair[0];
  try {
    const { orderbook, foreignCalls, matches } = matchOrder({
      pair: {
        dominant: dominantToken,
        from: contractID,
        to: usedPair.find((val) => val !== contractID)
      },
      quantity: contractInput.qty,
      creator: caller,
      transaction: SmartWeave.transaction.id,
      transfer: tokenTx,
      price
    }, sortedOrderbook);
    state.pairs[pairIndex].orders = orderbook;
    if (matches.length > 0) {
      const vwap = matches.map(({ qty: volume, price: price2 }) => volume * price2).reduce((a, b) => a + b, 0) / matches.map(({ qty: volume }) => volume).reduce((a, b) => a + b, 0);
      state.pairs[pairIndex].priceData = {
        dominantToken,
        block: SmartWeave.block.height,
        vwap,
        matchLogs: matches
      };
    } else {
      state.pairs[pairIndex].priceData = void 0;
    }
    for (let i = 0; i < foreignCalls.length; i++) {
      state.foreignCalls.push(foreignCalls[i]);
    }
    state.usedTransfers.push(tokenTx);
    return {
      state,
      result: {
        status: "success",
        message: "Order created successfully"
      }
    };
  } catch (e) {
    refundTransfer();
    return {
      state,
      result: {
        status: "failure",
        message: e.message
      }
    };
  }
});
function matchOrder(input, orderbook) {
  var _a, _b;
  const orderType = input.price ? "limit" : "market";
  const foreignCalls = [];
  const matches = [];
  const reverseOrders = orderbook.filter((order) => input.pair.from !== order.token && order.id !== input.transaction);
  if (!reverseOrders.length) {
    if (orderType !== "limit")
      throw new Error('The first order for a pair can only be a "limit" order');
    orderbook.push({
      id: input.transaction,
      transfer: input.transfer,
      creator: input.creator,
      token: input.pair.from,
      price: input.price,
      quantity: input.quantity,
      originalQuantity: input.quantity
    });
    return {
      orderbook,
      foreignCalls,
      matches
    };
  }
  let fillAmount;
  let receiveAmount = 0;
  let remainingQuantity = input.quantity;
  for (let i = 0; i < orderbook.length; i++) {
    const currentOrder = orderbook[i];
    if (input.pair.from === currentOrder.token || currentOrder.id === input.transaction)
      continue;
    const reversePrice = 1 / currentOrder.price;
    if (orderType === "limit" && input.price !== reversePrice)
      continue;
    fillAmount = remainingQuantity * ((_a = input.price) != null ? _a : reversePrice);
    let receiveFromCurrent = 0;
    if (fillAmount <= currentOrder.quantity) {
      receiveFromCurrent = remainingQuantity * reversePrice;
      currentOrder.quantity -= fillAmount;
      receiveAmount += receiveFromCurrent;
      if (remainingQuantity > 0) {
        foreignCalls.push({
          txID: SmartWeave.transaction.id,
          contract: input.pair.from,
          input: {
            function: "transfer",
            target: currentOrder.creator,
            qty: Math.round(remainingQuantity * 0.98)
          }
        });
        foreignCalls.push({
          txID: SmartWeave.transaction.id,
          contract: input.pair.from,
          input: {
            function: "transfer",
            target: feeWallet,
            qty: Math.round(remainingQuantity * 0.02)
          }
        });
      }
      remainingQuantity = 0;
    } else {
      receiveFromCurrent = currentOrder.quantity;
      receiveAmount += receiveFromCurrent;
      const sendAmount = receiveFromCurrent * currentOrder.price;
      remainingQuantity -= sendAmount;
      foreignCalls.push({
        txID: SmartWeave.transaction.id,
        contract: input.pair.from,
        input: {
          function: "transfer",
          target: currentOrder.creator,
          qty: Math.round(sendAmount * 0.98)
        }
      });
      foreignCalls.push({
        txID: SmartWeave.transaction.id,
        contract: input.pair.from,
        input: {
          function: "transfer",
          target: feeWallet,
          qty: Math.round(sendAmount * 0.02)
        }
      });
      currentOrder.quantity = 0;
    }
    let dominantPrice = 0;
    if (input.pair.dominant === input.pair.from) {
      dominantPrice = (_b = input.price) != null ? _b : reversePrice;
    } else {
      dominantPrice = currentOrder.price;
    }
    matches.push({
      id: currentOrder.id,
      qty: receiveFromCurrent,
      price: dominantPrice
    });
    if (currentOrder.quantity === 0) {
      orderbook = orderbook.filter((val) => val.id !== currentOrder.id);
    }
    if (remainingQuantity === 0)
      break;
  }
  if (remainingQuantity > 0) {
    if (orderType === "limit") {
      orderbook.push({
        id: input.transaction,
        transfer: input.transfer,
        creator: input.creator,
        token: input.pair.from,
        price: input.price,
        quantity: remainingQuantity,
        originalQuantity: input.quantity
      });
    } else {
      foreignCalls.push({
        txID: SmartWeave.transaction.id,
        contract: input.pair.from,
        input: {
          function: "transfer",
          target: input.creator,
          qty: remainingQuantity
        }
      });
    }
  }
  foreignCalls.push({
    txID: SmartWeave.transaction.id,
    contract: input.pair.to,
    input: {
      function: "transfer",
      target: input.creator,
      qty: Math.round(receiveAmount * 0.98)
    }
  });
  foreignCalls.push({
    txID: SmartWeave.transaction.id,
    contract: input.pair.to,
    input: {
      function: "transfer",
      target: feeWallet,
      qty: Math.round(receiveAmount * 0.02)
    }
  });
  return {
    orderbook,
    foreignCalls,
    matches
  };
}
var Halt = (state, action) => {
  const caller = action.caller;
  ContractAssert(caller === state.emergencyHaltWallet, "Caller cannot halt or resume the protocol");
  return __spreadProps(__spreadValues({}, state), { halted: !state.halted });
};
var ReadOutbox = (state, action, handle2) => __async(void 0, null, function* () {
  const input = action.input;
  ContractAssert(!!input.contract, "Missing contract to invoke");
  ContractAssert(input.contract !== getContractID(), "Cannot read own outbox");
  const foreignState = yield SmartWeave.contracts.readContractState(input.contract);
  ContractAssert(!!foreignState.foreignCalls, "Contract is missing support for foreign calls");
  const calls = foreignState.foreignCalls.filter((element) => element.contract === SmartWeave.contract.id && !state.invocations.includes(element.txID));
  let res = state;
  for (const entry of calls) {
    res = (yield handle2(res, { caller: input.contract, input: entry.input })).state;
    res.invocations.push(entry.txID);
  }
  return res;
});

// node_modules/vouch-verified/verified.js
async function verified(state, action) {
  const res = await SmartWeave.contracts.readContractState("ZGaL5DOMIYRw9YHZ_NZ2JoIjST1QwhiD6T1jePH381I");
  const verifiedAddresses = res.votes.filter((vote) => vote.status === "passed").reduce((a, { value }) => ({ ...a, [value]: true }), {});
  return verifiedAddresses;
}

// src/contract.ts
var import_map2 = __toModule(require_map2());
var import_assoc2 = __toModule(require_assoc2());

// src/utils.ts
var import_length = __toModule(require_length());
var import_reduce = __toModule(require_reduce2());
var import_assoc = __toModule(require_assoc2());
var import_values = __toModule(require_values());
var import_keys = __toModule(require_keys());
var import_add = __toModule(require_add());
var import_mergeAll = __toModule(require_mergeAll());
var import_map = __toModule(require_map2());
var import_pluck = __toModule(require_pluck());
var import_prop = __toModule(require_prop());
var import_groupBy = __toModule(require_groupBy());
var import_toPairs = __toModule(require_toPairs());
var import_flatten = __toModule(require_flatten());
var import_sum = __toModule(require_sum());
function mintRewards(stamps, reward2) {
  const stampers = (0, import_groupBy.default)((0, import_prop.default)("address"), stamps);
  const totalUniqueStampers = (0, import_length.default)((0, import_keys.default)(stampers));
  var mintRemainder = reward2 % totalUniqueStampers;
  const allocation = parseInt(reward2 / totalUniqueStampers);
  return (0, import_flatten.default)((0, import_map.default)(([_, value]) => {
    var rewardsFromStamper = allocation;
    if (mintRemainder > 0) {
      rewardsFromStamper++;
      mintRemainder--;
    }
    var stamperRemainder = rewardsFromStamper % value.length;
    const stamperAllocation = parseInt(rewardsFromStamper / value.length);
    return (0, import_map.default)((asset) => {
      var rewardsForAsset = stamperAllocation;
      if (stamperRemainder > 0) {
        rewardsForAsset++;
        stamperRemainder--;
      }
      return { asset, rewardsForAsset };
    }, (0, import_pluck.default)("asset", value));
  }, (0, import_toPairs.default)(stampers))).reduce((a, { asset, rewardsForAsset }) => a[asset] ? (0, import_assoc.default)(asset, a[asset] + rewardsForAsset, a) : (0, import_assoc.default)(asset, rewardsForAsset, a), {});
}
function pstAllocation(balances, reward2) {
  var total = (0, import_reduce.default)(import_add.default, 0, (0, import_values.default)(balances).filter((v) => v > 0));
  const allocation = (0, import_mergeAll.default)((0, import_reduce.default)((a, s) => {
    const asset = s[0];
    const balance2 = s[1];
    if (balance2 < 1) {
      return a;
    }
    var pct = balance2 / total * 100;
    const coins = Math.round(reward2 * (pct / 100));
    return [...a, { [asset]: Number(coins) }];
  }, [], Object.entries(balances)));
  var remainder = reward2 - (0, import_sum.default)((0, import_values.default)(allocation));
  var iterator = (0, import_keys.default)(allocation).entries();
  while (remainder > 0) {
    allocation[iterator.next().value[1]]++;
    remainder--;
  }
  return allocation;
}

// src/contract.ts
var functions = { evolve, stamp, reward, transfer, balance };
var REWARD = 1e15;
export async function handle(state, action) {
  if (action.input.function === "addPair") {
    const s = await AddPair(state, action);
    return { state: s };
  }
  if (action.input.function === "cancelOrder") {
    const s = await CancelOrder(state, action);
    return { state: s };
  }
  if (action.input.function === "createOrder") {
    const resultObj = await CreateOrder(state, action);
    return { state: resultObj.state };
  }
  if (action.input.function === "halt") {
    const s = await Halt(state, action);
    return { state: s };
  }
  if (action.input.function === "readOutbox") {
    const s = await ReadOutbox(state, action);
    return { state: s };
  }
  if (Object.keys(functions).includes(action.input.function)) {
    return functions[action.input.function](state, action);
  }
  throw new ContractError(`${action.input.function} function not implemented!`);
}
async function reward(state, action) {
  const caller = action.caller;
  ContractAssert(action.input.timestamp, "Timestamp is required for reward processing.");
  ContractAssert(caller === state.creator, "Only coin creator can run reward function!");
  const newStampValues = Object.values(state.stamps).filter((stamp2) => stamp2.flagged === false);
  const rewards = mintRewards(newStampValues, REWARD);
  state.rewardLog = Object.entries(rewards).reduce((a, [asset, coins]) => {
    return [...a, { asset, coins, timestamp: action.input.timestamp }];
  }, state.rewardLog || []);
  const allocations = await Promise.all((0, import_map2.default)(async ([asset, coins]) => {
    try {
      const x = await SmartWeave.contracts.readContractState(asset);
      if (x.balances && Object.keys(x.balances).length > 0) {
        const r = pstAllocation(x.balances, coins);
        delete r[void 0];
        console.log(r);
        return r;
      }
      console.log("could not allocate reward to " + asset);
      return null;
    } catch (e) {
      console.log(e);
      return null;
    }
  }, Object.entries(rewards))).then((a) => a.filter((o) => o !== null));
  allocations.forEach((o) => {
    Object.entries(o).forEach(([addr, v]) => {
      state.balances[addr] ? state.balances[addr] += v : state.balances[addr] = v;
    });
  });
  state.stamps = (0, import_map2.default)((0, import_assoc2.default)("flagged", true), state.stamps);
  return { state };
}
async function stamp(state, action) {
  const caller = action.caller;
  const stamps = state.stamps;
  const transactionId = action.input.transactionId;
  ContractAssert(transactionId, "transactionId is required!");
  if (stamps[`${caller}:${transactionId}`]) {
    throw new ContractError("Already Stamped Asset!");
  }
  // this is commented out for testing purposes!
  //   const vouchServices = Object.keys(await verified(state, action));
  //   const query = `
  //  query {
  //   transactions(owners: [${vouchServices.map((s) => `"${s}"`)}], tags: {name: "Vouch-For", values: ["${caller}"]}) {
  //     edges {
  //       node {
  //         id
  //         tags {
  //           name
  //           value
  //         }
  //       }
  //     }
  //   }
  //  } 
  //   `;
  //   const result = await SmartWeave.unsafeClient.api.post("graphql", { query });
  //   const edges = result?.data?.data?.transactions?.edges || [];
  //   if (edges.length < 1) {
  //     throw new ContractError("Could not vouch caller!");
  //   }
  //   const node = edges[0].node;
  //   const vouchFor = node.tags.find((t) => t.name === "Vouch-For")?.value;
  // if (vouchFor === caller) {
  state.stamps[`${caller}:${transactionId}`] = {
    timestamp: action.input.timestamp,
    asset: transactionId,
    address: caller,
    flagged: false
  };
  //}
  return { state };
}
function transfer(state, action) {
  const balances = state.balances;
  const input = action.input;
  const caller = action.caller;
  const target = input.target;
  const quantity = input.qty;
  if (!Number.isInteger(quantity) || quantity === void 0) {
    throw new ContractError("Invalid value for quantity. Must be an integer.");
  }
  if (!target) {
    throw new ContractError("No target specified.");
  }
  if (quantity <= 0 || caller === target) {
    throw new ContractError("Invalid token transfer.");
  }
  if (balances[caller] < quantity) {
    throw new ContractError("Caller balance not high enough to send " + quantity + " token(s).");
  }
  balances[caller] -= quantity;
  if (target in balances) {
    balances[target] += quantity;
  } else {
    balances[target] = quantity;
  }
  return { state };
}
function evolve(state, action) {
  if (state.canEvolve) {
    if (state.creator === action.caller) {
      state.evolve = action.input.value;
    }
  }
  return { state };
}
function balance(state, action) {
  const balances = state.balances;
  const input = action.input;
  const caller = action.caller;
  let target;
  if (!input.target) {
    target = caller;
  } else {
    target = input.target;
  }
  const ticker = state.ticker;
  if (typeof target !== "string") {
    throw new ContractError("Must specify target to get balance for.");
  }
  if (typeof balances[target] !== "number") {
    throw new ContractError("Cannot get balance; target does not exist.");
  }
  return {
    result: {
      target,
      ticker,
      balance: balances[target]
    }
  };
}


window.__ModuleLoader__.load({
  id: "dsh-wsr-studio",
  factory: (platformRequire) => {
    const require = platformRequire;
    const module = { exports: {} };
    const exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/studio/src/client/browser-entry.js
var browser_entry_exports = {};
__export(browser_entry_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(browser_entry_exports);
var import_react2 = __toESM(require("react"), 1);
var Primitives = __toESM(require("@deepseek-ai/dsh-client-ui-primitives"), 1);

// node_modules/wsr-ui-core/dist/index.js
var import_jsx_runtime = require("react/jsx-runtime");

// node_modules/d3-array/src/ascending.js
function ascending(a2, b2) {
  return a2 == null || b2 == null ? NaN : a2 < b2 ? -1 : a2 > b2 ? 1 : a2 >= b2 ? 0 : NaN;
}

// node_modules/d3-array/src/descending.js
function descending(a2, b2) {
  return a2 == null || b2 == null ? NaN : b2 < a2 ? -1 : b2 > a2 ? 1 : b2 >= a2 ? 0 : NaN;
}

// node_modules/d3-array/src/bisector.js
function bisector(f) {
  let compare1, compare2, delta;
  if (f.length !== 2) {
    compare1 = ascending;
    compare2 = (d2, x2) => ascending(f(d2), x2);
    delta = (d2, x2) => f(d2) - x2;
  } else {
    compare1 = f === ascending || f === descending ? f : zero;
    compare2 = f;
    delta = f;
  }
  function left(a2, x2, lo = 0, hi = a2.length) {
    if (lo < hi) {
      if (compare1(x2, x2) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a2[mid], x2) < 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function right(a2, x2, lo = 0, hi = a2.length) {
    if (lo < hi) {
      if (compare1(x2, x2) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a2[mid], x2) <= 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function center(a2, x2, lo = 0, hi = a2.length) {
    const i = left(a2, x2, lo, hi - 1);
    return i > lo && delta(a2[i - 1], x2) > -delta(a2[i], x2) ? i - 1 : i;
  }
  return { left, center, right };
}
function zero() {
  return 0;
}

// node_modules/d3-array/src/number.js
function number(x2) {
  return x2 === null ? NaN : +x2;
}

// node_modules/d3-array/src/bisect.js
var ascendingBisect = bisector(ascending);
var bisectRight = ascendingBisect.right;
var bisectLeft = ascendingBisect.left;
var bisectCenter = bisector(number).center;
var bisect_default = bisectRight;

// node_modules/internmap/src/index.js
var InternMap = class extends Map {
  constructor(entries, key = keyof) {
    super();
    Object.defineProperties(this, { _intern: { value: /* @__PURE__ */ new Map() }, _key: { value: key } });
    if (entries != null) for (const [key2, value] of entries) this.set(key2, value);
  }
  get(key) {
    return super.get(intern_get(this, key));
  }
  has(key) {
    return super.has(intern_get(this, key));
  }
  set(key, value) {
    return super.set(intern_set(this, key), value);
  }
  delete(key) {
    return super.delete(intern_delete(this, key));
  }
};
function intern_get({ _intern, _key }, value) {
  const key = _key(value);
  return _intern.has(key) ? _intern.get(key) : value;
}
function intern_set({ _intern, _key }, value) {
  const key = _key(value);
  if (_intern.has(key)) return _intern.get(key);
  _intern.set(key, value);
  return value;
}
function intern_delete({ _intern, _key }, value) {
  const key = _key(value);
  if (_intern.has(key)) {
    value = _intern.get(key);
    _intern.delete(key);
  }
  return value;
}
function keyof(value) {
  return value !== null && typeof value === "object" ? value.valueOf() : value;
}

// node_modules/d3-array/src/ticks.js
var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e2 = Math.sqrt(2);
function tickSpec(start2, stop, count) {
  const step = (stop - start2) / Math.max(0, count), power = Math.floor(Math.log10(step)), error = step / Math.pow(10, power), factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
  let i1, i2, inc;
  if (power < 0) {
    inc = Math.pow(10, -power) / factor;
    i1 = Math.round(start2 * inc);
    i2 = Math.round(stop * inc);
    if (i1 / inc < start2) ++i1;
    if (i2 / inc > stop) --i2;
    inc = -inc;
  } else {
    inc = Math.pow(10, power) * factor;
    i1 = Math.round(start2 / inc);
    i2 = Math.round(stop / inc);
    if (i1 * inc < start2) ++i1;
    if (i2 * inc > stop) --i2;
  }
  if (i2 < i1 && 0.5 <= count && count < 2) return tickSpec(start2, stop, count * 2);
  return [i1, i2, inc];
}
function ticks(start2, stop, count) {
  stop = +stop, start2 = +start2, count = +count;
  if (!(count > 0)) return [];
  if (start2 === stop) return [start2];
  const reverse = stop < start2, [i1, i2, inc] = reverse ? tickSpec(stop, start2, count) : tickSpec(start2, stop, count);
  if (!(i2 >= i1)) return [];
  const n2 = i2 - i1 + 1, ticks2 = new Array(n2);
  if (reverse) {
    if (inc < 0) for (let i = 0; i < n2; ++i) ticks2[i] = (i2 - i) / -inc;
    else for (let i = 0; i < n2; ++i) ticks2[i] = (i2 - i) * inc;
  } else {
    if (inc < 0) for (let i = 0; i < n2; ++i) ticks2[i] = (i1 + i) / -inc;
    else for (let i = 0; i < n2; ++i) ticks2[i] = (i1 + i) * inc;
  }
  return ticks2;
}
function tickIncrement(start2, stop, count) {
  stop = +stop, start2 = +start2, count = +count;
  return tickSpec(start2, stop, count)[2];
}
function tickStep(start2, stop, count) {
  stop = +stop, start2 = +start2, count = +count;
  const reverse = stop < start2, inc = reverse ? tickIncrement(stop, start2, count) : tickIncrement(start2, stop, count);
  return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
}

// node_modules/d3-array/src/range.js
function range(start2, stop, step) {
  start2 = +start2, stop = +stop, step = (n2 = arguments.length) < 2 ? (stop = start2, start2 = 0, 1) : n2 < 3 ? 1 : +step;
  var i = -1, n2 = Math.max(0, Math.ceil((stop - start2) / step)) | 0, range2 = new Array(n2);
  while (++i < n2) {
    range2[i] = start2 + i * step;
  }
  return range2;
}

// node_modules/d3-dispatch/src/dispatch.js
var noop = { value: () => {
} };
function dispatch() {
  for (var i = 0, n2 = arguments.length, _2 = {}, t2; i < n2; ++i) {
    if (!(t2 = arguments[i] + "") || t2 in _2 || /[\s.]/.test(t2)) throw new Error("illegal type: " + t2);
    _2[t2] = [];
  }
  return new Dispatch(_2);
}
function Dispatch(_2) {
  this._ = _2;
}
function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t2) {
    var name2 = "", i = t2.indexOf(".");
    if (i >= 0) name2 = t2.slice(i + 1), t2 = t2.slice(0, i);
    if (t2 && !types.hasOwnProperty(t2)) throw new Error("unknown type: " + t2);
    return { type: t2, name: name2 };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _2 = this._, T = parseTypenames(typename + "", _2), t2, i = -1, n2 = T.length;
    if (arguments.length < 2) {
      while (++i < n2) if ((t2 = (typename = T[i]).type) && (t2 = get(_2[t2], typename.name))) return t2;
      return;
    }
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n2) {
      if (t2 = (typename = T[i]).type) _2[t2] = set(_2[t2], typename.name, callback);
      else if (callback == null) for (t2 in _2) _2[t2] = set(_2[t2], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy2 = {}, _2 = this._;
    for (var t2 in _2) copy2[t2] = _2[t2].slice();
    return new Dispatch(copy2);
  },
  call: function(type2, that) {
    if ((n2 = arguments.length - 2) > 0) for (var args = new Array(n2), i = 0, n2, t2; i < n2; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type2)) throw new Error("unknown type: " + type2);
    for (t2 = this._[type2], i = 0, n2 = t2.length; i < n2; ++i) t2[i].value.apply(that, args);
  },
  apply: function(type2, that, args) {
    if (!this._.hasOwnProperty(type2)) throw new Error("unknown type: " + type2);
    for (var t2 = this._[type2], i = 0, n2 = t2.length; i < n2; ++i) t2[i].value.apply(that, args);
  }
};
function get(type2, name2) {
  for (var i = 0, n2 = type2.length, c2; i < n2; ++i) {
    if ((c2 = type2[i]).name === name2) {
      return c2.value;
    }
  }
}
function set(type2, name2, callback) {
  for (var i = 0, n2 = type2.length; i < n2; ++i) {
    if (type2[i].name === name2) {
      type2[i] = noop, type2 = type2.slice(0, i).concat(type2.slice(i + 1));
      break;
    }
  }
  if (callback != null) type2.push({ name: name2, value: callback });
  return type2;
}
var dispatch_default = dispatch;

// node_modules/d3-selection/src/namespaces.js
var xhtml = "http://www.w3.org/1999/xhtml";
var namespaces_default = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

// node_modules/d3-selection/src/namespace.js
function namespace_default(name2) {
  var prefix = name2 += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name2.slice(0, i)) !== "xmlns") name2 = name2.slice(i + 1);
  return namespaces_default.hasOwnProperty(prefix) ? { space: namespaces_default[prefix], local: name2 } : name2;
}

// node_modules/d3-selection/src/creator.js
function creatorInherit(name2) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name2) : document2.createElementNS(uri, name2);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator_default(name2) {
  var fullname = namespace_default(name2);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}

// node_modules/d3-selection/src/selector.js
function none() {
}
function selector_default(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
}

// node_modules/d3-selection/src/selection/select.js
function select_default(select) {
  if (typeof select !== "function") select = selector_default(select);
  for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j2 = 0; j2 < m2; ++j2) {
    for (var group = groups[j2], n2 = group.length, subgroup = subgroups[j2] = new Array(n2), node, subnode, i = 0; i < n2; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection(subgroups, this._parents);
}

// node_modules/d3-selection/src/array.js
function array(x2) {
  return x2 == null ? [] : Array.isArray(x2) ? x2 : Array.from(x2);
}

// node_modules/d3-selection/src/selectorAll.js
function empty() {
  return [];
}
function selectorAll_default(selector) {
  return selector == null ? empty : function() {
    return this.querySelectorAll(selector);
  };
}

// node_modules/d3-selection/src/selection/selectAll.js
function arrayAll(select) {
  return function() {
    return array(select.apply(this, arguments));
  };
}
function selectAll_default(select) {
  if (typeof select === "function") select = arrayAll(select);
  else select = selectorAll_default(select);
  for (var groups = this._groups, m2 = groups.length, subgroups = [], parents = [], j2 = 0; j2 < m2; ++j2) {
    for (var group = groups[j2], n2 = group.length, node, i = 0; i < n2; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection(subgroups, parents);
}

// node_modules/d3-selection/src/matcher.js
function matcher_default(selector) {
  return function() {
    return this.matches(selector);
  };
}
function childMatcher(selector) {
  return function(node) {
    return node.matches(selector);
  };
}

// node_modules/d3-selection/src/selection/selectChild.js
var find = Array.prototype.find;
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selectChild_default(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}

// node_modules/d3-selection/src/selection/selectChildren.js
var filter = Array.prototype.filter;
function children() {
  return Array.from(this.children);
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selectChildren_default(match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}

// node_modules/d3-selection/src/selection/filter.js
function filter_default(match) {
  if (typeof match !== "function") match = matcher_default(match);
  for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j2 = 0; j2 < m2; ++j2) {
    for (var group = groups[j2], n2 = group.length, subgroup = subgroups[j2] = [], node, i = 0; i < n2; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection(subgroups, this._parents);
}

// node_modules/d3-selection/src/selection/sparse.js
function sparse_default(update) {
  return new Array(update.length);
}

// node_modules/d3-selection/src/selection/enter.js
function enter_default() {
  return new Selection(this._enter || this._groups.map(sparse_default), this._parents);
}
function EnterNode(parent, datum2) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum2;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector) {
    return this._parent.querySelector(selector);
  },
  querySelectorAll: function(selector) {
    return this._parent.querySelectorAll(selector);
  }
};

// node_modules/d3-selection/src/constant.js
function constant_default(x2) {
  return function() {
    return x2;
  };
}

// node_modules/d3-selection/src/selection/data.js
function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0, node, groupLength = group.length, dataLength = data.length;
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function data_default(value, key) {
  if (!arguments.length) return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
  if (typeof value !== "function") value = constant_default(value);
  for (var m2 = groups.length, update = new Array(m2), enter = new Array(m2), exit = new Array(m2), j2 = 0; j2 < m2; ++j2) {
    var parent = parents[j2], group = groups[j2], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j2, parents)), dataLength = data.length, enterGroup = enter[j2] = new Array(dataLength), updateGroup = update[j2] = new Array(dataLength), exitGroup = exit[j2] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength) ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
function arraylike(data) {
  return typeof data === "object" && "length" in data ? data : Array.from(data);
}

// node_modules/d3-selection/src/selection/exit.js
function exit_default() {
  return new Selection(this._exit || this._groups.map(sparse_default), this._parents);
}

// node_modules/d3-selection/src/selection/join.js
function join_default(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter) enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update) update = update.selection();
  }
  if (onexit == null) exit.remove();
  else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}

// node_modules/d3-selection/src/selection/merge.js
function merge_default(context) {
  var selection2 = context.selection ? context.selection() : context;
  for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m2 = Math.min(m0, m1), merges = new Array(m0), j2 = 0; j2 < m2; ++j2) {
    for (var group0 = groups0[j2], group1 = groups1[j2], n2 = group0.length, merge = merges[j2] = new Array(n2), node, i = 0; i < n2; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j2 < m0; ++j2) {
    merges[j2] = groups0[j2];
  }
  return new Selection(merges, this._parents);
}

// node_modules/d3-selection/src/selection/order.js
function order_default() {
  for (var groups = this._groups, j2 = -1, m2 = groups.length; ++j2 < m2; ) {
    for (var group = groups[j2], i = group.length - 1, next = group[i], node; --i >= 0; ) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}

// node_modules/d3-selection/src/selection/sort.js
function sort_default(compare) {
  if (!compare) compare = ascending2;
  function compareNode(a2, b2) {
    return a2 && b2 ? compare(a2.__data__, b2.__data__) : !a2 - !b2;
  }
  for (var groups = this._groups, m2 = groups.length, sortgroups = new Array(m2), j2 = 0; j2 < m2; ++j2) {
    for (var group = groups[j2], n2 = group.length, sortgroup = sortgroups[j2] = new Array(n2), node, i = 0; i < n2; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection(sortgroups, this._parents).order();
}
function ascending2(a2, b2) {
  return a2 < b2 ? -1 : a2 > b2 ? 1 : a2 >= b2 ? 0 : NaN;
}

// node_modules/d3-selection/src/selection/call.js
function call_default() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}

// node_modules/d3-selection/src/selection/nodes.js
function nodes_default() {
  return Array.from(this);
}

// node_modules/d3-selection/src/selection/node.js
function node_default() {
  for (var groups = this._groups, j2 = 0, m2 = groups.length; j2 < m2; ++j2) {
    for (var group = groups[j2], i = 0, n2 = group.length; i < n2; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }
  return null;
}

// node_modules/d3-selection/src/selection/size.js
function size_default() {
  let size = 0;
  for (const node of this) ++size;
  return size;
}

// node_modules/d3-selection/src/selection/empty.js
function empty_default() {
  return !this.node();
}

// node_modules/d3-selection/src/selection/each.js
function each_default(callback) {
  for (var groups = this._groups, j2 = 0, m2 = groups.length; j2 < m2; ++j2) {
    for (var group = groups[j2], i = 0, n2 = group.length, node; i < n2; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}

// node_modules/d3-selection/src/selection/attr.js
function attrRemove(name2) {
  return function() {
    this.removeAttribute(name2);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name2, value) {
  return function() {
    this.setAttribute(name2, value);
  };
}
function attrConstantNS(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction(name2, value) {
  return function() {
    var v2 = value.apply(this, arguments);
    if (v2 == null) this.removeAttribute(name2);
    else this.setAttribute(name2, v2);
  };
}
function attrFunctionNS(fullname, value) {
  return function() {
    var v2 = value.apply(this, arguments);
    if (v2 == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v2);
  };
}
function attr_default(name2, value) {
  var fullname = namespace_default(name2);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
}

// node_modules/d3-selection/src/window.js
function window_default(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}

// node_modules/d3-selection/src/selection/style.js
function styleRemove(name2) {
  return function() {
    this.style.removeProperty(name2);
  };
}
function styleConstant(name2, value, priority) {
  return function() {
    this.style.setProperty(name2, value, priority);
  };
}
function styleFunction(name2, value, priority) {
  return function() {
    var v2 = value.apply(this, arguments);
    if (v2 == null) this.style.removeProperty(name2);
    else this.style.setProperty(name2, v2, priority);
  };
}
function style_default(name2, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name2, value, priority == null ? "" : priority)) : styleValue(this.node(), name2);
}
function styleValue(node, name2) {
  return node.style.getPropertyValue(name2) || window_default(node).getComputedStyle(node, null).getPropertyValue(name2);
}

// node_modules/d3-selection/src/selection/property.js
function propertyRemove(name2) {
  return function() {
    delete this[name2];
  };
}
function propertyConstant(name2, value) {
  return function() {
    this[name2] = value;
  };
}
function propertyFunction(name2, value) {
  return function() {
    var v2 = value.apply(this, arguments);
    if (v2 == null) delete this[name2];
    else this[name2] = v2;
  };
}
function property_default(name2, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name2, value)) : this.node()[name2];
}

// node_modules/d3-selection/src/selection/classed.js
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name2) {
    var i = this._names.indexOf(name2);
    if (i < 0) {
      this._names.push(name2);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name2) {
    var i = this._names.indexOf(name2);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name2) {
    return this._names.indexOf(name2) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n2 = names.length;
  while (++i < n2) list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n2 = names.length;
  while (++i < n2) list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function classed_default(name2, value) {
  var names = classArray(name2 + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n2 = names.length;
    while (++i < n2) if (!list.contains(names[i])) return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}

// node_modules/d3-selection/src/selection/text.js
function textRemove() {
  this.textContent = "";
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var v2 = value.apply(this, arguments);
    this.textContent = v2 == null ? "" : v2;
  };
}
function text_default(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
}

// node_modules/d3-selection/src/selection/html.js
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v2 = value.apply(this, arguments);
    this.innerHTML = v2 == null ? "" : v2;
  };
}
function html_default(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}

// node_modules/d3-selection/src/selection/raise.js
function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}
function raise_default() {
  return this.each(raise);
}

// node_modules/d3-selection/src/selection/lower.js
function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function lower_default() {
  return this.each(lower);
}

// node_modules/d3-selection/src/selection/append.js
function append_default(name2) {
  var create2 = typeof name2 === "function" ? name2 : creator_default(name2);
  return this.select(function() {
    return this.appendChild(create2.apply(this, arguments));
  });
}

// node_modules/d3-selection/src/selection/insert.js
function constantNull() {
  return null;
}
function insert_default(name2, before) {
  var create2 = typeof name2 === "function" ? name2 : creator_default(name2), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
  return this.select(function() {
    return this.insertBefore(create2.apply(this, arguments), select.apply(this, arguments) || null);
  });
}

// node_modules/d3-selection/src/selection/remove.js
function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}
function remove_default() {
  return this.each(remove);
}

// node_modules/d3-selection/src/selection/clone.js
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function clone_default(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}

// node_modules/d3-selection/src/selection/datum.js
function datum_default(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}

// node_modules/d3-selection/src/selection/on.js
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames2(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t2) {
    var name2 = "", i = t2.indexOf(".");
    if (i >= 0) name2 = t2.slice(i + 1), t2 = t2.slice(0, i);
    return { type: t2, name: name2 };
  });
}
function onRemove(typename) {
  return function() {
    var on2 = this.__on;
    if (!on2) return;
    for (var j2 = 0, i = -1, m2 = on2.length, o2; j2 < m2; ++j2) {
      if (o2 = on2[j2], (!typename.type || o2.type === typename.type) && o2.name === typename.name) {
        this.removeEventListener(o2.type, o2.listener, o2.options);
      } else {
        on2[++i] = o2;
      }
    }
    if (++i) on2.length = i;
    else delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on2 = this.__on, o2, listener = contextListener(value);
    if (on2) for (var j2 = 0, m2 = on2.length; j2 < m2; ++j2) {
      if ((o2 = on2[j2]).type === typename.type && o2.name === typename.name) {
        this.removeEventListener(o2.type, o2.listener, o2.options);
        this.addEventListener(o2.type, o2.listener = listener, o2.options = options);
        o2.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, options);
    o2 = { type: typename.type, name: typename.name, value, listener, options };
    if (!on2) this.__on = [o2];
    else on2.push(o2);
  };
}
function on_default(typename, value, options) {
  var typenames = parseTypenames2(typename + ""), i, n2 = typenames.length, t2;
  if (arguments.length < 2) {
    var on2 = this.node().__on;
    if (on2) for (var j2 = 0, m2 = on2.length, o2; j2 < m2; ++j2) {
      for (i = 0, o2 = on2[j2]; i < n2; ++i) {
        if ((t2 = typenames[i]).type === o2.type && t2.name === o2.name) {
          return o2.value;
        }
      }
    }
    return;
  }
  on2 = value ? onAdd : onRemove;
  for (i = 0; i < n2; ++i) this.each(on2(typenames[i], value, options));
  return this;
}

// node_modules/d3-selection/src/selection/dispatch.js
function dispatchEvent(node, type2, params) {
  var window2 = window_default(node), event = window2.CustomEvent;
  if (typeof event === "function") {
    event = new event(type2, params);
  } else {
    event = window2.document.createEvent("Event");
    if (params) event.initEvent(type2, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type2, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type2, params) {
  return function() {
    return dispatchEvent(this, type2, params);
  };
}
function dispatchFunction(type2, params) {
  return function() {
    return dispatchEvent(this, type2, params.apply(this, arguments));
  };
}
function dispatch_default2(type2, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type2, params));
}

// node_modules/d3-selection/src/selection/iterator.js
function* iterator_default() {
  for (var groups = this._groups, j2 = 0, m2 = groups.length; j2 < m2; ++j2) {
    for (var group = groups[j2], i = 0, n2 = group.length, node; i < n2; ++i) {
      if (node = group[i]) yield node;
    }
  }
}

// node_modules/d3-selection/src/selection/index.js
var root = [null];
function Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection() {
  return new Selection([[document.documentElement]], root);
}
function selection_selection() {
  return this;
}
Selection.prototype = selection.prototype = {
  constructor: Selection,
  select: select_default,
  selectAll: selectAll_default,
  selectChild: selectChild_default,
  selectChildren: selectChildren_default,
  filter: filter_default,
  data: data_default,
  enter: enter_default,
  exit: exit_default,
  join: join_default,
  merge: merge_default,
  selection: selection_selection,
  order: order_default,
  sort: sort_default,
  call: call_default,
  nodes: nodes_default,
  node: node_default,
  size: size_default,
  empty: empty_default,
  each: each_default,
  attr: attr_default,
  style: style_default,
  property: property_default,
  classed: classed_default,
  text: text_default,
  html: html_default,
  raise: raise_default,
  lower: lower_default,
  append: append_default,
  insert: insert_default,
  remove: remove_default,
  clone: clone_default,
  datum: datum_default,
  on: on_default,
  dispatch: dispatch_default2,
  [Symbol.iterator]: iterator_default
};
var selection_default = selection;

// node_modules/d3-color/src/define.js
function define_default(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

// node_modules/d3-color/src/color.js
function Color() {
}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*";
var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
var reHex = /^#([0-9a-f]{3,8})$/;
var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define_default(Color, color, {
  copy(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format2) {
  var m2, l2;
  format2 = (format2 + "").trim().toLowerCase();
  return (m2 = reHex.exec(format2)) ? (l2 = m2[1].length, m2 = parseInt(m2[1], 16), l2 === 6 ? rgbn(m2) : l2 === 3 ? new Rgb(m2 >> 8 & 15 | m2 >> 4 & 240, m2 >> 4 & 15 | m2 & 240, (m2 & 15) << 4 | m2 & 15, 1) : l2 === 8 ? rgba(m2 >> 24 & 255, m2 >> 16 & 255, m2 >> 8 & 255, (m2 & 255) / 255) : l2 === 4 ? rgba(m2 >> 12 & 15 | m2 >> 8 & 240, m2 >> 8 & 15 | m2 >> 4 & 240, m2 >> 4 & 15 | m2 & 240, ((m2 & 15) << 4 | m2 & 15) / 255) : null) : (m2 = reRgbInteger.exec(format2)) ? new Rgb(m2[1], m2[2], m2[3], 1) : (m2 = reRgbPercent.exec(format2)) ? new Rgb(m2[1] * 255 / 100, m2[2] * 255 / 100, m2[3] * 255 / 100, 1) : (m2 = reRgbaInteger.exec(format2)) ? rgba(m2[1], m2[2], m2[3], m2[4]) : (m2 = reRgbaPercent.exec(format2)) ? rgba(m2[1] * 255 / 100, m2[2] * 255 / 100, m2[3] * 255 / 100, m2[4]) : (m2 = reHslPercent.exec(format2)) ? hsla(m2[1], m2[2] / 100, m2[3] / 100, 1) : (m2 = reHslaPercent.exec(format2)) ? hsla(m2[1], m2[2] / 100, m2[3] / 100, m2[4]) : named.hasOwnProperty(format2) ? rgbn(named[format2]) : format2 === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n2) {
  return new Rgb(n2 >> 16 & 255, n2 >> 8 & 255, n2 & 255, 1);
}
function rgba(r, g2, b2, a2) {
  if (a2 <= 0) r = g2 = b2 = NaN;
  return new Rgb(r, g2, b2, a2);
}
function rgbConvert(o2) {
  if (!(o2 instanceof Color)) o2 = color(o2);
  if (!o2) return new Rgb();
  o2 = o2.rgb();
  return new Rgb(o2.r, o2.g, o2.b, o2.opacity);
}
function rgb(r, g2, b2, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g2, b2, opacity == null ? 1 : opacity);
}
function Rgb(r, g2, b2, opacity) {
  this.r = +r;
  this.g = +g2;
  this.b = +b2;
  this.opacity = +opacity;
}
define_default(Rgb, rgb, extend(Color, {
  brighter(k2) {
    k2 = k2 == null ? brighter : Math.pow(brighter, k2);
    return new Rgb(this.r * k2, this.g * k2, this.b * k2, this.opacity);
  },
  darker(k2) {
    k2 = k2 == null ? darker : Math.pow(darker, k2);
    return new Rgb(this.r * k2, this.g * k2, this.b * k2, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a2 = clampa(this.opacity);
  return `${a2 === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a2 === 1 ? ")" : `, ${a2})`}`;
}
function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h2, s2, l2, a2) {
  if (a2 <= 0) h2 = s2 = l2 = NaN;
  else if (l2 <= 0 || l2 >= 1) h2 = s2 = NaN;
  else if (s2 <= 0) h2 = NaN;
  return new Hsl(h2, s2, l2, a2);
}
function hslConvert(o2) {
  if (o2 instanceof Hsl) return new Hsl(o2.h, o2.s, o2.l, o2.opacity);
  if (!(o2 instanceof Color)) o2 = color(o2);
  if (!o2) return new Hsl();
  if (o2 instanceof Hsl) return o2;
  o2 = o2.rgb();
  var r = o2.r / 255, g2 = o2.g / 255, b2 = o2.b / 255, min2 = Math.min(r, g2, b2), max2 = Math.max(r, g2, b2), h2 = NaN, s2 = max2 - min2, l2 = (max2 + min2) / 2;
  if (s2) {
    if (r === max2) h2 = (g2 - b2) / s2 + (g2 < b2) * 6;
    else if (g2 === max2) h2 = (b2 - r) / s2 + 2;
    else h2 = (r - g2) / s2 + 4;
    s2 /= l2 < 0.5 ? max2 + min2 : 2 - max2 - min2;
    h2 *= 60;
  } else {
    s2 = l2 > 0 && l2 < 1 ? 0 : h2;
  }
  return new Hsl(h2, s2, l2, o2.opacity);
}
function hsl(h2, s2, l2, opacity) {
  return arguments.length === 1 ? hslConvert(h2) : new Hsl(h2, s2, l2, opacity == null ? 1 : opacity);
}
function Hsl(h2, s2, l2, opacity) {
  this.h = +h2;
  this.s = +s2;
  this.l = +l2;
  this.opacity = +opacity;
}
define_default(Hsl, hsl, extend(Color, {
  brighter(k2) {
    k2 = k2 == null ? brighter : Math.pow(brighter, k2);
    return new Hsl(this.h, this.s, this.l * k2, this.opacity);
  },
  darker(k2) {
    k2 = k2 == null ? darker : Math.pow(darker, k2);
    return new Hsl(this.h, this.s, this.l * k2, this.opacity);
  },
  rgb() {
    var h2 = this.h % 360 + (this.h < 0) * 360, s2 = isNaN(h2) || isNaN(this.s) ? 0 : this.s, l2 = this.l, m2 = l2 + (l2 < 0.5 ? l2 : 1 - l2) * s2, m1 = 2 * l2 - m2;
    return new Rgb(
      hsl2rgb(h2 >= 240 ? h2 - 240 : h2 + 120, m1, m2),
      hsl2rgb(h2, m1, m2),
      hsl2rgb(h2 < 120 ? h2 + 240 : h2 - 120, m1, m2),
      this.opacity
    );
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a2 = clampa(this.opacity);
    return `${a2 === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a2 === 1 ? ")" : `, ${a2})`}`;
  }
}));
function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}
function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h2, m1, m2) {
  return (h2 < 60 ? m1 + (m2 - m1) * h2 / 60 : h2 < 180 ? m2 : h2 < 240 ? m1 + (m2 - m1) * (240 - h2) / 60 : m1) * 255;
}

// node_modules/d3-interpolate/src/basis.js
function basis(t1, v0, v1, v2, v3) {
  var t2 = t1 * t1, t3 = t2 * t1;
  return ((1 - 3 * t1 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
}
function basis_default(values) {
  var n2 = values.length - 1;
  return function(t2) {
    var i = t2 <= 0 ? t2 = 0 : t2 >= 1 ? (t2 = 1, n2 - 1) : Math.floor(t2 * n2), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n2 - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t2 - i / n2) * n2, v0, v1, v2, v3);
  };
}

// node_modules/d3-interpolate/src/basisClosed.js
function basisClosed_default(values) {
  var n2 = values.length;
  return function(t2) {
    var i = Math.floor(((t2 %= 1) < 0 ? ++t2 : t2) * n2), v0 = values[(i + n2 - 1) % n2], v1 = values[i % n2], v2 = values[(i + 1) % n2], v3 = values[(i + 2) % n2];
    return basis((t2 - i / n2) * n2, v0, v1, v2, v3);
  };
}

// node_modules/d3-interpolate/src/constant.js
var constant_default2 = (x2) => () => x2;

// node_modules/d3-interpolate/src/color.js
function linear(a2, d2) {
  return function(t2) {
    return a2 + t2 * d2;
  };
}
function exponential(a2, b2, y) {
  return a2 = Math.pow(a2, y), b2 = Math.pow(b2, y) - a2, y = 1 / y, function(t2) {
    return Math.pow(a2 + t2 * b2, y);
  };
}
function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a2, b2) {
    return b2 - a2 ? exponential(a2, b2, y) : constant_default2(isNaN(a2) ? b2 : a2);
  };
}
function nogamma(a2, b2) {
  var d2 = b2 - a2;
  return d2 ? linear(a2, d2) : constant_default2(isNaN(a2) ? b2 : a2);
}

// node_modules/d3-interpolate/src/rgb.js
var rgb_default = (function rgbGamma(y) {
  var color2 = gamma(y);
  function rgb2(start2, end) {
    var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g2 = color2(start2.g, end.g), b2 = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
    return function(t2) {
      start2.r = r(t2);
      start2.g = g2(t2);
      start2.b = b2(t2);
      start2.opacity = opacity(t2);
      return start2 + "";
    };
  }
  rgb2.gamma = rgbGamma;
  return rgb2;
})(1);
function rgbSpline(spline) {
  return function(colors) {
    var n2 = colors.length, r = new Array(n2), g2 = new Array(n2), b2 = new Array(n2), i, color2;
    for (i = 0; i < n2; ++i) {
      color2 = rgb(colors[i]);
      r[i] = color2.r || 0;
      g2[i] = color2.g || 0;
      b2[i] = color2.b || 0;
    }
    r = spline(r);
    g2 = spline(g2);
    b2 = spline(b2);
    color2.opacity = 1;
    return function(t2) {
      color2.r = r(t2);
      color2.g = g2(t2);
      color2.b = b2(t2);
      return color2 + "";
    };
  };
}
var rgbBasis = rgbSpline(basis_default);
var rgbBasisClosed = rgbSpline(basisClosed_default);

// node_modules/d3-interpolate/src/numberArray.js
function numberArray_default(a2, b2) {
  if (!b2) b2 = [];
  var n2 = a2 ? Math.min(b2.length, a2.length) : 0, c2 = b2.slice(), i;
  return function(t2) {
    for (i = 0; i < n2; ++i) c2[i] = a2[i] * (1 - t2) + b2[i] * t2;
    return c2;
  };
}
function isNumberArray(x2) {
  return ArrayBuffer.isView(x2) && !(x2 instanceof DataView);
}

// node_modules/d3-interpolate/src/array.js
function genericArray(a2, b2) {
  var nb = b2 ? b2.length : 0, na = a2 ? Math.min(nb, a2.length) : 0, x2 = new Array(na), c2 = new Array(nb), i;
  for (i = 0; i < na; ++i) x2[i] = value_default(a2[i], b2[i]);
  for (; i < nb; ++i) c2[i] = b2[i];
  return function(t2) {
    for (i = 0; i < na; ++i) c2[i] = x2[i](t2);
    return c2;
  };
}

// node_modules/d3-interpolate/src/date.js
function date_default(a2, b2) {
  var d2 = /* @__PURE__ */ new Date();
  return a2 = +a2, b2 = +b2, function(t2) {
    return d2.setTime(a2 * (1 - t2) + b2 * t2), d2;
  };
}

// node_modules/d3-interpolate/src/number.js
function number_default(a2, b2) {
  return a2 = +a2, b2 = +b2, function(t2) {
    return a2 * (1 - t2) + b2 * t2;
  };
}

// node_modules/d3-interpolate/src/object.js
function object_default(a2, b2) {
  var i = {}, c2 = {}, k2;
  if (a2 === null || typeof a2 !== "object") a2 = {};
  if (b2 === null || typeof b2 !== "object") b2 = {};
  for (k2 in b2) {
    if (k2 in a2) {
      i[k2] = value_default(a2[k2], b2[k2]);
    } else {
      c2[k2] = b2[k2];
    }
  }
  return function(t2) {
    for (k2 in i) c2[k2] = i[k2](t2);
    return c2;
  };
}

// node_modules/d3-interpolate/src/string.js
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
var reB = new RegExp(reA.source, "g");
function zero2(b2) {
  return function() {
    return b2;
  };
}
function one(b2) {
  return function(t2) {
    return b2(t2) + "";
  };
}
function string_default(a2, b2) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s2 = [], q2 = [];
  a2 = a2 + "", b2 = b2 + "";
  while ((am = reA.exec(a2)) && (bm = reB.exec(b2))) {
    if ((bs = bm.index) > bi) {
      bs = b2.slice(bi, bs);
      if (s2[i]) s2[i] += bs;
      else s2[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s2[i]) s2[i] += bm;
      else s2[++i] = bm;
    } else {
      s2[++i] = null;
      q2.push({ i, x: number_default(am, bm) });
    }
    bi = reB.lastIndex;
  }
  if (bi < b2.length) {
    bs = b2.slice(bi);
    if (s2[i]) s2[i] += bs;
    else s2[++i] = bs;
  }
  return s2.length < 2 ? q2[0] ? one(q2[0].x) : zero2(b2) : (b2 = q2.length, function(t2) {
    for (var i2 = 0, o2; i2 < b2; ++i2) s2[(o2 = q2[i2]).i] = o2.x(t2);
    return s2.join("");
  });
}

// node_modules/d3-interpolate/src/value.js
function value_default(a2, b2) {
  var t2 = typeof b2, c2;
  return b2 == null || t2 === "boolean" ? constant_default2(b2) : (t2 === "number" ? number_default : t2 === "string" ? (c2 = color(b2)) ? (b2 = c2, rgb_default) : string_default : b2 instanceof color ? rgb_default : b2 instanceof Date ? date_default : isNumberArray(b2) ? numberArray_default : Array.isArray(b2) ? genericArray : typeof b2.valueOf !== "function" && typeof b2.toString !== "function" || isNaN(b2) ? object_default : number_default)(a2, b2);
}

// node_modules/d3-interpolate/src/round.js
function round_default(a2, b2) {
  return a2 = +a2, b2 = +b2, function(t2) {
    return Math.round(a2 * (1 - t2) + b2 * t2);
  };
}

// node_modules/d3-interpolate/src/transform/decompose.js
var degrees = 180 / Math.PI;
var identity = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose_default(a2, b2, c2, d2, e3, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a2 * a2 + b2 * b2)) a2 /= scaleX, b2 /= scaleX;
  if (skewX = a2 * c2 + b2 * d2) c2 -= a2 * skewX, d2 -= b2 * skewX;
  if (scaleY = Math.sqrt(c2 * c2 + d2 * d2)) c2 /= scaleY, d2 /= scaleY, skewX /= scaleY;
  if (a2 * d2 < b2 * c2) a2 = -a2, b2 = -b2, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e3,
    translateY: f,
    rotate: Math.atan2(b2, a2) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX,
    scaleY
  };
}

// node_modules/d3-interpolate/src/transform/parse.js
var svgNode;
function parseCss(value) {
  const m2 = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m2.isIdentity ? identity : decompose_default(m2.a, m2.b, m2.c, m2.d, m2.e, m2.f);
}
function parseSvg(value) {
  if (value == null) return identity;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
  value = value.matrix;
  return decompose_default(value.a, value.b, value.c, value.d, value.e, value.f);
}

// node_modules/d3-interpolate/src/transform/index.js
function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s2) {
    return s2.length ? s2.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s2, q2) {
    if (xa !== xb || ya !== yb) {
      var i = s2.push("translate(", null, pxComma, null, pxParen);
      q2.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
    } else if (xb || yb) {
      s2.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a2, b2, s2, q2) {
    if (a2 !== b2) {
      if (a2 - b2 > 180) b2 += 360;
      else if (b2 - a2 > 180) a2 += 360;
      q2.push({ i: s2.push(pop(s2) + "rotate(", null, degParen) - 2, x: number_default(a2, b2) });
    } else if (b2) {
      s2.push(pop(s2) + "rotate(" + b2 + degParen);
    }
  }
  function skewX(a2, b2, s2, q2) {
    if (a2 !== b2) {
      q2.push({ i: s2.push(pop(s2) + "skewX(", null, degParen) - 2, x: number_default(a2, b2) });
    } else if (b2) {
      s2.push(pop(s2) + "skewX(" + b2 + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s2, q2) {
    if (xa !== xb || ya !== yb) {
      var i = s2.push(pop(s2) + "scale(", null, ",", null, ")");
      q2.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s2.push(pop(s2) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a2, b2) {
    var s2 = [], q2 = [];
    a2 = parse(a2), b2 = parse(b2);
    translate(a2.translateX, a2.translateY, b2.translateX, b2.translateY, s2, q2);
    rotate(a2.rotate, b2.rotate, s2, q2);
    skewX(a2.skewX, b2.skewX, s2, q2);
    scale(a2.scaleX, a2.scaleY, b2.scaleX, b2.scaleY, s2, q2);
    a2 = b2 = null;
    return function(t2) {
      var i = -1, n2 = q2.length, o2;
      while (++i < n2) s2[(o2 = q2[i]).i] = o2.x(t2);
      return s2.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

// node_modules/d3-timer/src/timer.js
var frame = 0;
var timeout = 0;
var interval = 0;
var pokeDelay = 1e3;
var taskHead;
var taskTail;
var clockLast = 0;
var clockNow = 0;
var clockSkew = 0;
var clock = typeof performance === "object" && performance.now ? performance : Date;
var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
  setTimeout(f, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;
      else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time) {
  var t2 = new Timer();
  t2.restart(callback, delay, time);
  return t2;
}
function timerFlush() {
  now();
  ++frame;
  var t2 = taskHead, e3;
  while (t2) {
    if ((e3 = clockNow - t2._time) >= 0) t2._call.call(void 0, e3);
    t2 = t2._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now2 = clock.now(), delay = now2 - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now2;
}
function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}
function sleep(time) {
  if (frame) return;
  if (timeout) timeout = clearTimeout(timeout);
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}

// node_modules/d3-timer/src/timeout.js
function timeout_default(callback, delay, time) {
  var t2 = new Timer();
  delay = delay == null ? 0 : +delay;
  t2.restart((elapsed) => {
    t2.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t2;
}

// node_modules/d3-transition/src/transition/schedule.js
var emptyOn = dispatch_default("start", "end", "cancel", "interrupt");
var emptyTween = [];
var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;
function schedule_default(node, name2, id2, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};
  else if (id2 in schedules) return;
  create(node, id2, {
    name: name2,
    index,
    // For context during callback.
    group,
    // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}
function init(node, id2) {
  var schedule = get2(node, id2);
  if (schedule.state > CREATED) throw new Error("too late; already scheduled");
  return schedule;
}
function set2(node, id2) {
  var schedule = get2(node, id2);
  if (schedule.state > STARTED) throw new Error("too late; already running");
  return schedule;
}
function get2(node, id2) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id2])) throw new Error("transition not found");
  return schedule;
}
function create(node, id2, self) {
  var schedules = node.__transition, tween;
  schedules[id2] = self;
  self.timer = timer(schedule, 0, self.time);
  function schedule(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start2, self.delay, self.time);
    if (self.delay <= elapsed) start2(elapsed - self.delay);
  }
  function start2(elapsed) {
    var i, j2, n2, o2;
    if (self.state !== SCHEDULED) return stop();
    for (i in schedules) {
      o2 = schedules[i];
      if (o2.name !== self.name) continue;
      if (o2.state === STARTED) return timeout_default(start2);
      if (o2.state === RUNNING) {
        o2.state = ENDED;
        o2.timer.stop();
        o2.on.call("interrupt", node, node.__data__, o2.index, o2.group);
        delete schedules[i];
      } else if (+i < id2) {
        o2.state = ENDED;
        o2.timer.stop();
        o2.on.call("cancel", node, node.__data__, o2.index, o2.group);
        delete schedules[i];
      }
    }
    timeout_default(function() {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) return;
    self.state = STARTED;
    tween = new Array(n2 = self.tween.length);
    for (i = 0, j2 = -1; i < n2; ++i) {
      if (o2 = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j2] = o2;
      }
    }
    tween.length = j2 + 1;
  }
  function tick(elapsed) {
    var t2 = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1), i = -1, n2 = tween.length;
    while (++i < n2) {
      tween[i].call(node, t2);
    }
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }
  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id2];
    for (var i in schedules) return;
    delete node.__transition;
  }
}

// node_modules/d3-transition/src/interrupt.js
function interrupt_default(node, name2) {
  var schedules = node.__transition, schedule, active, empty2 = true, i;
  if (!schedules) return;
  name2 = name2 == null ? null : name2 + "";
  for (i in schedules) {
    if ((schedule = schedules[i]).name !== name2) {
      empty2 = false;
      continue;
    }
    active = schedule.state > STARTING && schedule.state < ENDING;
    schedule.state = ENDED;
    schedule.timer.stop();
    schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
    delete schedules[i];
  }
  if (empty2) delete node.__transition;
}

// node_modules/d3-transition/src/selection/interrupt.js
function interrupt_default2(name2) {
  return this.each(function() {
    interrupt_default(this, name2);
  });
}

// node_modules/d3-transition/src/transition/tween.js
function tweenRemove(id2, name2) {
  var tween0, tween1;
  return function() {
    var schedule = set2(this, id2), tween = schedule.tween;
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n2 = tween1.length; i < n2; ++i) {
        if (tween1[i].name === name2) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }
    schedule.tween = tween1;
  };
}
function tweenFunction(id2, name2, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error();
  return function() {
    var schedule = set2(this, id2), tween = schedule.tween;
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t2 = { name: name2, value }, i = 0, n2 = tween1.length; i < n2; ++i) {
        if (tween1[i].name === name2) {
          tween1[i] = t2;
          break;
        }
      }
      if (i === n2) tween1.push(t2);
    }
    schedule.tween = tween1;
  };
}
function tween_default(name2, value) {
  var id2 = this._id;
  name2 += "";
  if (arguments.length < 2) {
    var tween = get2(this.node(), id2).tween;
    for (var i = 0, n2 = tween.length, t2; i < n2; ++i) {
      if ((t2 = tween[i]).name === name2) {
        return t2.value;
      }
    }
    return null;
  }
  return this.each((value == null ? tweenRemove : tweenFunction)(id2, name2, value));
}
function tweenValue(transition2, name2, value) {
  var id2 = transition2._id;
  transition2.each(function() {
    var schedule = set2(this, id2);
    (schedule.value || (schedule.value = {}))[name2] = value.apply(this, arguments);
  });
  return function(node) {
    return get2(node, id2).value[name2];
  };
}

// node_modules/d3-transition/src/transition/interpolate.js
function interpolate_default(a2, b2) {
  var c2;
  return (typeof b2 === "number" ? number_default : b2 instanceof color ? rgb_default : (c2 = color(b2)) ? (b2 = c2, rgb_default) : string_default)(a2, b2);
}

// node_modules/d3-transition/src/transition/attr.js
function attrRemove2(name2) {
  return function() {
    this.removeAttribute(name2);
  };
}
function attrRemoveNS2(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant2(name2, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttribute(name2);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function attrConstantNS2(fullname, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function attrFunction2(name2, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttribute(name2);
    string0 = this.getAttribute(name2);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function attrFunctionNS2(fullname, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function attr_default2(name2, value) {
  var fullname = namespace_default(name2), i = fullname === "transform" ? interpolateTransformSvg : interpolate_default;
  return this.attrTween(name2, typeof value === "function" ? (fullname.local ? attrFunctionNS2 : attrFunction2)(fullname, i, tweenValue(this, "attr." + name2, value)) : value == null ? (fullname.local ? attrRemoveNS2 : attrRemove2)(fullname) : (fullname.local ? attrConstantNS2 : attrConstant2)(fullname, i, value));
}

// node_modules/d3-transition/src/transition/attrTween.js
function attrInterpolate(name2, i) {
  return function(t2) {
    this.setAttribute(name2, i.call(this, t2));
  };
}
function attrInterpolateNS(fullname, i) {
  return function(t2) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t2));
  };
}
function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween(name2, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name2, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween_default(name2, value) {
  var key = "attr." + name2;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  var fullname = namespace_default(name2);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}

// node_modules/d3-transition/src/transition/delay.js
function delayFunction(id2, value) {
  return function() {
    init(this, id2).delay = +value.apply(this, arguments);
  };
}
function delayConstant(id2, value) {
  return value = +value, function() {
    init(this, id2).delay = value;
  };
}
function delay_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get2(this.node(), id2).delay;
}

// node_modules/d3-transition/src/transition/duration.js
function durationFunction(id2, value) {
  return function() {
    set2(this, id2).duration = +value.apply(this, arguments);
  };
}
function durationConstant(id2, value) {
  return value = +value, function() {
    set2(this, id2).duration = value;
  };
}
function duration_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get2(this.node(), id2).duration;
}

// node_modules/d3-transition/src/transition/ease.js
function easeConstant(id2, value) {
  if (typeof value !== "function") throw new Error();
  return function() {
    set2(this, id2).ease = value;
  };
}
function ease_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each(easeConstant(id2, value)) : get2(this.node(), id2).ease;
}

// node_modules/d3-transition/src/transition/easeVarying.js
function easeVarying(id2, value) {
  return function() {
    var v2 = value.apply(this, arguments);
    if (typeof v2 !== "function") throw new Error();
    set2(this, id2).ease = v2;
  };
}
function easeVarying_default(value) {
  if (typeof value !== "function") throw new Error();
  return this.each(easeVarying(this._id, value));
}

// node_modules/d3-transition/src/transition/filter.js
function filter_default2(match) {
  if (typeof match !== "function") match = matcher_default(match);
  for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j2 = 0; j2 < m2; ++j2) {
    for (var group = groups[j2], n2 = group.length, subgroup = subgroups[j2] = [], node, i = 0; i < n2; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Transition(subgroups, this._parents, this._name, this._id);
}

// node_modules/d3-transition/src/transition/merge.js
function merge_default2(transition2) {
  if (transition2._id !== this._id) throw new Error();
  for (var groups0 = this._groups, groups1 = transition2._groups, m0 = groups0.length, m1 = groups1.length, m2 = Math.min(m0, m1), merges = new Array(m0), j2 = 0; j2 < m2; ++j2) {
    for (var group0 = groups0[j2], group1 = groups1[j2], n2 = group0.length, merge = merges[j2] = new Array(n2), node, i = 0; i < n2; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j2 < m0; ++j2) {
    merges[j2] = groups0[j2];
  }
  return new Transition(merges, this._parents, this._name, this._id);
}

// node_modules/d3-transition/src/transition/on.js
function start(name2) {
  return (name2 + "").trim().split(/^|\s+/).every(function(t2) {
    var i = t2.indexOf(".");
    if (i >= 0) t2 = t2.slice(0, i);
    return !t2 || t2 === "start";
  });
}
function onFunction(id2, name2, listener) {
  var on0, on1, sit = start(name2) ? init : set2;
  return function() {
    var schedule = sit(this, id2), on2 = schedule.on;
    if (on2 !== on0) (on1 = (on0 = on2).copy()).on(name2, listener);
    schedule.on = on1;
  };
}
function on_default2(name2, listener) {
  var id2 = this._id;
  return arguments.length < 2 ? get2(this.node(), id2).on.on(name2) : this.each(onFunction(id2, name2, listener));
}

// node_modules/d3-transition/src/transition/remove.js
function removeFunction(id2) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition) if (+i !== id2) return;
    if (parent) parent.removeChild(this);
  };
}
function remove_default2() {
  return this.on("end.remove", removeFunction(this._id));
}

// node_modules/d3-transition/src/transition/select.js
function select_default2(select) {
  var name2 = this._name, id2 = this._id;
  if (typeof select !== "function") select = selector_default(select);
  for (var groups = this._groups, m2 = groups.length, subgroups = new Array(m2), j2 = 0; j2 < m2; ++j2) {
    for (var group = groups[j2], n2 = group.length, subgroup = subgroups[j2] = new Array(n2), node, subnode, i = 0; i < n2; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule_default(subgroup[i], name2, id2, i, subgroup, get2(node, id2));
      }
    }
  }
  return new Transition(subgroups, this._parents, name2, id2);
}

// node_modules/d3-transition/src/transition/selectAll.js
function selectAll_default2(select) {
  var name2 = this._name, id2 = this._id;
  if (typeof select !== "function") select = selectorAll_default(select);
  for (var groups = this._groups, m2 = groups.length, subgroups = [], parents = [], j2 = 0; j2 < m2; ++j2) {
    for (var group = groups[j2], n2 = group.length, node, i = 0; i < n2; ++i) {
      if (node = group[i]) {
        for (var children2 = select.call(node, node.__data__, i, group), child, inherit2 = get2(node, id2), k2 = 0, l2 = children2.length; k2 < l2; ++k2) {
          if (child = children2[k2]) {
            schedule_default(child, name2, id2, k2, children2, inherit2);
          }
        }
        subgroups.push(children2);
        parents.push(node);
      }
    }
  }
  return new Transition(subgroups, parents, name2, id2);
}

// node_modules/d3-transition/src/transition/selection.js
var Selection2 = selection_default.prototype.constructor;
function selection_default2() {
  return new Selection2(this._groups, this._parents);
}

// node_modules/d3-transition/src/transition/style.js
function styleNull(name2, interpolate) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name2), string1 = (this.style.removeProperty(name2), styleValue(this, name2));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
  };
}
function styleRemove2(name2) {
  return function() {
    this.style.removeProperty(name2);
  };
}
function styleConstant2(name2, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = styleValue(this, name2);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function styleFunction2(name2, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name2), value1 = value(this), string1 = value1 + "";
    if (value1 == null) string1 = value1 = (this.style.removeProperty(name2), styleValue(this, name2));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function styleMaybeRemove(id2, name2) {
  var on0, on1, listener0, key = "style." + name2, event = "end." + key, remove2;
  return function() {
    var schedule = set2(this, id2), on2 = schedule.on, listener = schedule.value[key] == null ? remove2 || (remove2 = styleRemove2(name2)) : void 0;
    if (on2 !== on0 || listener0 !== listener) (on1 = (on0 = on2).copy()).on(event, listener0 = listener);
    schedule.on = on1;
  };
}
function style_default2(name2, value, priority) {
  var i = (name2 += "") === "transform" ? interpolateTransformCss : interpolate_default;
  return value == null ? this.styleTween(name2, styleNull(name2, i)).on("end.style." + name2, styleRemove2(name2)) : typeof value === "function" ? this.styleTween(name2, styleFunction2(name2, i, tweenValue(this, "style." + name2, value))).each(styleMaybeRemove(this._id, name2)) : this.styleTween(name2, styleConstant2(name2, i, value), priority).on("end.style." + name2, null);
}

// node_modules/d3-transition/src/transition/styleTween.js
function styleInterpolate(name2, i, priority) {
  return function(t2) {
    this.style.setProperty(name2, i.call(this, t2), priority);
  };
}
function styleTween(name2, value, priority) {
  var t2, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t2 = (i0 = i) && styleInterpolate(name2, i, priority);
    return t2;
  }
  tween._value = value;
  return tween;
}
function styleTween_default(name2, value, priority) {
  var key = "style." + (name2 += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, styleTween(name2, value, priority == null ? "" : priority));
}

// node_modules/d3-transition/src/transition/text.js
function textConstant2(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction2(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}
function text_default2(value) {
  return this.tween("text", typeof value === "function" ? textFunction2(tweenValue(this, "text", value)) : textConstant2(value == null ? "" : value + ""));
}

// node_modules/d3-transition/src/transition/textTween.js
function textInterpolate(i) {
  return function(t2) {
    this.textContent = i.call(this, t2);
  };
}
function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function textTween_default(value) {
  var key = "text";
  if (arguments.length < 1) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, textTween(value));
}

// node_modules/d3-transition/src/transition/transition.js
function transition_default() {
  var name2 = this._name, id0 = this._id, id1 = newId();
  for (var groups = this._groups, m2 = groups.length, j2 = 0; j2 < m2; ++j2) {
    for (var group = groups[j2], n2 = group.length, node, i = 0; i < n2; ++i) {
      if (node = group[i]) {
        var inherit2 = get2(node, id0);
        schedule_default(node, name2, id1, i, group, {
          time: inherit2.time + inherit2.delay + inherit2.duration,
          delay: 0,
          duration: inherit2.duration,
          ease: inherit2.ease
        });
      }
    }
  }
  return new Transition(groups, this._parents, name2, id1);
}

// node_modules/d3-transition/src/transition/end.js
function end_default() {
  var on0, on1, that = this, id2 = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = { value: reject }, end = { value: function() {
      if (--size === 0) resolve();
    } };
    that.each(function() {
      var schedule = set2(this, id2), on2 = schedule.on;
      if (on2 !== on0) {
        on1 = (on0 = on2).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }
      schedule.on = on1;
    });
    if (size === 0) resolve();
  });
}

// node_modules/d3-transition/src/transition/index.js
var id = 0;
function Transition(groups, parents, name2, id2) {
  this._groups = groups;
  this._parents = parents;
  this._name = name2;
  this._id = id2;
}
function transition(name2) {
  return selection_default().transition(name2);
}
function newId() {
  return ++id;
}
var selection_prototype = selection_default.prototype;
Transition.prototype = transition.prototype = {
  constructor: Transition,
  select: select_default2,
  selectAll: selectAll_default2,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: filter_default2,
  merge: merge_default2,
  selection: selection_default2,
  transition: transition_default,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: on_default2,
  attr: attr_default2,
  attrTween: attrTween_default,
  style: style_default2,
  styleTween: styleTween_default,
  text: text_default2,
  textTween: textTween_default,
  remove: remove_default2,
  tween: tween_default,
  delay: delay_default,
  duration: duration_default,
  ease: ease_default,
  easeVarying: easeVarying_default,
  end: end_default,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};

// node_modules/d3-ease/src/cubic.js
function cubicInOut(t2) {
  return ((t2 *= 2) <= 1 ? t2 * t2 * t2 : (t2 -= 2) * t2 * t2 + 2) / 2;
}

// node_modules/d3-transition/src/selection/transition.js
var defaultTiming = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};
function inherit(node, id2) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id2])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id2} not found`);
    }
  }
  return timing;
}
function transition_default2(name2) {
  var id2, timing;
  if (name2 instanceof Transition) {
    id2 = name2._id, name2 = name2._name;
  } else {
    id2 = newId(), (timing = defaultTiming).time = now(), name2 = name2 == null ? null : name2 + "";
  }
  for (var groups = this._groups, m2 = groups.length, j2 = 0; j2 < m2; ++j2) {
    for (var group = groups[j2], n2 = group.length, node, i = 0; i < n2; ++i) {
      if (node = group[i]) {
        schedule_default(node, name2, id2, i, group, timing || inherit(node, id2));
      }
    }
  }
  return new Transition(groups, this._parents, name2, id2);
}

// node_modules/d3-transition/src/selection/index.js
selection_default.prototype.interrupt = interrupt_default2;
selection_default.prototype.transition = transition_default2;

// node_modules/d3-brush/src/brush.js
var { abs, max, min } = Math;
function number1(e3) {
  return [+e3[0], +e3[1]];
}
function number2(e3) {
  return [number1(e3[0]), number1(e3[1])];
}
var X = {
  name: "x",
  handles: ["w", "e"].map(type),
  input: function(x2, e3) {
    return x2 == null ? null : [[+x2[0], e3[0][1]], [+x2[1], e3[1][1]]];
  },
  output: function(xy) {
    return xy && [xy[0][0], xy[1][0]];
  }
};
var Y = {
  name: "y",
  handles: ["n", "s"].map(type),
  input: function(y, e3) {
    return y == null ? null : [[e3[0][0], +y[0]], [e3[1][0], +y[1]]];
  },
  output: function(xy) {
    return xy && [xy[0][1], xy[1][1]];
  }
};
var XY = {
  name: "xy",
  handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
  input: function(xy) {
    return xy == null ? null : number2(xy);
  },
  output: function(xy) {
    return xy;
  }
};
function type(t2) {
  return { type: t2 };
}

// node_modules/d3-format/src/formatDecimal.js
function formatDecimal_default(x2) {
  return Math.abs(x2 = Math.round(x2)) >= 1e21 ? x2.toLocaleString("en").replace(/,/g, "") : x2.toString(10);
}
function formatDecimalParts(x2, p) {
  if (!isFinite(x2) || x2 === 0) return null;
  var i = (x2 = p ? x2.toExponential(p - 1) : x2.toExponential()).indexOf("e"), coefficient = x2.slice(0, i);
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x2.slice(i + 1)
  ];
}

// node_modules/d3-format/src/exponent.js
function exponent_default(x2) {
  return x2 = formatDecimalParts(Math.abs(x2)), x2 ? x2[1] : NaN;
}

// node_modules/d3-format/src/formatGroup.js
function formatGroup_default(grouping, thousands) {
  return function(value, width) {
    var i = value.length, t2 = [], j2 = 0, g2 = grouping[0], length = 0;
    while (i > 0 && g2 > 0) {
      if (length + g2 + 1 > width) g2 = Math.max(1, width - length);
      t2.push(value.substring(i -= g2, i + g2));
      if ((length += g2 + 1) > width) break;
      g2 = grouping[j2 = (j2 + 1) % grouping.length];
    }
    return t2.reverse().join(thousands);
  };
}

// node_modules/d3-format/src/formatNumerals.js
function formatNumerals_default(numerals) {
  return function(value) {
    return value.replace(/[0-9]/g, function(i) {
      return numerals[+i];
    });
  };
}

// node_modules/d3-format/src/formatSpecifier.js
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function formatSpecifier(specifier) {
  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
  var match;
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}
formatSpecifier.prototype = FormatSpecifier.prototype;
function FormatSpecifier(specifier) {
  this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
  this.align = specifier.align === void 0 ? ">" : specifier.align + "";
  this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === void 0 ? void 0 : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === void 0 ? "" : specifier.type + "";
}
FormatSpecifier.prototype.toString = function() {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};

// node_modules/d3-format/src/formatTrim.js
function formatTrim_default(s2) {
  out: for (var n2 = s2.length, i = 1, i0 = -1, i1; i < n2; ++i) {
    switch (s2[i]) {
      case ".":
        i0 = i1 = i;
        break;
      case "0":
        if (i0 === 0) i0 = i;
        i1 = i;
        break;
      default:
        if (!+s2[i]) break out;
        if (i0 > 0) i0 = 0;
        break;
    }
  }
  return i0 > 0 ? s2.slice(0, i0) + s2.slice(i1 + 1) : s2;
}

// node_modules/d3-format/src/formatPrefixAuto.js
var prefixExponent;
function formatPrefixAuto_default(x2, p) {
  var d2 = formatDecimalParts(x2, p);
  if (!d2) return prefixExponent = void 0, x2.toPrecision(p);
  var coefficient = d2[0], exponent = d2[1], i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1, n2 = coefficient.length;
  return i === n2 ? coefficient : i > n2 ? coefficient + new Array(i - n2 + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x2, Math.max(0, p + i - 1))[0];
}

// node_modules/d3-format/src/formatRounded.js
function formatRounded_default(x2, p) {
  var d2 = formatDecimalParts(x2, p);
  if (!d2) return x2 + "";
  var coefficient = d2[0], exponent = d2[1];
  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1) : coefficient + new Array(exponent - coefficient.length + 2).join("0");
}

// node_modules/d3-format/src/formatTypes.js
var formatTypes_default = {
  "%": (x2, p) => (x2 * 100).toFixed(p),
  "b": (x2) => Math.round(x2).toString(2),
  "c": (x2) => x2 + "",
  "d": formatDecimal_default,
  "e": (x2, p) => x2.toExponential(p),
  "f": (x2, p) => x2.toFixed(p),
  "g": (x2, p) => x2.toPrecision(p),
  "o": (x2) => Math.round(x2).toString(8),
  "p": (x2, p) => formatRounded_default(x2 * 100, p),
  "r": formatRounded_default,
  "s": formatPrefixAuto_default,
  "X": (x2) => Math.round(x2).toString(16).toUpperCase(),
  "x": (x2) => Math.round(x2).toString(16)
};

// node_modules/d3-format/src/identity.js
function identity_default(x2) {
  return x2;
}

// node_modules/d3-format/src/locale.js
var map = Array.prototype.map;
var prefixes = ["y", "z", "a", "f", "p", "n", "\xB5", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function locale_default(locale2) {
  var group = locale2.grouping === void 0 || locale2.thousands === void 0 ? identity_default : formatGroup_default(map.call(locale2.grouping, Number), locale2.thousands + ""), currencyPrefix = locale2.currency === void 0 ? "" : locale2.currency[0] + "", currencySuffix = locale2.currency === void 0 ? "" : locale2.currency[1] + "", decimal = locale2.decimal === void 0 ? "." : locale2.decimal + "", numerals = locale2.numerals === void 0 ? identity_default : formatNumerals_default(map.call(locale2.numerals, String)), percent = locale2.percent === void 0 ? "%" : locale2.percent + "", minus = locale2.minus === void 0 ? "\u2212" : locale2.minus + "", nan = locale2.nan === void 0 ? "NaN" : locale2.nan + "";
  function newFormat(specifier, options) {
    specifier = formatSpecifier(specifier);
    var fill = specifier.fill, align = specifier.align, sign = specifier.sign, symbol = specifier.symbol, zero3 = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type2 = specifier.type;
    if (type2 === "n") comma = true, type2 = "g";
    else if (!formatTypes_default[type2]) precision === void 0 && (precision = 12), trim = true, type2 = "g";
    if (zero3 || fill === "0" && align === "=") zero3 = true, fill = "0", align = "=";
    var prefix = (options && options.prefix !== void 0 ? options.prefix : "") + (symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type2) ? "0" + type2.toLowerCase() : ""), suffix = (symbol === "$" ? currencySuffix : /[%p]/.test(type2) ? percent : "") + (options && options.suffix !== void 0 ? options.suffix : "");
    var formatType = formatTypes_default[type2], maybeSuffix = /[defgprs%]/.test(type2);
    precision = precision === void 0 ? 6 : /[gprs]/.test(type2) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
    function format2(value) {
      var valuePrefix = prefix, valueSuffix = suffix, i, n2, c2;
      if (type2 === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;
        var valueNegative = value < 0 || 1 / value < 0;
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
        if (trim) value = formatTrim_default(value);
        if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;
        valuePrefix = (valueNegative ? sign === "(" ? sign : minus : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
        valueSuffix = (type2 === "s" && !isNaN(value) && prefixExponent !== void 0 ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");
        if (maybeSuffix) {
          i = -1, n2 = value.length;
          while (++i < n2) {
            if (c2 = value.charCodeAt(i), 48 > c2 || c2 > 57) {
              valueSuffix = (c2 === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }
      if (comma && !zero3) value = group(value, Infinity);
      var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
      if (comma && zero3) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
      switch (align) {
        case "<":
          value = valuePrefix + value + valueSuffix + padding;
          break;
        case "=":
          value = valuePrefix + padding + value + valueSuffix;
          break;
        case "^":
          value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
          break;
        default:
          value = padding + valuePrefix + value + valueSuffix;
          break;
      }
      return numerals(value);
    }
    format2.toString = function() {
      return specifier + "";
    };
    return format2;
  }
  function formatPrefix2(specifier, value) {
    var e3 = Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3, k2 = Math.pow(10, -e3), f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier), { suffix: prefixes[8 + e3 / 3] });
    return function(value2) {
      return f(k2 * value2);
    };
  }
  return {
    format: newFormat,
    formatPrefix: formatPrefix2
  };
}

// node_modules/d3-format/src/defaultLocale.js
var locale;
var format;
var formatPrefix;
defaultLocale({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});
function defaultLocale(definition) {
  locale = locale_default(definition);
  format = locale.format;
  formatPrefix = locale.formatPrefix;
  return locale;
}

// node_modules/d3-format/src/precisionFixed.js
function precisionFixed_default(step) {
  return Math.max(0, -exponent_default(Math.abs(step)));
}

// node_modules/d3-format/src/precisionPrefix.js
function precisionPrefix_default(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3 - exponent_default(Math.abs(step)));
}

// node_modules/d3-format/src/precisionRound.js
function precisionRound_default(step, max2) {
  step = Math.abs(step), max2 = Math.abs(max2) - step;
  return Math.max(0, exponent_default(max2) - exponent_default(step)) + 1;
}

// node_modules/d3-scale/src/init.js
function initRange(domain, range2) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(domain);
      break;
    default:
      this.range(range2).domain(domain);
      break;
  }
  return this;
}

// node_modules/d3-scale/src/ordinal.js
var implicit = Symbol("implicit");
function ordinal() {
  var index = new InternMap(), domain = [], range2 = [], unknown = implicit;
  function scale(d2) {
    let i = index.get(d2);
    if (i === void 0) {
      if (unknown !== implicit) return unknown;
      index.set(d2, i = domain.push(d2) - 1);
    }
    return range2[i % range2.length];
  }
  scale.domain = function(_2) {
    if (!arguments.length) return domain.slice();
    domain = [], index = new InternMap();
    for (const value of _2) {
      if (index.has(value)) continue;
      index.set(value, domain.push(value) - 1);
    }
    return scale;
  };
  scale.range = function(_2) {
    return arguments.length ? (range2 = Array.from(_2), scale) : range2.slice();
  };
  scale.unknown = function(_2) {
    return arguments.length ? (unknown = _2, scale) : unknown;
  };
  scale.copy = function() {
    return ordinal(domain, range2).unknown(unknown);
  };
  initRange.apply(scale, arguments);
  return scale;
}

// node_modules/d3-scale/src/band.js
function band() {
  var scale = ordinal().unknown(void 0), domain = scale.domain, ordinalRange = scale.range, r0 = 0, r1 = 1, step, bandwidth, round = false, paddingInner = 0, paddingOuter = 0, align = 0.5;
  delete scale.unknown;
  function rescale() {
    var n2 = domain().length, reverse = r1 < r0, start2 = reverse ? r1 : r0, stop = reverse ? r0 : r1;
    step = (stop - start2) / Math.max(1, n2 - paddingInner + paddingOuter * 2);
    if (round) step = Math.floor(step);
    start2 += (stop - start2 - step * (n2 - paddingInner)) * align;
    bandwidth = step * (1 - paddingInner);
    if (round) start2 = Math.round(start2), bandwidth = Math.round(bandwidth);
    var values = range(n2).map(function(i) {
      return start2 + step * i;
    });
    return ordinalRange(reverse ? values.reverse() : values);
  }
  scale.domain = function(_2) {
    return arguments.length ? (domain(_2), rescale()) : domain();
  };
  scale.range = function(_2) {
    return arguments.length ? ([r0, r1] = _2, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
  };
  scale.rangeRound = function(_2) {
    return [r0, r1] = _2, r0 = +r0, r1 = +r1, round = true, rescale();
  };
  scale.bandwidth = function() {
    return bandwidth;
  };
  scale.step = function() {
    return step;
  };
  scale.round = function(_2) {
    return arguments.length ? (round = !!_2, rescale()) : round;
  };
  scale.padding = function(_2) {
    return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_2), rescale()) : paddingInner;
  };
  scale.paddingInner = function(_2) {
    return arguments.length ? (paddingInner = Math.min(1, _2), rescale()) : paddingInner;
  };
  scale.paddingOuter = function(_2) {
    return arguments.length ? (paddingOuter = +_2, rescale()) : paddingOuter;
  };
  scale.align = function(_2) {
    return arguments.length ? (align = Math.max(0, Math.min(1, _2)), rescale()) : align;
  };
  scale.copy = function() {
    return band(domain(), [r0, r1]).round(round).paddingInner(paddingInner).paddingOuter(paddingOuter).align(align);
  };
  return initRange.apply(rescale(), arguments);
}
function pointish(scale) {
  var copy2 = scale.copy;
  scale.padding = scale.paddingOuter;
  delete scale.paddingInner;
  delete scale.paddingOuter;
  scale.copy = function() {
    return pointish(copy2());
  };
  return scale;
}
function point() {
  return pointish(band.apply(null, arguments).paddingInner(1));
}

// node_modules/d3-scale/src/constant.js
function constants(x2) {
  return function() {
    return x2;
  };
}

// node_modules/d3-scale/src/number.js
function number3(x2) {
  return +x2;
}

// node_modules/d3-scale/src/continuous.js
var unit = [0, 1];
function identity2(x2) {
  return x2;
}
function normalize(a2, b2) {
  return (b2 -= a2 = +a2) ? function(x2) {
    return (x2 - a2) / b2;
  } : constants(isNaN(b2) ? NaN : 0.5);
}
function clamper(a2, b2) {
  var t2;
  if (a2 > b2) t2 = a2, a2 = b2, b2 = t2;
  return function(x2) {
    return Math.max(a2, Math.min(b2, x2));
  };
}
function bimap(domain, range2, interpolate) {
  var d0 = domain[0], d1 = domain[1], r0 = range2[0], r1 = range2[1];
  if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
  else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
  return function(x2) {
    return r0(d0(x2));
  };
}
function polymap(domain, range2, interpolate) {
  var j2 = Math.min(domain.length, range2.length) - 1, d2 = new Array(j2), r = new Array(j2), i = -1;
  if (domain[j2] < domain[0]) {
    domain = domain.slice().reverse();
    range2 = range2.slice().reverse();
  }
  while (++i < j2) {
    d2[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate(range2[i], range2[i + 1]);
  }
  return function(x2) {
    var i2 = bisect_default(domain, x2, 1, j2) - 1;
    return r[i2](d2[i2](x2));
  };
}
function copy(source, target) {
  return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
}
function transformer() {
  var domain = unit, range2 = unit, interpolate = value_default, transform2, untransform, unknown, clamp = identity2, piecewise, output, input;
  function rescale() {
    var n2 = Math.min(domain.length, range2.length);
    if (clamp !== identity2) clamp = clamper(domain[0], domain[n2 - 1]);
    piecewise = n2 > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }
  function scale(x2) {
    return x2 == null || isNaN(x2 = +x2) ? unknown : (output || (output = piecewise(domain.map(transform2), range2, interpolate)))(transform2(clamp(x2)));
  }
  scale.invert = function(y) {
    return clamp(untransform((input || (input = piecewise(range2, domain.map(transform2), number_default)))(y)));
  };
  scale.domain = function(_2) {
    return arguments.length ? (domain = Array.from(_2, number3), rescale()) : domain.slice();
  };
  scale.range = function(_2) {
    return arguments.length ? (range2 = Array.from(_2), rescale()) : range2.slice();
  };
  scale.rangeRound = function(_2) {
    return range2 = Array.from(_2), interpolate = round_default, rescale();
  };
  scale.clamp = function(_2) {
    return arguments.length ? (clamp = _2 ? true : identity2, rescale()) : clamp !== identity2;
  };
  scale.interpolate = function(_2) {
    return arguments.length ? (interpolate = _2, rescale()) : interpolate;
  };
  scale.unknown = function(_2) {
    return arguments.length ? (unknown = _2, scale) : unknown;
  };
  return function(t2, u2) {
    transform2 = t2, untransform = u2;
    return rescale();
  };
}
function continuous() {
  return transformer()(identity2, identity2);
}

// node_modules/d3-scale/src/tickFormat.js
function tickFormat(start2, stop, count, specifier) {
  var step = tickStep(start2, stop, count), precision;
  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start2), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = precisionPrefix_default(step, value))) specifier.precision = precision;
      return formatPrefix(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = precisionRound_default(step, Math.max(Math.abs(start2), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = precisionFixed_default(step))) specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return format(specifier);
}

// node_modules/d3-scale/src/linear.js
function linearish(scale) {
  var domain = scale.domain;
  scale.ticks = function(count) {
    var d2 = domain();
    return ticks(d2[0], d2[d2.length - 1], count == null ? 10 : count);
  };
  scale.tickFormat = function(count, specifier) {
    var d2 = domain();
    return tickFormat(d2[0], d2[d2.length - 1], count == null ? 10 : count, specifier);
  };
  scale.nice = function(count) {
    if (count == null) count = 10;
    var d2 = domain();
    var i0 = 0;
    var i1 = d2.length - 1;
    var start2 = d2[i0];
    var stop = d2[i1];
    var prestep;
    var step;
    var maxIter = 10;
    if (stop < start2) {
      step = start2, start2 = stop, stop = step;
      step = i0, i0 = i1, i1 = step;
    }
    while (maxIter-- > 0) {
      step = tickIncrement(start2, stop, count);
      if (step === prestep) {
        d2[i0] = start2;
        d2[i1] = stop;
        return domain(d2);
      } else if (step > 0) {
        start2 = Math.floor(start2 / step) * step;
        stop = Math.ceil(stop / step) * step;
      } else if (step < 0) {
        start2 = Math.ceil(start2 * step) / step;
        stop = Math.floor(stop * step) / step;
      } else {
        break;
      }
      prestep = step;
    }
    return scale;
  };
  return scale;
}
function linear2() {
  var scale = continuous();
  scale.copy = function() {
    return copy(scale, linear2());
  };
  initRange.apply(scale, arguments);
  return linearish(scale);
}

// node_modules/d3-zoom/src/transform.js
function Transform(k2, x2, y) {
  this.k = k2;
  this.x = x2;
  this.y = y;
}
Transform.prototype = {
  constructor: Transform,
  scale: function(k2) {
    return k2 === 1 ? this : new Transform(this.k * k2, this.x, this.y);
  },
  translate: function(x2, y) {
    return x2 === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x2, this.y + this.k * y);
  },
  apply: function(point2) {
    return [point2[0] * this.k + this.x, point2[1] * this.k + this.y];
  },
  applyX: function(x2) {
    return x2 * this.k + this.x;
  },
  applyY: function(y) {
    return y * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x2) {
    return (x2 - this.x) / this.k;
  },
  invertY: function(y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function(x2) {
    return x2.copy().domain(x2.range().map(this.invertX, this).map(x2.invert, x2));
  },
  rescaleY: function(y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var identity3 = new Transform(1, 0, 0);
transform.prototype = Transform.prototype;
function transform(node) {
  while (!node.__zoom) if (!(node = node.parentNode)) return identity3;
  return node.__zoom;
}

// node_modules/wsr-ui-core/dist/index.js
var import_react = require("react");
function m({ as: e3 = "span", variant: n2, family: r, weight: i, tone: a2, italic: o2 = false, underline: s2 = false, truncate: c2 = false, className: l2, ...u2 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(e3, {
    className: ["wsr-typography", l2].filter(Boolean).join(" "),
    "data-family": r,
    "data-italic": o2 || void 0,
    "data-tone": a2,
    "data-truncate": c2 || void 0,
    "data-underline": s2 || void 0,
    "data-variant": n2,
    "data-weight": i,
    ...u2
  });
}
function h({ appearance: e3 = "outline", tone: n2 = "neutral", size: r = "compact", selected: i, className: a2, ...o2 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
    "aria-pressed": e3 === "segment" ? i : o2["aria-pressed"],
    className: ["wsr-button", a2].filter(Boolean).join(" "),
    "data-appearance": e3,
    "data-size": r,
    "data-tone": n2,
    ...o2
  });
}
function g({ "aria-label": e3, title: n2, children: r, ...i }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(h, {
    "aria-label": e3,
    "data-icon-button": "true",
    title: n2 ?? e3,
    ...i,
    children: r
  });
}
function _({ segmented: e3 = false, className: n2, ...r }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: ["wsr-button-group", n2].filter(Boolean).join(" "),
    "data-segmented": e3 || void 0,
    role: e3 ? "group" : r.role,
    ...r
  });
}
function v({ as: e3 = "section", level: n2 = "section", border: r = "solid", className: i, children: a2, ...o2 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(e3, {
    className: ["wsr-surface", i].filter(Boolean).join(" "),
    "data-border": r,
    "data-level": n2,
    ...o2,
    children: a2
  });
}
function b({ inputKind: e3 = "search", className: n2, type: r, ...i }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
    className: ["wsr-input", n2].filter(Boolean).join(" "),
    "data-input-kind": e3,
    type: r ?? e3,
    ...i
  });
}
function x({ status: e3, className: n2, ...r }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
    className: ["wsr-status-badge", n2].filter(Boolean).join(" "),
    "data-status": e3,
    ...r
  });
}
var S = Object.freeze({
  schemaVersion: "wsr.studio-design@1",
  typography: Object.freeze({
    h1: Object.freeze({
      size: "4xl",
      family: "sans",
      weight: "semibold"
    }),
    h2: Object.freeze({
      size: "xl",
      family: "sans",
      weight: "semibold"
    }),
    subtitle1: Object.freeze({
      size: "lg",
      family: "sans",
      weight: "semibold"
    }),
    body1: Object.freeze({
      size: "base",
      family: "sans",
      weight: "regular"
    }),
    body2: Object.freeze({
      size: "sm",
      family: "sans",
      weight: "regular"
    }),
    caption: Object.freeze({
      size: "xs",
      family: "sans",
      weight: "regular"
    }),
    overline: Object.freeze({
      size: "2xs",
      family: "sans",
      weight: "bold",
      transform: "uppercase"
    })
  }),
  buttons: Object.freeze({
    primary: Object.freeze({
      appearance: "solid",
      tone: "primary",
      size: "compact"
    }),
    secondary: Object.freeze({
      appearance: "outline",
      tone: "neutral",
      size: "compact"
    }),
    ghost: Object.freeze({
      appearance: "ghost",
      tone: "neutral",
      size: "compact"
    }),
    danger: Object.freeze({
      appearance: "solid",
      tone: "danger",
      size: "compact"
    }),
    segment: Object.freeze({
      appearance: "segment",
      tone: "primary",
      size: "compact"
    })
  }),
  inputs: Object.freeze({ search: Object.freeze({
    kind: "search",
    size: "compact",
    surface: "inset"
  }) }),
  statuses: Object.freeze({
    available: Object.freeze({
      tone: "primary",
      emphasis: "soft"
    }),
    selected: Object.freeze({
      tone: "primary",
      emphasis: "soft"
    }),
    partial: Object.freeze({
      tone: "warning",
      emphasis: "soft"
    }),
    unavailable: Object.freeze({
      tone: "neutral",
      emphasis: "soft"
    }),
    error: Object.freeze({
      tone: "danger",
      emphasis: "soft"
    })
  }),
  surfaces: Object.freeze({
    header: Object.freeze({
      level: "section",
      border: "solid",
      radius: "panel"
    }),
    section: Object.freeze({
      level: "section",
      border: "solid",
      radius: "panel"
    }),
    panel: Object.freeze({
      level: "panel",
      border: "solid",
      radius: "panel"
    }),
    inset: Object.freeze({
      level: "inset",
      border: "solid",
      radius: "control"
    }),
    notice: Object.freeze({
      level: "raised",
      border: "dashed",
      radius: "panel"
    })
  }),
  spacing: Object.freeze([
    "tight",
    "control",
    "cluster",
    "grid",
    "section"
  ]),
  pages: Object.freeze({
    select: Object.freeze([
      "header",
      "taskPopulation",
      "currentSelection"
    ]),
    dashboard: Object.freeze([
      "header",
      "panelCanvas",
      "traceNotice"
    ]),
    evidence: Object.freeze(["header", "evidenceContent"]),
    trace: Object.freeze([
      "header",
      "traceContext",
      "rendererNavigation",
      "renderer",
      "motion"
    ])
  })
});
function C({ children: e3, className: n2, density: r, theme: i = "system" }) {
  let a2 = typeof i == "string" ? i : i.mode, o2 = r ?? (typeof i == "string" ? "comfortable" : i.density), s2;
  if (typeof i != "string") {
    let e4 = { "--wsr-container-border-style": i.containerBorderStyle }, t2 = (t3, n4) => {
      n4 !== void 0 && (e4[t3] = n4);
    }, n3 = i.palette;
    t2("--wsr-surface-section", n3?.surface?.section), t2("--wsr-surface-panel", n3?.surface?.panel), t2("--wsr-surface-raised", n3?.surface?.raised), t2("--wsr-surface-inset", n3?.surface?.inset), t2("--content-primary", n3?.content?.primary), t2("--content-secondary", n3?.content?.secondary), t2("--content-muted", n3?.content?.muted), t2("--content-inverse", n3?.content?.inverse), t2("--border-default", n3?.border?.default), t2("--border-strong", n3?.border?.strong), t2("--interaction-accent", n3?.interaction?.accent), t2("--interaction-selection", n3?.interaction?.selection), t2("--interaction-disabled", n3?.interaction?.disabled), t2("--focus-ring", n3?.interaction?.focusRing), t2("--status-available", n3?.status?.available), t2("--status-attention", n3?.status?.attention), t2("--status-warning", n3?.status?.attention), t2("--status-unavailable", n3?.status?.unavailable), t2("--status-expired", n3?.status?.expired), t2("--status-incompatible", n3?.status?.incompatible), t2("--status-error", n3?.status?.error), n3?.data !== void 0 && Array.from({ length: 6 }, (e6, r2) => t2(`--data-series-${r2 + 1}`, n3.data?.[r2 % n3.data.length])), t2("--wsr-font-family", i.typography?.fontFamily), t2("--wsr-code-font-family", i.typography?.codeFontFamily), t2("--wsr-type-h1", i.typography?.h1), t2("--wsr-type-h2", i.typography?.h2), t2("--wsr-type-subtitle1", i.typography?.subtitle1), t2("--wsr-type-body1", i.typography?.body1), t2("--wsr-type-body2", i.typography?.body2), t2("--wsr-type-caption", i.typography?.caption), t2("--wsr-type-overline", i.typography?.overline), s2 = e4;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: ["wsr-bi", n2].filter(Boolean).join(" "),
    "data-density": o2,
    "data-theme": a2,
    style: s2,
    children: e3
  });
}
function E(e3) {
  return Object.freeze({
    ...e3.surface === void 0 ? {} : { surface: Object.freeze({ ...e3.surface }) },
    ...e3.content === void 0 ? {} : { content: Object.freeze({ ...e3.content }) },
    ...e3.border === void 0 ? {} : { border: Object.freeze({ ...e3.border }) },
    ...e3.interaction === void 0 ? {} : { interaction: Object.freeze({ ...e3.interaction }) },
    ...e3.status === void 0 ? {} : { status: Object.freeze({ ...e3.status }) },
    ...e3.data === void 0 ? {} : { data: Object.freeze([...e3.data]) }
  });
}
function D({ mode: e3, density: t2 = "comfortable", containerBorderStyle: n2 = "solid", palette: r, typography: i }) {
  return Object.freeze({
    mode: e3,
    density: t2,
    containerBorderStyle: n2,
    ...r === void 0 ? {} : { palette: E(r) },
    ...i === void 0 ? {} : { typography: Object.freeze({ ...i }) }
  });
}
function O(e3) {
  let t2 = e3.startsWith("-"), n2 = (t2 ? e3.slice(1) : e3).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return t2 ? `-${n2}` : n2;
}
function k(e3) {
  let [t2, n2] = e3.split("/");
  return [BigInt(t2), BigInt(n2 ?? "1")];
}
function ee(e3) {
  let [t2, n2] = k(e3), r = t2 < 0n, i = (r ? -t2 : t2) * 10000n, a2 = i / n2;
  i % n2 * 2n >= n2 && (a2 += 1n);
  let o2 = a2 / 100n, s2 = String(a2 % 100n).padStart(2, "0");
  return `${r ? "-" : ""}${o2}.${s2}%`;
}
function A(e3) {
  let t2 = `${String(e3.value)} ${e3.unit}`;
  return e3.kind === "RATIO" ? {
    display: ee(e3.value),
    exact: t2
  } : e3.kind === "BOOLEAN" ? {
    display: t2,
    exact: t2
  } : /^-?(?:0|[1-9][0-9]*)$/.test(e3.value) ? {
    display: `${O(e3.value)} ${e3.unit}`,
    exact: t2
  } : {
    display: t2,
    exact: t2
  };
}
var j = {
  "role-template-rework-rate@2.0.0": {
    definition: "Role-template rework rate",
    valueSemantics: "Ratio of covered terminal Delivery/template exposures with at least one recorded FINDING_FIX relationship.",
    eligibility: "Terminal Delivery with an accepted Manifest and recorded C30 binding the exercised role template.",
    exclusions: [
      "Missing or incompatible Manifest coordinate",
      "Unavailable repair relationship input",
      "Expired records outside the current population"
    ],
    limits: "Repair association is descriptive. Do not infer template, reviewer, or writer causality; do not merge Deliveries in one Task."
  },
  "role-template-trajectory-partial-cost@2.0.0": {
    definition: "Role-template trajectory partial cost",
    valueSemantics: "Reported compatible money Usage for terminal Delivery/template exposures.",
    eligibility: "Terminal Delivery with exact Manifest-bound role template exposure and compatible reported money Usage.",
    exclusions: ["Incompatible Usage kind, unit, source, or source_id"],
    limits: "Do not label as total cost; do not estimate, price, or convert Usage."
  },
  "role-model-task-outcome-rate@2.0.0": {
    definition: "Role-model task outcome rate",
    valueSemantics: "Outcome ratio for eligible attributed terminal Tasks.",
    eligibility: "Unique terminal Task outcome and complete canonical model-role tuple.",
    exclusions: ["Open or mixed-outcome Task", "Incomplete attribution"],
    limits: "Outcome difference is descriptive; do not infer model causality."
  },
  "operational-latency-ms@2.0.0": {
    definition: "Operational latency",
    valueSemantics: "Native model-call Span duration in milliseconds.",
    eligibility: "Native host-reported finite nonnegative duration.",
    exclusions: ["Absent or invalid duration", "Incompatible provider or runtime cohort"],
    limits: "Operational latency is not Delivery elapsed time. Do not substitute C55 or infer causality."
  },
  "trajectory-partial-cost@2.0.0": {
    definition: "Trajectory partial cost",
    valueSemantics: "Partial sum of compatible reported money Usage linked to a Delivery.",
    eligibility: "Exact Delivery linkage and exact Usage kind, unit, source, and source_id.",
    exclusions: ["Incompatible Usage kind, unit, source, or source_id"],
    limits: "Do not label as total cost; do not estimate, price, or convert Usage."
  },
  "task-cohort-comparison-eligibility@2.0.0": {
    definition: "Task cohort comparison eligibility",
    valueSemantics: "Ratio of defined Tasks ready for compatible cohort comparison.",
    eligibility: "Task passes the Metric Catalog Task eligibility rules.",
    exclusions: [
      "Open Delivery",
      "Mixed Delivery outcomes",
      "Undefined Task membership",
      "Missing Task identity or cohort coordinates"
    ],
    limits: "Eligibility measures evidence readiness, not outcome quality. Excluded Tasks stay in the denominator."
  },
  "delivery-stage-reach@2.0.0": {
    definition: "Delivery stage reach",
    valueSemantics: "Per-stage ratio over linked terminal Deliveries with direct C56 readings.",
    eligibility: "Linked terminal Delivery with a valid direct C56 value.",
    exclusions: ["Absent or invalid C56 from the reached-stage numerator"],
    limits: "Stage identity does not prove unobserved traversal; do not infer from Workflow order."
  },
  "delivery-terminal-outcome-rate@2.0.0": {
    definition: "Delivery terminal outcome rate",
    valueSemantics: "Per-outcome ratio over explicitly terminated Deliveries.",
    eligibility: "Exact terminal Delivery identity and supported outcome.",
    exclusions: ["Open or non-terminal Delivery", "Unsupported outcome"],
    limits: "Delivery outcome is not Task outcome; do not infer a Task-level outcome."
  },
  "delivery-cycle-time-ms@2.0.0": {
    definition: "Delivery cycle time",
    valueSemantics: "Owner-reported direct C55 Delivery elapsed time in milliseconds.",
    eligibility: "Terminal Delivery with finite nonnegative C55.",
    exclusions: ["Absent or invalid C55"],
    limits: "Do not derive from arrival time or substitute model-call latency or zero."
  },
  "operational-token-usage@2.0.0": {
    definition: "Operational token usage",
    valueSemantics: "Compatible reported input or output token measurements.",
    eligibility: "Reported compatible token measurement for an exact model call.",
    exclusions: ["Absent or incompatible measurement"],
    limits: "Values are partial attributable Usage; do not synthesize total tokens."
  },
  "operational-attributable-cost@2.0.0": {
    definition: "Operational attributable cost",
    valueSemantics: "Reported money Usage bound to an exact model call.",
    eligibility: "Trace/Span context binds Usage to the exact call with compatible kind, unit, source, and source_id.",
    exclusions: [
      "Missing call linkage",
      "Incompatible Usage",
      "Incomplete attribution"
    ],
    limits: "Do not label as total cost; do not estimate, price, or convert Usage."
  },
  "operational-usage-availability@2.0.0": {
    definition: "Operational usage availability",
    valueSemantics: "Ratio of eligible model calls with reported compatible Usage.",
    eligibility: "Eligible exact model-call identity.",
    exclusions: ["Unsupported call identity or compatibility context"],
    limits: "Availability does not state Usage amount; do not turn missing Usage into zero."
  }
};
var te = /* @__PURE__ */ new Set([
  "AVAILABLE",
  "LOWER_BOUND",
  "NOT_APPLICABLE",
  "UNAVAILABLE",
  "EXPIRED",
  "INCOMPATIBLE"
]);
var M = /* @__PURE__ */ new Set([
  "COUNT",
  "QUANTITY",
  "RATIO",
  "MONEY",
  "DURATION_MS",
  "BOOLEAN"
]);
var N = /* @__PURE__ */ new Set([
  "SAMPLE_INSUFFICIENT",
  "MISSING_INPUT",
  "NO_APPLICABLE_POPULATION",
  "OPEN_TASK",
  "MIXED_TASK_OUTCOMES",
  "EXPIRED_INPUT",
  "INCOMPATIBLE_INPUT"
]);
var P = /* @__PURE__ */ new Set([
  "NO_POPULATION",
  "NO_COVERAGE",
  "PARTIAL",
  "FULL"
]);
var F = (e3) => typeof e3 == "object" && !!e3 && !Array.isArray(e3);
var I = (e3) => Array.isArray(e3) && e3.every((e4) => typeof e4 == "string");
function L(e3) {
  return !F(e3) || typeof e3.metric_id != "string" || e3.metric_id.length === 0 || e3.metric_version !== "2.0.0" || !Array.isArray(e3.slices) ? false : e3.slices.every((e4) => {
    let t2 = typeof e4 == "object" && !!e4 && (e4.coverage === null || F(e4.coverage) && typeof e4.coverage.numerator == "string" && typeof e4.coverage.denominator == "string" && (e4.coverage.raw_ratio === null || typeof e4.coverage.raw_ratio == "string") && typeof e4.coverage.state == "string" && P.has(e4.coverage.state) && (e4.coverage.alert === null || e4.coverage.alert === "LOW_COVERAGE"));
    return !F(e4) || !F(e4.slice_key) || typeof e4.state != "string" || !te.has(e4.state) || !F(e4.measures) || !F(e4.compatibility) || !I(e4.exclusions) || !I(e4.missing_inputs) || !I(e4.provenance_refs) || !t2 || e4.numerator !== void 0 && typeof e4.numerator != "string" || e4.denominator !== void 0 && typeof e4.denominator != "string" || e4.contributing_count !== void 0 && typeof e4.contributing_count != "string" || e4.reading !== void 0 && typeof e4.reading != "string" ? false : e4.value === void 0 ? typeof e4.withholding_reason == "string" && N.has(e4.withholding_reason) : !F(e4.value) || typeof e4.value.kind != "string" || !M.has(e4.value.kind) || typeof e4.value.unit != "string" ? false : e4.value.kind === "BOOLEAN" ? typeof e4.value.value == "boolean" : typeof e4.value.value == "string" ? e4.value.kind === "RATIO" ? /^-?(?:0|[1-9][0-9]*)(?:\/[1-9][0-9]*)?$/u.test(e4.value.value) : /^-?(?:0|[1-9][0-9]*)$/u.test(e4.value.value) || e4.value.kind === "MONEY" || e4.value.kind === "QUANTITY" : false;
  });
}
var ne = (e3) => e3;
var re2 = {
  "numeric-card@1": ne({
    id: "numeric-card@1",
    arity: "ONE_SLICE",
    channels: ["value"],
    kinds: [
      "COUNT",
      "QUANTITY",
      "RATIO",
      "MONEY",
      "DURATION_MS"
    ],
    authoritativeDomain: "NONE",
    missingTolerance: "TRUTH_STATE",
    compare: "SEPARATE_SIDES",
    fallback: "table@1",
    transforms: ["DISPLAY_ROUNDING", "RATIO_TO_PERCENT"]
  }),
  "badge@1": ne({
    id: "badge@1",
    arity: "ONE_SLICE",
    channels: ["value"],
    kinds: ["BOOLEAN"],
    authoritativeDomain: "NONE",
    missingTolerance: "TRUTH_STATE",
    compare: "SEPARATE_SIDES",
    fallback: "table@1",
    transforms: []
  }),
  "ratio-bar@1": ne({
    id: "ratio-bar@1",
    arity: "ONE_SLICE",
    channels: ["value", "domain"],
    kinds: ["RATIO"],
    authoritativeDomain: "NONE",
    missingTolerance: "TRUTH_STATE",
    compare: "SEPARATE_SIDES",
    fallback: "table@1",
    transforms: ["RATIO_TO_PERCENT", "SCALE_LAYOUT"]
  }),
  "table@1": ne({
    id: "table@1",
    arity: "ANY",
    channels: ["published-result"],
    kinds: "ANY",
    authoritativeDomain: "NONE",
    missingTolerance: "ROWS",
    compare: "SUPPORTED",
    fallback: "table@1",
    transforms: [
      "DISPLAY_ROUNDING",
      "RATIO_TO_PERCENT",
      "STABLE_AUTHORITATIVE_SORT"
    ]
  })
};
function ie(e3) {
  if (e3.value === void 0) return ["numeric-card@1", "table@1"];
  let t2 = [];
  return e3.value.kind === "BOOLEAN" ? t2.push("badge@1") : t2.push("numeric-card@1"), e3.value.kind === "RATIO" && e3.value.unit === "ratio" && t2.push("ratio-bar@1"), t2.push("table@1"), t2;
}
function ae(e3) {
  if (e3.slices.length !== 1) return "table@1";
  let t2 = e3.slices[0]?.value;
  return t2?.kind === "BOOLEAN" ? "badge@1" : t2?.kind === "RATIO" && t2.unit === "ratio" ? "ratio-bar@1" : "numeric-card@1";
}
var R = {
  AVAILABLE: {
    label: "Available",
    marker: "\u2713",
    tone: "available"
  },
  LOWER_BOUND: {
    label: "Lower bound",
    marker: "\u2265",
    tone: "attention"
  },
  NOT_APPLICABLE: {
    label: "Not applicable",
    marker: "\u2014",
    tone: "unavailable"
  },
  UNAVAILABLE: {
    label: "Unavailable",
    marker: "\xD7",
    tone: "unavailable"
  },
  EXPIRED: {
    label: "Expired",
    marker: "\u231B",
    tone: "expired"
  },
  INCOMPATIBLE: {
    label: "Incompatible",
    marker: "\u2260",
    tone: "incompatible"
  }
};
function oe({ state: e3, withholdingReason: r, reading: i, detail: a2 = "full" }) {
  let o2 = R[e3];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "status-stack",
    "data-state": e3,
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
        className: `status-label status-${o2.tone}`,
        children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
          "aria-hidden": "true",
          className: "status-label-marker",
          children: o2.marker
        }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
          className: "status-label-text",
          children: o2.label
        })]
      }),
      a2 === "label" || r === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
        className: "status-reason",
        children: ["Reason: ", r]
      }),
      a2 === "label" || i === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
        className: "status-reading",
        children: i
      })
    ]
  });
}
var se = {
  NO_POPULATION: "No applicable population",
  NO_COVERAGE: "No coverage",
  PARTIAL: "Partial coverage",
  FULL: "Full coverage"
};
var ce = {
  NO_POPULATION: {
    marker: "\u25CB",
    tone: "unavailable"
  },
  NO_COVERAGE: {
    marker: "\u25CB",
    tone: "attention"
  },
  PARTIAL: {
    marker: "\u25B3",
    tone: "attention"
  },
  FULL: {
    marker: "\u25CF",
    tone: "available"
  }
};
function le({ coverage: e3 }) {
  if (e3 === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: "coverage-label",
    "data-coverage": "UNAVAILABLE",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
      className: "status-label status-unavailable",
      children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
        "aria-hidden": "true",
        children: "\u25CB"
      }), "Coverage unavailable"]
    })
  });
  let r = ce[e3.state];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "coverage-label",
    "data-coverage": e3.state,
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
        className: `status-label status-${r.tone}`,
        children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
          "aria-hidden": "true",
          children: r.marker
        }), se[e3.state]]
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
        className: "numeric-exact",
        children: [
          e3.numerator,
          " / ",
          e3.denominator
        ]
      }),
      e3.alert === "LOW_COVERAGE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
        className: "status-reason",
        children: "Low coverage"
      }) : null
    ]
  });
}
var ue = (e3) => e3.toLowerCase().replaceAll("_", " ");
function z(e3) {
  if (e3.traceState !== void 0) {
    let r2 = e3.traceState === "PARTIAL" ? "partial recorded data" : ue(e3.traceState), i = e3.traceState === "AVAILABLE" ? "available" : e3.traceState === "EXPIRED" ? "expired" : e3.traceState === "PARTIAL" ? "attention" : "unavailable";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
      className: `status-label status-${i}`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
          "aria-hidden": "true",
          children: "\u25C7"
        }),
        "Trace: ",
        r2
      ]
    });
  }
  let { truth: r } = e3;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "lifecycle-grid",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Completeness: ", ue(r.completeness ?? "UNSPECIFIED")] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Availability: ", ue(r.availability)] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Expiry: ", ue(r.expiry)] })
    ]
  });
}
function B({ title: e3, detail: r, correlation: i, retryable: a2, onRetry: o2, announce: s2 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
    "aria-live": s2,
    className: "scoped-error",
    role: s2 === "assertive" ? "alert" : "status",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
        className: "text-heading",
        children: e3
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
        className: "text-body",
        children: r
      }),
      i === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
        className: "text-code",
        children: ["Correlation: ", i]
      }),
      a2 && o2 !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
        className: "action-control",
        onClick: o2,
        type: "button",
        children: "Retry"
      }) : null
    ]
  });
}
function de({ slice: e3 }) {
  if (e3.value === void 0) return null;
  let r = A(e3.value), i = ` ${e3.value.unit}`, a2 = r.display.endsWith(i) ? r.display.slice(0, -i.length) : r.display;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "metric-value",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
        className: "metric-number",
        children: a2
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
        className: "metric-unit",
        children: e3.value.unit
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
        className: "numeric-exact",
        children: ["Exact value: ", r.exact]
      })
    ]
  });
}
function fe({ slice: e3 }) {
  let r = Object.entries(e3.measures), i = [
    ["Numerator", e3.numerator],
    ["Denominator", e3.denominator],
    ["Contributing", e3.contributing_count]
  ].filter((e4) => e4[1] !== void 0);
  return r.length === 0 && i.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
    className: "metric-measures",
    children: [r.map(([e4, r2]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: e4 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
      className: "numeric-exact",
      children: r2
    })] }, e4)), i.map(([e4, r2]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: e4 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
      className: "numeric-exact",
      children: r2
    })] }, e4))]
  });
}
function pe({ slice: e3 }) {
  let r = Object.entries(e3.compatibility);
  return e3.state !== "INCOMPATIBLE" || r.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
    "aria-label": "Incompatible coordinates",
    className: "status-reading",
    children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mismatch coordinates" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: r.map(([e4, r2]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
      className: "text-code",
      children: [
        e4,
        "=",
        r2
      ]
    }) }, e4)) })]
  });
}
function V({ coordinate: r, content: i, visualization: a2, onExplain: o2, onEvidence: s2, onRecover: c2, focusEvidenceAction: l2 = false, recoveryLabel: u2 = "Recover result" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
    "aria-label": r,
    className: "metric-frame",
    children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
      className: "metric-frame-header",
      children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
        className: "text-heading metric-coordinate",
        children: r
      }), i.tag === "RESULT" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(oe, {
        reading: i.slice.reading,
        state: i.slice.state,
        withholdingReason: i.slice.withholding_reason
      }) : null]
    }), i.tag === "LOADING" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
      "aria-live": "polite",
      className: "loading-state",
      role: "status",
      children: "Loading metric\u2026"
    }) : i.tag === "ERROR" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(B, {
      announce: "assertive",
      detail: i.detail,
      onRetry: i.onRetry,
      retryable: i.retryable,
      title: "Metric request failed"
    }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(de, { slice: i.slice }),
      i.slice.value === void 0 ? null : a2,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(fe, { slice: i.slice }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(pe, { slice: i.slice }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(le, { coverage: i.slice.coverage }),
      i.slice.missing_inputs.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
        className: "status-reading",
        children: ["Missing inputs: ", i.slice.missing_inputs.join(", ")]
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
        className: "metric-actions",
        children: [
          i.slice.value !== void 0 || c2 === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
            className: "action-control",
            onClick: c2,
            type: "button",
            children: u2
          }),
          o2 === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
            className: "action-control",
            onClick: (e3) => o2(e3.currentTarget),
            type: "button",
            children: "Metric explanation"
          }),
          s2 === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
            autoFocus: l2,
            className: "action-control",
            onClick: (e3) => s2(e3.currentTarget),
            type: "button",
            children: "View evidence"
          })
        ]
      })
    ] })]
  });
}
function he({ onExplain: e3, onEvidence: r, focusEvidenceAction: i = false }) {
  return e3 === void 0 && r === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
    className: "metric-actions",
    children: [e3 === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
      className: "action-control",
      onClick: (t2) => e3(t2.currentTarget),
      type: "button",
      children: "Metric explanation"
    }), r === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
      autoFocus: i,
      className: "action-control",
      onClick: (e4) => r(e4.currentTarget),
      type: "button",
      children: "View evidence"
    })]
  });
}
function ge({ coordinate: e3, slices: r, label: i = "Result data" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: "bounded-table",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
      "aria-label": `${i}: ${e3}`,
      className: "visual-data-table",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", { children: i }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Slice"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "State"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Exact value"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Result population"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Measures"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Coverage"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Compatibility"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Limitations"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Provenance"
          })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: r.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
            className: "numeric-exact",
            children: JSON.stringify(e4.slice_key)
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e4.state }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
            className: "numeric-exact",
            children: e4.value === void 0 ? e4.withholding_reason : A(e4.value).exact
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
            className: "numeric-exact",
            children: [e4.numerator === void 0 || e4.denominator === void 0 ? "Not published" : `${e4.numerator} / ${e4.denominator}`, e4.contributing_count === void 0 ? null : ` \xB7 Contributing: ${e4.contributing_count}`]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
            className: "numeric-exact",
            children: Object.keys(e4.measures).length === 0 ? "None" : JSON.stringify(e4.measures)
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
            className: "numeric-exact",
            children: e4.coverage === null ? "Unavailable" : `${e4.coverage.state} \xB7 ${e4.coverage.numerator} / ${e4.coverage.denominator} \xB7 ${e4.coverage.raw_ratio ?? "not applicable"}${e4.coverage.alert === null ? "" : ` \xB7 ${e4.coverage.alert}`}`
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
            className: "numeric-exact",
            children: Object.keys(e4.compatibility).length === 0 ? "None" : JSON.stringify(e4.compatibility)
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: [
            ...e4.exclusions.map((e6) => `Excluded: ${e6}`),
            ...e4.missing_inputs.map((e6) => `Missing: ${e6}`),
            ...e4.reading === void 0 ? [] : [e4.reading]
          ].join(" \xB7 ") || "None" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
            className: "numeric-exact",
            children: e4.provenance_refs.join(", ") || "None"
          })
        ] }, JSON.stringify(e4.slice_key))) })
      ]
    })
  });
}
function _e(e3) {
  let [t2, n2 = "1"] = e3.split("/");
  try {
    let e4 = BigInt(t2), r = BigInt(n2);
    return r > 0n && e4 >= 0n && e4 <= r;
  } catch {
    return false;
  }
}
function ve({ slice: e3 }) {
  if (e3.value?.kind !== "RATIO") return null;
  let [i, a2] = e3.value.value.split("/"), o2 = BigInt(a2 ?? "1"), s2 = Number(BigInt(i) * 10000n / o2), c2 = linear2().domain([0, 1e4]).range([8, 198])(s2), l2 = A(e3.value);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "visual-with-fallback",
    children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
      "aria-label": "Ratio bar",
      className: "visual-preview text-data-series-1",
      role: "img",
      viewBox: "0 0 206 70",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: `${l2.display}; exact ${l2.exact}` }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          className: "stroke-border-default",
          d: "M8 35 H198",
          fill: "none"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
          className: "fill-current",
          height: "18",
          width: Math.max(0, c2 - 8),
          x: "8",
          y: "26"
        })
      ]
    }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
      "aria-label": "Ratio bar data",
      className: "visual-data-table",
      children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", { children: "Ratio bar data" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
        scope: "row",
        children: "Exact ratio"
      }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
        className: "numeric-exact",
        children: e3.value.value
      })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
        scope: "row",
        children: "Display percent"
      }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: l2.display })] })] })]
    })]
  });
}
function ye({ slice: e3 }) {
  return e3.value?.kind === "BOOLEAN" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
    "aria-label": "Boolean result",
    className: "status-label",
    role: "status",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
        "aria-hidden": "true",
        children: e3.value.value ? "\u2713" : "\u25CB"
      }),
      " ",
      e3.value.value ? "True" : "False"
    ]
  }) : null;
}
function be({ coordinate: e3, slices: r }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: "bounded-table",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
      "aria-label": `Dashboard result preview: ${e3}`,
      className: "visual-data-table dashboard-result-table",
      children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
          scope: "col",
          children: "Slice"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
          scope: "col",
          children: "State"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
          scope: "col",
          children: "Exact value"
        })
      ] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: r.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
          className: "numeric-exact",
          children: JSON.stringify(e4.slice_key)
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e4.state }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
          className: "numeric-exact",
          children: e4.value === void 0 ? e4.withholding_reason : A(e4.value).exact
        })
      ] }, JSON.stringify(e4.slice_key))) })]
    })
  });
}
function xe({ result: e3, visualizer: r, size: i, onEvidence: a2 }) {
  if (!L(e3)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
    className: "panel-card",
    "data-presentation": "dashboard",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(B, {
      announce: "assertive",
      detail: "The supplied value does not satisfy the formal Metric Result 2.0.0 contract.",
      retryable: false,
      title: "Metric Result incompatible"
    })
  });
  let o2 = `${e3.metric_id}@${e3.metric_version}`, s2 = Object.hasOwn(j, o2) ? j[o2].definition : o2, c2 = r ?? ae(e3), l2 = e3.slices[0];
  if (c2 === "table@1" || e3.slices.length !== 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
    "aria-label": s2,
    className: "dashboard-metric-panel",
    "data-metric-coordinate": o2,
    "data-panel-size": i,
    "data-presentation": "dashboard",
    "data-visualizer": c2,
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
        className: "dashboard-panel-head",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: s2 })
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(be, {
        coordinate: o2,
        slices: e3.slices
      }),
      a2 === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
        className: "dashboard-panel-actions",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(h, {
          onClick: (e4) => a2(e4.currentTarget),
          type: "button",
          children: "View evidence"
        })
      })
    ]
  });
  if (l2 === void 0) return null;
  let u2 = l2.value === void 0 ? void 0 : A(l2.value), d2 = l2.value?.kind === "RATIO" && _e(l2.value.value) ? Number(BigInt(l2.value.value.split("/")[0]) * 10000n / BigInt(l2.value.value.split("/")[1] ?? "1")) / 100 : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
    "aria-label": s2,
    className: "dashboard-metric-panel",
    "data-metric-coordinate": o2,
    "data-panel-size": i,
    "data-presentation": "dashboard",
    "data-scrollable": c2 === "numeric-card@1" ? "false" : void 0,
    "data-visualizer": c2,
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
        className: "dashboard-panel-head",
        children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
          className: "dashboard-panel-title",
          children: s2
        }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(oe, {
          detail: "label",
          reading: l2.reading,
          state: l2.state,
          withholdingReason: l2.withholding_reason
        })]
      }),
      l2.value === void 0 ? l2.coverage === null ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
        className: "dashboard-panel-meta",
        children: [
          l2.coverage.state === "NO_POPULATION" ? "No applicable population" : l2.coverage.state.toLowerCase().replaceAll("_", " "),
          " ",
          "\xB7 ",
          l2.coverage.numerator,
          " / ",
          l2.coverage.denominator
        ]
      }) : c2 === "badge@1" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ye, { slice: l2 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "metric-value",
        children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
          className: "metric-number",
          children: u2?.display
        }), c2 === "ratio-bar@1" || c2 === "numeric-card@1" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
          className: "numeric-exact",
          children: ["Exact value: ", u2?.exact]
        })]
      }),
      c2 === "ratio-bar@1" && d2 !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        "aria-label": `${s2}: ${u2?.display}; exact ${u2?.exact}`,
        className: "dashboard-ratio",
        role: "img",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${d2}%` } })
      }) : null,
      i === "SMALL" || c2 === "numeric-card@1" || l2.numerator === void 0 || l2.denominator === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
        className: "dashboard-panel-meta",
        children: [
          l2.numerator,
          " / ",
          l2.denominator,
          " exact"
        ]
      }),
      a2 === void 0 ? null : c2 === "numeric-card@1" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
        className: "dashboard-panel-actions",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(g, {
          appearance: "ghost",
          "aria-label": "View evidence",
          onClick: (e4) => a2(e4.currentTarget),
          type: "button",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            "aria-hidden": "true",
            className: "dashboard-evidence-icon icon-[tabler--file-search]"
          })
        })
      }) : i === "SMALL" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
        className: "dashboard-panel-actions",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(h, {
          onClick: (e4) => a2(e4.currentTarget),
          type: "button",
          children: "View evidence"
        })
      })
    ]
  });
}
function Se({ result: e3, visualizer: r, onExplain: i, onEvidence: a2, focusEvidenceAction: o2 = false }) {
  if (!L(e3)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
    className: "panel-card",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(B, {
      announce: "assertive",
      detail: "The supplied value does not satisfy the formal Metric Result 2.0.0 contract.",
      retryable: false,
      title: "Metric Result incompatible"
    })
  });
  let s2 = r ?? ae(e3), c2 = `${e3.metric_id}@${e3.metric_version}`;
  return e3.slices.every((e4) => e4.value === void 0 || ie(e4).includes(s2) && (s2 !== "ratio-bar@1" || e4.value.kind === "RATIO" && _e(e4.value.value))) ? s2 === "table@1" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
    className: "panel-card",
    children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ge, {
      coordinate: c2,
      slices: e3.slices
    }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(he, {
      focusEvidenceAction: o2,
      onEvidence: a2,
      onExplain: i
    })]
  }) : e3.slices.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(V, {
    content: {
      tag: "RESULT",
      slice: e4
    },
    coordinate: c2,
    onEvidence: a2,
    onExplain: i,
    focusEvidenceAction: o2,
    visualization: s2 === "ratio-bar@1" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ve, { slice: e4 }) : s2 === "badge@1" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ye, { slice: e4 }) : void 0
  }, JSON.stringify(e4.slice_key))) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
    className: "panel-card",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(B, {
        announce: "polite",
        detail: `${s2} cannot consume the published Result shape without inventing a domain or value.`,
        retryable: false,
        title: "Visualizer binding incompatible"
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ge, {
        coordinate: c2,
        label: "Fallback result data",
        slices: e3.slices
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(he, {
        focusEvidenceAction: o2,
        onEvidence: a2,
        onExplain: i
      })
    ]
  });
}
function Ce({ label: e3, coordinate: r, slice: i, error: a2, ownsError: o2, onRetry: s2, onExplain: c2, onEvidence: l2, focusEvidenceAction: u2, visualizer: d2 }) {
  let f = r.lastIndexOf("@"), p = i === void 0 ? void 0 : {
    metric_id: r.slice(0, f),
    metric_version: "2.0.0",
    slices: [i]
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
    "aria-label": `${e3} result`,
    className: "compare-side",
    children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
      className: "text-label",
      children: e3
    }), p === void 0 ? a2 !== void 0 && o2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(B, {
      announce: "assertive",
      detail: `${a2.code}: ${a2.detail}`,
      onRetry: s2,
      retryable: a2.retryable,
      title: `${e3} unavailable`
    }) : a2 === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
      className: "empty-state",
      children: "No matching slice on this side."
    }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
      className: "status-reading",
      children: [
        e3,
        " side unresolved: ",
        a2.code
      ]
    }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Se, {
      result: p,
      visualizer: d2,
      focusEvidenceAction: u2,
      onEvidence: l2,
      onExplain: c2
    })]
  });
}
function we({ delta: e3 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
    "aria-label": "Delta result",
    className: "compare-delta",
    children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
      className: "text-label",
      children: "Delta"
    }), e3.state === "AVAILABLE" && e3.value !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "status-stack",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
          className: "metric-number",
          children: A(e3.value).display
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
          className: "status-reading",
          children: e3.direction === "INCREASE" ? "Increase" : e3.direction === "DECREASE" ? "Decrease" : "No change"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
          className: "numeric-exact",
          children: ["Exact delta: ", A(e3.value).exact]
        })
      ]
    }) : e3.state === "SIDE_UNRESOLVED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
      className: "status-reading",
      children: "Delta unavailable until both sides resolve"
    }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
      className: "status-reading",
      children: ["Delta withheld: ", e3.withholding_reason]
    })]
  });
}
function Te({ coordinate: e3, before: r, after: i, beforeError: a2, afterError: o2, delta: s2, onRetryFailedSide: c2, ownsFailedSide: l2 = true, focusEvidenceSide: u2, onExplain: d2, onEvidence: f, visualizer: p = "numeric-card@1" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
    "aria-label": `Compare ${e3}`,
    className: "compare-result",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ce, {
        coordinate: e3,
        error: a2,
        focusEvidenceAction: u2 === "left",
        label: "Before",
        ownsError: l2,
        onEvidence: f === void 0 ? void 0 : (e4) => f("left", e4),
        onExplain: d2 === void 0 ? void 0 : (e4) => d2("left", e4),
        onRetry: a2 === void 0 ? void 0 : c2,
        slice: r,
        visualizer: p
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ce, {
        coordinate: e3,
        error: o2,
        focusEvidenceAction: u2 === "right",
        label: "After",
        ownsError: l2,
        onEvidence: f === void 0 ? void 0 : (e4) => f("right", e4),
        onExplain: d2 === void 0 ? void 0 : (e4) => d2("right", e4),
        onRetry: o2 === void 0 ? void 0 : c2,
        slice: i,
        visualizer: p
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(we, { delta: s2 })
    ]
  });
}
function Ee({ values: e3 }) {
  let n2 = Object.entries(e3);
  return n2.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "None" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: n2.map(([e4, t2]) => `${e4}=${t2}`).join(", ") });
}
function De({ membership: e3 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
      className: "text-code",
      children: e3.delivery_id
    }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Recorded ", e3.recorded_at] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Observation profile ", e3.profile_version] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
      className: "text-code",
      children: ["Source ", e3.source_identity]
    }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
      className: "text-code",
      children: ["Manifest ", e3.manifest_digest]
    }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
      className: "text-code",
      children: ["Accepted ", e3.accepted_digest]
    })
  ] });
}
function ke({ population: e3 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
    className: "text-heading",
    children: "Task population"
  }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
    className: "detail-rows",
    children: e3.map((e4) => {
      let r = e4.display_name?.trim();
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: r || e4.task_id }),
        r ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
          className: "text-code",
          children: e4.task_id
        }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [e4.memberships.length, " Delivery memberships"] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Cohort: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ee, { values: e4.cohort_coordinates })] }),
        e4.terminal_reading === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Terminal reading: ", e4.terminal_reading] }),
        e4.exclusions.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Exclusions: ", e4.exclusions.join(", ")] }),
        e4.memberships.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
          className: "detail-rows",
          children: e4.memberships.map((e6) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(De, { membership: e6 }, e6.delivery_id))
        })
      ] }, e4.task_id);
    })
  })] });
}
function Ae({ resolution: e3 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e3.state }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
      className: "text-code",
      children: [
        e3.package_name,
        "@",
        e3.exact_package_version
      ]
    }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
      "Workflow ",
      e3.workflow_id,
      "@",
      e3.workflow_version
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Snapshot ", e3.snapshot_id] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
      className: "text-code",
      children: ["Snapshot digest ", e3.snapshot_digest]
    }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
      className: "text-code",
      children: ["Package digest ", e3.package_digest]
    }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
      className: "text-code",
      children: ["Manifest ", e3.manifest_digest]
    }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
      className: "text-code",
      children: ["Manifest projection ", e3.manifest_projection_digest]
    }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
      className: "text-code",
      children: ["Accepted ", e3.accepted_digest]
    }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Observation profile ", e3.profile_version] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
      className: "text-code",
      children: ["Source ", e3.source_identity]
    }),
    e3.matched_source_id === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e3.matched_source_id }),
    e3.matched_source_index === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Matched source index ", e3.matched_source_index] }),
    e3.matched_repository === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
      className: "text-code",
      children: e3.matched_repository
    }),
    e3.validated_archive_digest === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
      className: "text-code",
      children: ["Validated archive ", e3.validated_archive_digest]
    }),
    e3.validated_package_digest === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
      className: "text-code",
      children: ["Validated package ", e3.validated_package_digest]
    }),
    e3.validated_snapshot_digest === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
      className: "text-code",
      children: ["Validated snapshot ", e3.validated_snapshot_digest]
    }),
    e3.attempts.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
      className: "detail-rows",
      children: e3.attempts.map((e4, r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e4.code }),
        e4.source_id === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e4.source_id }),
        e4.source_index === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Source index ", e4.source_index] }),
        e4.message === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e4.message }),
        e4.omitted_count === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Omitted attempts ", e4.omitted_count] })
      ] }, `${e4.source_id ?? "unknown"}:${e4.code}:${r}`))
    })
  ] });
}
function je({ receipt: e3, side: r }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
    className: "detail-view",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
          className: "text-label text-content-muted",
          children: [r, " result"]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
          className: "text-heading",
          children: "Evaluation receipt"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "text-body",
          children: "This response audit record describes Evolution\u2019s resolved read set. It is not proof of causation and is not a pre-created manifest."
        })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
        className: "detail-list",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Context / selection versions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
            e3.context_version,
            " / ",
            e3.selection.selection_version
          ] })] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Canonical task selection" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
            className: "numeric-exact",
            children: e3.selection.task_ids.join(", ")
          })] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Population state" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: e3.population_state })] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Logical cutoff" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
            className: "numeric-exact",
            children: e3.as_of
          })] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Resolved at" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
            className: "numeric-exact",
            children: e3.resolved_at
          })] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Catalog" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
            className: "numeric-exact",
            children: [
              e3.catalog.catalog_id,
              "@",
              e3.catalog.version
            ]
          })] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Catalog semantic digest" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
            className: "numeric-exact",
            children: e3.catalog.semantic_digest
          })] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Catalog observation profile" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: e3.catalog.observation_profile })] })
        ]
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ke, { population: e3.task_population }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
        className: "text-heading",
        children: "Evidence bindings"
      }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
        className: "detail-rows",
        children: e3.evidence_bindings.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
            className: "text-code",
            children: e4.route
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Filter: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ee, { values: e4.canonical_filter })] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Contract revision ", e4.contract_revision] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Observation profile ", e4.observation_profile] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Read model revision ", e4.read_model_revision] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e4.completion_state }),
          e4.error_state === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e4.error_state }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
            className: "text-code",
            children: e4.route_snapshot
          })
        ] }, `${e4.route}:${e4.route_snapshot}`))
      })] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
        className: "text-heading",
        children: "Resolved input references"
      }), e3.input_refs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
        className: "text-body",
        children: "No input references."
      }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
        className: "detail-rows",
        children: e3.input_refs.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e4.kind }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
            className: "text-code",
            children: e4.identity
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
            className: "text-code",
            children: e4.provenance_ref
          })
        ] }, `${e4.kind}:${e4.identity}`))
      })] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
        className: "text-heading",
        children: "Workflow resolutions"
      }), e3.workflow_resolutions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
        className: "text-body",
        children: "No Workflow resolutions."
      }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
        className: "detail-rows",
        children: e3.workflow_resolutions.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ae, { resolution: e4 }, e4.manifest_digest))
      })] })
    ]
  });
}
var Me = [
  {
    id: "result",
    label: "Result evidence"
  },
  {
    id: "related",
    label: "Related Facts"
  },
  {
    id: "read-set",
    label: "Resolved read set"
  }
];
var Ne = {
  result: "Exact provenance identities cited by this Metric Result; non-Fact detail may remain unresolved.",
  related: "Related Facts match the context but are not claimed as calculation contributors.",
  "read-set": "Every bounded identity recorded by this receipt; this view only hydrates matching Fact rows."
};
function Pe({ rows: e3 }) {
  return e3.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: "table-scroll",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
      "aria-label": "Receipt identities",
      className: "evidence-table",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", { children: "Receipt identities" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Kind"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Identity"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Provenance"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Detail state"
          })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: e3.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e4.kind }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
            className: "text-code",
            children: e4.identity
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
            className: "text-code",
            children: e4.provenance
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e4.loadedAsFact ? "Loaded as Fact row" : "Identity retained; detail not loaded by Facts query" })
        ] }, `${e4.kind}:${e4.identity}:${e4.provenance}`)) })
      ]
    })
  });
}
function Fe({ scope: r, rows: i, focusedFactId: a2, onOpenTrace: o2 }) {
  let s2 = Me.find((e3) => e3.id === r).label;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: "table-scroll",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
      className: "evidence-table",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("caption", { children: [s2, " Facts"] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Fact"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Coordinates"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Provenance and lifecycle"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
            scope: "col",
            children: "Recorded Trace"
          })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: i.map((r2) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
          "aria-current": a2 === r2.factId ? "true" : void 0,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
              className: "text-code",
              children: r2.factId
            }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r2.factClass })] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: Object.entries(r2.coordinates).map(([e3, t2]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
              className: "text-code",
              children: [
                e3,
                "=",
                t2
              ]
            }, e3)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
              className: "text-code",
              children: r2.provenance
            }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(z, { truth: r2.truth })] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r2.trace === void 0 ? "No Trace reference" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [r2.trace.state === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Trace lifecycle not loaded" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(z, { traceState: r2.trace.state }), o2 === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
              className: "text-code",
              children: [r2.trace.traceId, r2.trace.spanId === void 0 ? "" : ` / ${r2.trace.spanId}`]
            }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
              className: "link-control",
              onClick: () => o2(r2.trace.traceId, r2.trace.spanId),
              type: "button",
              children: [
                "Open ",
                r2.trace.traceId,
                r2.trace.spanId === void 0 ? "" : ` / ${r2.trace.spanId}`
              ]
            })] }) })
          ]
        }, r2.factId)) })
      ]
    })
  });
}
function Ie({ scope: r, state: i, rows: a2, references: o2 = [], focusedFactId: s2, onScopeChange: c2, onOpenTrace: l2 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
    className: "evidence-console",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
        className: "text-heading",
        children: "Evidence Console"
      }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
        className: "text-body",
        children: "Read-only Fact and recorded Trace drill-down."
      })] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
        "aria-label": "Evidence scope",
        className: "scope-tabs",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: Me.map((e3) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
          "aria-current": r === e3.id ? "page" : void 0,
          className: "scope-tab",
          onClick: () => c2?.(e3.id),
          type: "button",
          children: e3.label
        }) }, e3.id)) })
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
        className: "scope-note",
        children: Ne[r]
      }),
      i.tag === "LOADING" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
        "aria-live": "polite",
        role: "status",
        children: "Loading Evidence\u2026"
      }) : i.tag === "ERROR" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(B, {
        announce: "assertive",
        detail: i.detail,
        onRetry: i.onRetry,
        retryable: i.onRetry !== void 0,
        title: "Evidence query failed"
      }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        i.tag === "EMPTY" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "empty-state",
          children: "No Evidence in this scope"
        }) : null,
        i.tag === "PARTIAL" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "status-banner status-attention",
          children: "Partial Evidence data"
        }) : null,
        i.tag === "EXPIRED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "status-banner status-expired",
          children: "Evidence detail expired"
        }) : null,
        a2.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fe, {
          focusedFactId: s2,
          onOpenTrace: l2,
          rows: a2,
          scope: r
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pe, { rows: o2 })
      ] })
    ]
  });
}
var Re = (0, import_react.memo)(function({ model: e3 }) {
  let r = /* @__PURE__ */ new Map();
  for (let t2 of e3.depthGroups) {
    let e4 = t2.nodes.map((e6) => e6.endpointId ?? e6.id), n2 = point().domain(e4).range([80, 880]);
    for (let e6 of t2.nodes) {
      let i = e6.endpointId ?? e6.id;
      r.set(i, {
        x: n2(i) ?? 480,
        y: 60 + t2.depth * 120
      });
    }
  }
  let a2 = Math.max(120, e3.depthGroups.length * 120), o2 = (e4, n2) => {
    let i = r.get(e4.sourceId), a3 = r.get(e4.targetId);
    return i === void 0 || a3 === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
      className: `recorded-graph-${n2}`,
      "data-kind": n2 === "parent" ? "PARENT_EDGE" : "LINK",
      x1: i.x,
      x2: a3.x,
      y1: i.y,
      y2: a3.y
    }, `${n2}:${e4.id}`);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: "recorded-graph-frame",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
      "aria-label": "Recorded parent structure graph",
      className: "recorded-graph",
      role: "img",
      viewBox: `0 0 960 ${a2}`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: "Recorded parent structure graph" }),
        e3.parentEdges.map((e4) => o2(e4, "parent")),
        e3.links.map((e4) => o2(e4, "link")),
        e3.depthGroups.flatMap((e4) => e4.nodes.map((e6) => {
          let i = r.get(e6.endpointId ?? e6.id);
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
            transform: `translate(${i.x} ${i.y})`,
            children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
              className: "recorded-graph-node",
              r: "10"
            }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
              className: "recorded-graph-label",
              textAnchor: "middle",
              y: "28",
              children: e6.label
            })]
          }, e6.endpointId ?? e6.id);
        }))
      ]
    })
  });
}, ze);
function ze(e3, t2) {
  return e3.model.depthGroups === t2.model.depthGroups && e3.model.parentEdges === t2.model.parentEdges && e3.model.links === t2.model.links;
}
function We(e3, t2) {
  return !(e3.i === t2.i || e3.x + e3.w <= t2.x || e3.x >= t2.x + t2.w || e3.y + e3.h <= t2.y || e3.y >= t2.y + t2.h);
}
function Ge(e3, t2) {
  for (let n2 = 0; n2 < e3.length; n2++) {
    let r = e3[n2];
    if (r !== void 0 && We(r, t2)) return r;
  }
}
function Ke(e3) {
  return [...e3].sort((e4, t2) => e4.y === t2.y ? e4.x - t2.x : e4.y - t2.y);
}
function qe(e3) {
  return [...e3].sort((e4, t2) => e4.x === t2.x ? e4.y - t2.y : e4.x - t2.x);
}
function Je(e3) {
  let t2 = 0;
  for (let n2 = 0; n2 < e3.length; n2++) {
    let r = e3[n2];
    if (r !== void 0) {
      let e4 = r.y + r.h;
      e4 > t2 && (t2 = e4);
    }
  }
  return t2;
}
function Ye(e3) {
  return e3.filter((e4) => e4.static === true);
}
function Xe(e3) {
  return {
    i: e3.i,
    x: e3.x,
    y: e3.y,
    w: e3.w,
    h: e3.h,
    minW: e3.minW,
    maxW: e3.maxW,
    minH: e3.minH,
    maxH: e3.maxH,
    moved: !!e3.moved,
    static: !!e3.static,
    isDraggable: e3.isDraggable,
    isResizable: e3.isResizable,
    resizeHandles: e3.resizeHandles,
    constraints: e3.constraints,
    isBounded: e3.isBounded
  };
}
function Ze(e3) {
  let t2 = Array(e3.length);
  for (let n2 = 0; n2 < e3.length; n2++) {
    let r = e3[n2];
    r !== void 0 && (t2[n2] = Xe(r));
  }
  return t2;
}
function et(e3, t2, n2, r, i) {
  let a2 = r === "x" ? "w" : "h";
  t2[r] += 1;
  let o2 = e3.findIndex((e4) => e4.i === t2.i), s2 = i ?? Ye(e3).length > 0;
  for (let i2 = o2 + 1; i2 < e3.length; i2++) {
    let o3 = e3[i2];
    if (o3 !== void 0 && !o3.static) {
      if (!s2 && o3.y > t2.y + t2.h) break;
      We(t2, o3) && et(e3, o3, n2 + t2[a2], r, s2);
    }
  }
  t2[r] = n2;
}
function tt(e3, t2, n2, r) {
  for (t2.x = Math.max(t2.x, 0), t2.y = Math.max(t2.y, 0), t2.y = Math.min(r, t2.y); t2.y > 0 && !Ge(e3, t2); ) t2.y--;
  let i;
  for (; (i = Ge(e3, t2)) !== void 0; ) et(n2, t2, i.y + i.h, "y");
  return t2.y = Math.max(t2.y, 0), t2;
}
function nt(e3, t2, n2, r) {
  for (t2.x = Math.max(t2.x, 0), t2.y = Math.max(t2.y, 0); t2.x > 0 && !Ge(e3, t2); ) t2.x--;
  let i;
  for (; (i = Ge(e3, t2)) !== void 0; ) if (et(r, t2, i.x + i.w, "x"), t2.x + t2.w > n2) for (t2.x = n2 - t2.w, t2.y++; t2.x > 0 && !Ge(e3, t2); ) t2.x--;
  return t2.x = Math.max(t2.x, 0), t2;
}
var rt = {
  type: "vertical",
  allowOverlap: false,
  compact(e3, t2) {
    let n2 = Ye(e3), r = Je(n2), i = Ke(e3), a2 = Array(e3.length);
    for (let t3 = 0; t3 < i.length; t3++) {
      let o2 = i[t3];
      if (o2 === void 0) continue;
      let s2 = Xe(o2);
      s2.static || (s2 = tt(n2, s2, i, r), r = Math.max(r, s2.y + s2.h), n2.push(s2));
      let c2 = e3.indexOf(o2);
      a2[c2] = s2, s2.moved = false;
    }
    return a2;
  }
};
var it = {
  type: "horizontal",
  allowOverlap: false,
  compact(e3, t2) {
    let n2 = Ye(e3), r = qe(e3), i = Array(e3.length);
    for (let a2 = 0; a2 < r.length; a2++) {
      let o2 = r[a2];
      if (o2 === void 0) continue;
      let s2 = Xe(o2);
      s2.static || (s2 = nt(n2, s2, t2, r), n2.push(s2));
      let c2 = e3.indexOf(o2);
      i[c2] = s2, s2.moved = false;
    }
    return i;
  }
};
var at = {
  type: null,
  allowOverlap: false,
  compact(e3, t2) {
    return Ze(e3);
  }
};
({ ...rt }, { ...it }), { ...at };
var ot = [
  "role-template-rework-rate@2.0.0",
  "role-template-trajectory-partial-cost@2.0.0",
  "role-model-task-outcome-rate@2.0.0",
  "operational-latency-ms@2.0.0",
  "trajectory-partial-cost@2.0.0",
  "task-cohort-comparison-eligibility@2.0.0",
  "delivery-stage-reach@2.0.0",
  "delivery-terminal-outcome-rate@2.0.0",
  "delivery-cycle-time-ms@2.0.0",
  "operational-token-usage@2.0.0",
  "operational-attributable-cost@2.0.0",
  "operational-usage-availability@2.0.0"
];
new TextEncoder();
var dt = (e3, t2) => ({
  panel_id: e3.slice(0, e3.lastIndexOf("@")),
  metric_coordinate: e3,
  visualizer: "table@1",
  size: "WIDE",
  channels: { "published-result": "slices" },
  transforms: [
    "DISPLAY_ROUNDING",
    "RATIO_TO_PERCENT",
    "STABLE_AUTHORITATIVE_SORT"
  ],
  grid: t2
});
dt("delivery-stage-reach@2.0.0", {
  x: 0,
  y: 2,
  w: 3,
  h: 2
}), dt("operational-token-usage@2.0.0", {
  x: 0,
  y: 4,
  w: 3,
  h: 2
}), ot.map((e3, t2) => dt(e3, {
  x: 0,
  y: t2 * 2,
  w: 3,
  h: 2
}));
var bt = (e3, t2) => e3 < t2 ? -1 : +(e3 > t2);
var xt = 6;
var St = /* @__PURE__ */ new Set();
function U(e3, t2) {
  let n2 = BigInt(t2);
  return n2 <= 0n ? 0 : Number(BigInt(e3) * 10000n / n2) / 100;
}
function W(e3) {
  let t2 = BigInt(e3);
  return t2 >= 1000000000n ? `${Number(t2 / 1000000n) / 1e3} s` : t2 >= 1000000n ? `${Number(t2 / 1000n) / 1e3} ms` : t2 >= 1000n ? `${Number(t2) / 1e3} \u03BCs` : `${e3} ns`;
}
function G(e3) {
  let t2 = BigInt(e3);
  return t2 === 0n ? "0 ms" : t2 < 1000000n ? "<1 ms" : W(e3);
}
function Ct(e3, t2) {
  return String(BigInt(e3) * BigInt(Math.round(t2 * 100)) / 10000n);
}
function wt(e3) {
  let t2 = BigInt(e3) / 1000000n;
  return t2 < 86400000n ? W(e3) : new Date(Number(t2)).toISOString().slice(11, 23);
}
function Tt(e3) {
  return e3.length <= 12 ? e3 : `${e3.slice(0, 8)}\u2026${e3.slice(-4)}`;
}
function Et(e3, t2) {
  return e3.nodes.filter((e4) => e4.parentId === t2.id);
}
function Dt() {
  let e3 = "(max-width: 40rem)", [t2, n2] = (0, import_react.useState)(() => typeof matchMedia == "function" && matchMedia(e3).matches);
  return (0, import_react.useEffect)(() => {
    if (typeof matchMedia != "function") return;
    let t3 = matchMedia(e3), r = () => n2(t3.matches);
    return r(), t3.addEventListener("change", r), () => t3.removeEventListener("change", r);
  }, []), t2;
}
var Ot = 32;
var K = 48;
var kt = 800;
var At = 384;
var jt = 3;
var Mt = 6;
var Nt = 7;
var Pt = 6;
var Ft = 7;
var It = 280;
function Lt(e3, t2, n2) {
  return n2 - t2 >= Mt + e3.length * Nt;
}
function Rt(e3, t2) {
  let n2 = Math.max(0, t2 - 12), r = Math.floor(n2 / Ft);
  return e3.length <= r ? e3 : r <= 0 ? "" : r === 1 ? "\u2026" : `${e3.slice(0, r - 1)}\u2026`;
}
function zt(e3, t2, n2, i) {
  let a2 = t2 * n2[0] / 100, o2 = t2 * n2[1] / 100, s2 = Number(e3.startOffsetNano), c2 = s2 + Number(e3.durationNano), l2 = Math.max(s2, a2), u2 = Math.min(c2, o2), d2 = u2 > l2 && o2 > a2, f = linear2([a2, o2], [0, i]), p = d2 ? f(l2) : 0;
  return {
    visible: d2,
    width: d2 ? Math.max(1, f(u2) - p) : 0,
    x: p
  };
}
function Bt(e3) {
  return e3 > 32 ? 0.5 : e3 > 16 ? 1 : 2;
}
function Vt(e3) {
  let t2 = (0, import_react.useRef)(null), [n2, r] = (0, import_react.useState)(e3);
  return (0, import_react.useEffect)(() => {
    let e4 = t2.current;
    if (e4 === null) return;
    let n3 = () => {
      let t3 = e4.getBoundingClientRect().width;
      t3 > 0 && r(t3);
    };
    if (n3(), typeof ResizeObserver != "function") return;
    let i = new ResizeObserver(n3);
    return i.observe(e4), () => i.disconnect();
  }, []), [t2, n2];
}
function Ht({ node: e3, trace: r, children: i }) {
  let a2 = Object.fromEntries(e3.fields.map(({ field: e4, value: t2 }) => [e4, t2])), o2 = r === void 0 ? [] : Et(r, e3), s2 = r === void 0 ? [] : r.links.filter((t2) => t2.from.span_id === e3.id || t2.to.span_id === e3.id);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
    "aria-label": "Span passport",
    className: "span-passport",
    "data-testid": "span-passport",
    children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
      className: "trace-passport-head",
      children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Span Passport" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Exact focus" })]
    }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "trace-passport-body",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "trace-passport-title",
          children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            "aria-hidden": "true",
            className: `trace-passport-sigil trace-kind-${e3.kind.toLowerCase()}${e3.status === "ERROR" ? " trace-status-error" : ""}`,
            children: e3.kind === "CLIENT" ? "\u2197" : "\u25C6"
          }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
            className: "trace-passport-name",
            children: e3.label
          }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: `${e3.kind} \xB7 depth ${e3.depth}` })] })]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
          className: "trace-passport-grid",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Identity" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
              className: "text-code",
              children: `${e3.endpoint.trace_id} / ${e3.endpoint.span_id}`
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Recorded start / end" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
              className: "numeric-exact",
              children: `${e3.startTimeUnixNano} \u2192 ${e3.endTimeUnixNano} ns`
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Recorded duration" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
              className: "numeric-exact",
              children: `${W(e3.durationNano)} \xB7 ${e3.durationNano} ns exact`
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Status / truth" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: `${e3.status} \xB7 ${e3.truth.completeness ?? "UNKNOWN"} \xB7 ${e3.truth.availability}` }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Parent / children" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: `${e3.parentId ?? "root"} \u2192 ${o2.map(({ label: e4 }) => e4).join(", ") || "no recorded child"}` }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Flags / trace state" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
              className: "text-code",
              children: `${e3.flags} \xB7 ${e3.traceState ?? "none"}`
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Recorded fields" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
              className: "text-code",
              children: JSON.stringify(a2)
            })
          ]
        }),
        s2.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "trace-link-receipt",
          children: `${s2.length} independent recorded LINK${s2.length === 1 ? "" : "s"}. LINK does not change tree depth.`
        }),
        i
      ]
    })]
  });
}
function Ut({ trace: e3 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(B, {
    announce: "polite",
    detail: e3.errors.join(" \xB7 ") || "Recorded Trace IR is invalid.",
    retryable: false,
    title: "Recorded Trace unavailable"
  });
}
function Wt({ trace: e3, node: n2 }) {
  let r = n2 ? e3.links.filter((e4) => e4.from.span_id === n2.id || e4.to.span_id === n2.id) : e3.links;
  return r.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
    "aria-label": "Recorded span links",
    className: "trace-link-list trace-sr-only",
    children: r.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
      className: "text-code",
      children: `Recorded LINK \u2192 ${e4.to.trace_id}:${e4.to.span_id}`
    }, e4.id))
  });
}
var Gt = (0, import_react.memo)(function({ node: e3, selected: r, hasChildren: i, collapsed: a2, onToggle: o2, onSelect: s2, positionInSet: c2, setSize: l2 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    "aria-level": e3.depth + 1,
    "aria-posinset": c2,
    "aria-selected": r,
    "aria-setsize": l2,
    className: `trace-waterfall-row${r ? " is-selected" : ""}`,
    "data-testid": "trace-waterfall-row",
    "data-timeline-span-id": e3.id,
    "data-trace-node-id": e3.id,
    "data-virtual-row": c2 - 1,
    onClick: () => s2(e3.id),
    role: "treeitem",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "trace-node-label",
      children: [
        i ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
          "aria-label": `${a2 ? "Expand" : "Collapse"} ${e3.label} descendants`,
          className: "trace-collapse-control",
          "data-testid": "trace-waterfall-collapse",
          "data-trace-node-id": e3.id,
          onClick: (t2) => {
            t2.stopPropagation(), s2(e3.id), o2(e3.id);
          },
          type: "button",
          children: a2 ? "\u25B8" : "\u25BE"
        }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
          "aria-hidden": "true",
          className: "trace-collapse-placeholder"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
          "aria-hidden": "true",
          className: "trace-indent-items",
          "data-indent-depth": e3.depth,
          children: Array.from({ length: e3.depth }, (n2, r2) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
            className: "trace-indent-item",
            "data-guide-depth": r2 % xt,
            "data-guide-owner-id": e3.id,
            "data-testid": "trace-waterfall-indent-guide",
            "data-trace-depth": r2
          }, `${e3.id}:indent:${r2}`))
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
          "aria-label": `${e3.label}, ${e3.durationNano} nanoseconds`,
          className: "recorded-node trace-node-main",
          "data-testid": "trace-waterfall-node",
          "data-trace-node-id": e3.id,
          onClick: (t2) => {
            t2.stopPropagation(), s2(e3.id);
          },
          type: "button",
          children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
            className: "trace-node-title-line",
            children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
              className: `trace-glyph trace-kind-${e3.kind.toLowerCase()}`,
              children: e3.kind === "CLIENT" ? "\u2197" : "\u25C6"
            }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: e3.label })]
          }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: `${e3.kind} \xB7 ${Tt(e3.id)}` })]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
          className: e3.status === "ERROR" ? "trace-error" : "numeric-exact",
          children: W(e3.durationNano)
        })
      ]
    })
  });
});
function Kt({ trace: e3, reducedMotion: i = false, viewNavigation: a2 }) {
  let [f, p] = (0, import_react.useState)(), [h2, v2] = (0, import_react.useState)(""), [y, x2] = (0, import_react.useState)(0), [S2, C2] = (0, import_react.useState)(() => /* @__PURE__ */ new Set()), [w, T] = (0, import_react.useState)([0, 100]), E2 = (0, import_react.useRef)([0, 100]), [D2, O2] = (0, import_react.useState)(() => /* @__PURE__ */ new Map()), k2 = (0, import_react.useRef)(/* @__PURE__ */ new Map()), ee2 = (0, import_react.useId)().replace(/[^a-zA-Z0-9_-]/g, ""), A2 = (0, import_react.useRef)(void 0), j2 = Dt(), [te2, M2] = Vt(kt), N2 = (0, import_react.useCallback)((e4) => p(e4), []), P2 = (0, import_react.useMemo)(() => {
    let t2 = /* @__PURE__ */ new Map(), n2 = /* @__PURE__ */ new Set(), r = 0;
    for (let i2 of e3.nodes) t2.set(i2.id, i2), i2.parentId !== void 0 && n2.add(i2.parentId), i2.status === "ERROR" && (r += 1);
    return {
      errorCount: r,
      nodeById: t2,
      nodesWithChildren: n2
    };
  }, [e3.nodes]), F2 = (0, import_react.useMemo)(() => h2.trim().toLocaleLowerCase(), [h2]), I2 = (0, import_react.useMemo)(() => F2 === "" ? e3.nodes : e3.nodes.filter((e4) => e4.label.toLocaleLowerCase().includes(F2) || e4.id.toLocaleLowerCase().includes(F2)), [F2, e3.nodes]), L2 = (0, import_react.useMemo)(() => F2 !== "" || S2.size === 0 ? I2 : I2.filter((e4) => {
    let t2 = e4.parentId;
    for (; t2 !== void 0; ) {
      if (S2.has(t2)) return false;
      t2 = P2.nodeById.get(t2)?.parentId;
    }
    return true;
  }), [
    S2,
    I2,
    F2,
    P2.nodeById
  ]), ne2 = (0, import_react.useMemo)(() => e3.durationNano === void 0 ? [] : e3.nodes.map((n2, r) => {
    let i2 = U(n2.startOffsetNano, e3.durationNano), a3 = Math.min(100, i2 + U(n2.durationNano, e3.durationNano)), o2 = r + 0.5;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
      className: `trace-minimap-span trace-kind-${n2.kind.toLowerCase()}${n2.status === "ERROR" ? " trace-status-error" : ""}`,
      "data-color-index": n2.depth % xt,
      "data-minimap-row": r,
      "data-testid": "trace-waterfall-minimap-span",
      "data-trace-node-id": n2.id,
      strokeWidth: Bt(e3.nodes.length),
      x1: i2,
      x2: a3,
      y1: o2,
      y2: o2
    }, n2.id);
  }), [e3.durationNano, e3.nodes]);
  if ((0, import_react.useEffect)(() => () => {
    for (let e4 of k2.current.values()) window.clearTimeout(e4);
  }, []), e3.status !== "READY" || e3.durationNano === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ut, { trace: e3 });
  let re3 = P2.nodeById.get(f ?? "") ?? e3.nodes[0], { errorCount: ie2, nodesWithChildren: ae2 } = P2, R2 = (t2, n2) => {
    let r = E2.current;
    if (n2 && t2[0] !== r[0] && !i) {
      let n3 = t2[0] < r[0] ? "right" : "left", i2 = [];
      e3.nodes.forEach((a3, o2) => {
        let s2 = zt(a3, Number(e3.durationNano), r, M2), c2 = zt(a3, Number(e3.durationNano), t2, M2);
        if (s2.visible === c2.visible) return;
        let l2 = c2.visible ? "enter" : "exit", u2 = l2 === "enter" ? c2 : s2;
        i2.push([a3.id, {
          direction: n3,
          phase: l2,
          width: u2.width,
          x: u2.x
        }]);
        let d2 = k2.current.get(a3.id);
        d2 !== void 0 && window.clearTimeout(d2);
        let f2 = window.setTimeout(() => {
          k2.current.delete(a3.id), O2((e4) => {
            if (!e4.has(a3.id)) return e4;
            let t3 = new Map(e4);
            return t3.delete(a3.id), t3;
          });
        }, It + o2 * 18 + 80);
        k2.current.set(a3.id, f2);
      }), i2.length > 0 && O2((e4) => {
        let t3 = new Map(e4);
        for (let [e6, n4] of i2) t3.set(e6, n4);
        return t3;
      });
    }
    E2.current = t2, T(t2);
  }, oe2 = (e4, t2) => {
    let n2 = A2.current;
    if (n2 === void 0) return;
    let r = e4.currentTarget.getBoundingClientRect(), i2 = Math.max(0, Math.min(100, (e4.clientX - r.left) / r.width * 100));
    if (n2.mode === "move") {
      let e6 = n2.zoomStart[1] - n2.zoomStart[0], t3 = Math.max(0, Math.min(100 - e6, n2.zoomStart[0] + i2 - n2.pointerStart));
      R2([t3, t3 + e6], true);
    } else if (n2.mode === "resize-left") R2([Math.min(i2, n2.zoomStart[1] - 1), n2.zoomStart[1]], false);
    else if (n2.mode === "resize-right") R2([n2.zoomStart[0], Math.max(i2, n2.zoomStart[0] + 1)], false);
    else if (n2.mode === "select") {
      let e6 = [Math.min(n2.anchor, i2), Math.max(n2.anchor, i2)];
      e6[1] - e6[0] >= 1 && R2(e6, false);
    }
    t2 && (A2.current = void 0);
  }, se2 = [
    0,
    25,
    50,
    75,
    100
  ], ce2 = Number(e3.durationNano), le2 = ce2 * w[0] / 100, ue2 = ce2 * w[1] / 100, z2 = linear2([le2, ue2], [0, M2]), B2 = z2.ticks(Math.max(2, Math.floor(M2 / 96))), de2 = L2.length * K, fe2 = Math.min(At, de2), pe2 = Math.min(y, Math.max(0, de2 - fe2)), V2 = Math.max(0, Math.floor(pe2 / K) - jt), H = Math.min(L2.length, Math.ceil((pe2 + fe2) / K) + jt), me = L2.slice(V2, H).map((e4, t2) => ({
    node: e4,
    row: V2 + t2
  })), he2 = Ot + fe2, ge2 = me.map(({ node: e4, row: t2 }) => {
    let n2 = zt(e4, ce2, w, M2), r = D2.get(e4.id), i2 = !n2.visible && r?.phase === "exit" ? r : n2;
    return {
      ...n2,
      displayedWidth: i2.width,
      displayedX: i2.x,
      label: Rt(e4.label, i2.width),
      motion: r,
      node: e4,
      row: t2,
      y: Ot + t2 * K - pe2
    };
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
    "aria-label": "Recorded trace waterfall",
    className: "trace-view trace-waterfall",
    "data-motion": i ? "off" : "zoom-transition",
    "data-testid": "trace-waterfall",
    "data-trace-renderer": "waterfall",
    children: [
      a2,
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
        className: "trace-summary trace-summary-dense trace-view-header",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "trace-summary-identity trace-view-header-copy",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                variant: "overline",
                children: "Exact recorded timeline"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                as: "strong",
                variant: "h2",
                children: e3.nodes[0]?.label ?? e3.traceId
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                variant: "caption",
                children: e3.traceId
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            "aria-hidden": "true",
            className: "trace-view-header-spacer"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            className: "trace-summary-metrics trace-view-header-metrics",
            children: [
              [
                "Duration",
                W(e3.durationNano),
                "default"
              ],
              [
                "Start",
                wt(e3.startTimeUnixNano),
                "default"
              ],
              [
                "Spans",
                String(e3.nodes.length),
                "default"
              ],
              [
                "Errors",
                String(ie2),
                ie2 > 0 ? "error" : "success"
              ]
            ].map(([e4, r, i2]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
              className: "trace-summary-stat trace-view-header-stat",
              "data-tone": i2,
              children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                as: "small",
                variant: "caption",
                children: e4
              }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                as: "strong",
                className: "numeric-exact",
                variant: "h2",
                children: r
              })]
            }, e4))
          })
        ]
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
        "aria-label": "Recorded trace minimap",
        className: "trace-minimap",
        children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "trace-minimap-copy",
          children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
            as: "strong",
            variant: "body2",
            weight: "bold",
            children: "Trace minimap"
          }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
            as: "small",
            variant: "caption",
            children: "Drag to zoom"
          })]
        }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          "aria-label": "Trace minimap zoom window",
          "aria-valuemax": 100,
          "aria-valuemin": 0,
          "aria-valuetext": `${W(Ct(e3.durationNano, w[0]))} to ${W(Ct(e3.durationNano, w[1]))}`,
          className: "trace-minimap-track",
          "data-testid": "trace-waterfall-data-zoom",
          onPointerDown: (e4) => {
            let t2 = e4.currentTarget.getBoundingClientRect(), n2 = Math.max(0, Math.min(100, (e4.clientX - t2.left) / t2.width * 100)), r = e4.target instanceof Element && e4.target.closest(".trace-minimap-window") !== null, i2 = (e4.target instanceof Element ? e4.target.closest(".trace-minimap-resize-handle") : null)?.dataset.edge;
            A2.current = i2 === "left" || i2 === "right" ? {
              mode: `resize-${i2}`,
              zoomStart: w
            } : r ? {
              mode: "move",
              pointerStart: n2,
              zoomStart: w
            } : {
              mode: "select",
              anchor: n2
            }, r || R2([n2, n2], false), e4.currentTarget.setPointerCapture?.(e4.pointerId);
          },
          onPointerMove: (e4) => oe2(e4, false),
          onPointerUp: (e4) => oe2(e4, true),
          role: "slider",
          tabIndex: 0,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
              "aria-hidden": "true",
              className: "trace-minimap-ruler",
              "data-testid": "trace-waterfall-data-zoom-ruler",
              children: se2.map((n2) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                "data-time-percent": n2,
                style: { insetInlineStart: `${n2}%` },
                children: W(Ct(e3.durationNano, n2))
              }, n2))
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
              "aria-hidden": "true",
              className: "trace-minimap-overview",
              "data-testid": "trace-waterfall-minimap-overview",
              preserveAspectRatio: "none",
              viewBox: `0 0 100 ${Math.max(1, e3.nodes.length)}`,
              children: ne2
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
              className: "trace-minimap-window",
              "data-full": w[0] === 0 && w[1] === 100 ? "true" : "false",
              "data-testid": "trace-waterfall-data-zoom-window",
              style: {
                insetInlineStart: `${w[0]}%`,
                width: `${w[1] - w[0]}%`
              },
              children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                "aria-label": "Resize trace zoom start",
                className: "trace-minimap-resize-handle",
                "data-edge": "left",
                "data-testid": "trace-waterfall-data-zoom-handle-left",
                role: "separator",
                tabIndex: 0
              }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                "aria-label": "Resize trace zoom end",
                className: "trace-minimap-resize-handle",
                "data-edge": "right",
                "data-testid": "trace-waterfall-data-zoom-handle-right",
                role: "separator",
                tabIndex: 0
              })]
            })
          ]
        })]
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "trace-workbench",
        children: [j2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
          className: "trace-waterfall-mobile",
          children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: "Span tree \xB7 exact duration" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            "aria-label": "Recorded waterfall span outline",
            "data-testid": "trace-waterfall-span-tree",
            role: "tree",
            children: L2.map((n2) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(tn, {
              node: n2,
              onSelect: N2,
              trace: e3
            }, n2.id))
          })]
        }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
          className: "trace-waterfall-canvas",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
              className: "trace-waterfall-toolbar",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                  className: "trace-waterfall-heading",
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                    as: "strong",
                    variant: "body2",
                    weight: "bold",
                    children: "Span tree"
                  })
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(b, {
                  "aria-label": "Search recorded spans",
                  onChange: (e4) => v2(e4.currentTarget.value),
                  placeholder: "Search span name or exact identity",
                  value: h2
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_, {
                  "aria-label": "Span tree actions",
                  className: "trace-waterfall-actions",
                  role: "group",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(g, {
                      appearance: "ghost",
                      "aria-label": "Expand all spans",
                      onClick: () => C2(/* @__PURE__ */ new Set()),
                      type: "button",
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
                        "aria-hidden": "true",
                        viewBox: "0 0 16 16",
                        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4 6 8 2l4 4M4 10l4 4 4-4" })
                      })
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(g, {
                      appearance: "ghost",
                      "aria-label": "Collapse all spans",
                      onClick: () => C2(new Set(ae2)),
                      type: "button",
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
                        "aria-hidden": "true",
                        viewBox: "0 0 16 16",
                        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m4 2 4 4 4-4M4 14l4-4 4 4" })
                      })
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(g, {
                      appearance: "ghost",
                      "aria-label": "Reset focus",
                      onClick: () => {
                        p(e3.nodes[0]?.id), O2(/* @__PURE__ */ new Map()), R2([0, 100], false);
                      },
                      type: "button",
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
                        "aria-hidden": "true",
                        viewBox: "0 0 16 16",
                        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M13 5V2l-2 2A5 5 0 1 0 13 9" })
                      })
                    })
                  ]
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className: "trace-waterfall-table",
              children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                className: "trace-waterfall-label-pane",
                children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                  className: "trace-waterfall-column-head",
                  children: "Span / exact identity"
                }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                  className: "trace-waterfall-scroll-viewport",
                  "data-testid": "trace-waterfall-scroll-viewport",
                  "data-total-rows": L2.length,
                  "data-virtual-end": H,
                  "data-virtual-start": V2,
                  onScroll: (e4) => x2(e4.currentTarget.scrollTop),
                  style: { height: fe2 },
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                    className: "trace-waterfall-scroll-space",
                    style: { height: de2 },
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                      "aria-label": "Recorded waterfall span outline",
                      className: "trace-waterfall-label-rows",
                      "data-testid": "trace-waterfall-span-tree",
                      role: "tree",
                      style: { transform: `translateY(${V2 * K}px)` },
                      children: me.map(({ node: e4, row: n2 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gt, {
                        collapsed: S2.has(e4.id),
                        hasChildren: ae2.has(e4.id),
                        node: e4,
                        onSelect: N2,
                        onToggle: (e6) => C2((t2) => {
                          let n3 = new Set(t2);
                          return n3.has(e6) ? n3.delete(e6) : n3.add(e6), n3;
                        }),
                        positionInSet: n2 + 1,
                        selected: re3.id === e4.id,
                        setSize: L2.length
                      }, e4.id))
                    })
                  })
                })]
              }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
                "aria-label": "Recorded waterfall timeline chart",
                className: "trace-waterfall-chart",
                "data-total-rows": L2.length,
                "data-testid": "trace-waterfall-chart",
                "data-virtual-end": H,
                "data-virtual-start": V2,
                height: he2,
                ref: te2,
                role: "img",
                width: "100%",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: ge2.map(({ displayedWidth: e4, displayedX: n2, node: r, row: i2, y: a3 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", {
                    id: `${ee2}-timeline-label-${i2}`,
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
                      height: 18,
                      rx: 4,
                      width: e4,
                      x: n2,
                      y: a3 + 15
                    })
                  }, `${r.id}:label-clip`)) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
                    className: "trace-waterfall-axis-line",
                    x1: 0,
                    x2: M2,
                    y1: 31,
                    y2: 31
                  }),
                  ge2.map(({ displayedWidth: e4, displayedX: r, motion: i2, node: a3, row: o2, visible: s2, y: c2 }) => {
                    let l2 = re3.id === a3.id;
                    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
                      "aria-label": `${a3.label}, ${W(a3.durationNano)}`,
                      "aria-pressed": l2,
                      className: "trace-waterfall-lane",
                      "data-selected": l2,
                      "data-testid": "trace-waterfall-lane",
                      "data-trace-node-id": a3.id,
                      "data-virtual-row": o2,
                      onClick: () => N2(a3.id),
                      onKeyDown: (e6) => {
                        (e6.key === "Enter" || e6.key === " ") && (e6.preventDefault(), N2(a3.id));
                      },
                      role: "button",
                      tabIndex: 0,
                      children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
                        className: "trace-waterfall-lane-hit-target",
                        height: K,
                        width: M2,
                        x: 0,
                        y: c2
                      }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
                        className: "trace-waterfall-timeline",
                        "data-motion-direction": i2?.direction,
                        "data-motion-phase": i2?.phase,
                        "data-testid": "trace-waterfall-timeline",
                        "data-trace-node-id": a3.id,
                        "data-visible": s2,
                        style: { animationDelay: `${(o2 - V2) * 18}ms` },
                        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
                          className: `trace-timeline-bar trace-kind-${a3.kind.toLowerCase()}${a3.status === "ERROR" ? " trace-status-error" : ""}`,
                          "data-color-index": a3.depth % xt,
                          "data-testid": "trace-waterfall-bar",
                          "data-trace-node-id": a3.id,
                          height: 18,
                          rx: 4,
                          width: e4,
                          x: r,
                          y: c2 + 15,
                          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: a3.label })
                        })
                      })]
                    }, a3.id);
                  }),
                  B2.map((e4, r) => {
                    let i2 = z2(e4), a3 = W(String(Math.round(e4))), o2 = B2[r + 1], s2 = Lt(a3, i2, o2 === void 0 ? M2 : z2(o2));
                    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
                      className: "trace-waterfall-axis-tick",
                      "data-testid": "trace-waterfall-axis-tick",
                      transform: `translate(${i2} 0)`,
                      children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
                        className: "trace-waterfall-gridline",
                        y1: 0,
                        y2: he2
                      }), s2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
                        textAnchor: "start",
                        x: Mt,
                        y: 22,
                        children: a3
                      }) : null]
                    }, e4);
                  }),
                  ge2.map(({ displayedWidth: e4, displayedX: n2, label: r, motion: i2, node: a3, row: o2, y: s2 }) => e4 <= 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
                    clipPath: `url(#${ee2}-timeline-label-${o2})`,
                    className: "trace-timeline-label",
                    "data-motion-direction": i2?.direction,
                    "data-motion-phase": i2?.phase,
                    "data-testid": "trace-waterfall-label",
                    "data-trace-node-id": a3.id,
                    dominantBaseline: "middle",
                    style: { animationDelay: `${(o2 - V2) * 18}ms` },
                    x: n2 + Pt,
                    y: s2 + K / 2,
                    children: r
                  }, `${a3.id}:label`))
                ]
              })]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wt, { trace: e3 })
          ]
        }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ht, {
          node: re3,
          trace: e3
        })]
      })
    ]
  });
}
function qt(e3) {
  let t2 = new Map(e3.nodes.map((e4) => [e4.id, e4])), n2 = /* @__PURE__ */ new Map(), r = (e4, i2 = /* @__PURE__ */ new Set()) => {
    let a2 = n2.get(e4.id);
    if (a2 !== void 0) return a2;
    if (e4.parentId === void 0 || i2.has(e4.id)) return 0;
    let o2 = t2.get(e4.parentId);
    if (o2 === void 0) return 0;
    let s2 = new Set(i2).add(e4.id), c2 = r(o2, s2) + 1;
    return n2.set(e4.id, c2), c2;
  }, i = /* @__PURE__ */ new Map();
  for (let t3 of e3.nodes) {
    let e4 = r(t3), n3 = i.get(e4) ?? [];
    n3.push(t3), i.set(e4, n3);
  }
  return [...i.entries()].flatMap(([e4, t3]) => [...t3].sort((e6, t4) => bt(e6.startTimeUnixNano, t4.startTimeUnixNano) || bt(e6.id, t4.id)).map((n3, r2) => ({
    node: n3,
    column: e4,
    x: 60 + e4 * 330,
    y: t3.length === 1 ? 240 : t3.length === 2 ? 110 + r2 * 245 : 47 + r2 * (368 / (t3.length - 1))
  })));
}
var q = 980;
var J = 560;
var Y2 = 190;
var X2 = 70;
var Jt = {
  x: 0,
  y: 0,
  width: q,
  height: J
};
function Yt(e3) {
  let t2 = Math.min(q, Math.max(392, e3.width)), n2 = Math.min(J, Math.max(224, e3.height));
  return {
    x: Math.round(Math.max(0, Math.min(q - t2, e3.x)) * 1e3) / 1e3,
    y: Math.round(Math.max(0, Math.min(J - n2, e3.y)) * 1e3) / 1e3,
    width: Math.round(t2 * 1e3) / 1e3,
    height: Math.round(n2 * 1e3) / 1e3
  };
}
function Xt(e3, t2) {
  let n2 = e3.width * t2, r = e3.height * t2;
  return Yt({
    x: e3.x + (e3.width - n2) / 2,
    y: e3.y + (e3.height - r) / 2,
    width: n2,
    height: r
  });
}
function Zt(e3) {
  return `${e3.x} ${e3.y} ${e3.width} ${e3.height}`;
}
function Qt(e3, t2, n2) {
  let r = Math.min(e3 / n2.width, t2 / n2.height);
  return {
    scale: r,
    offsetX: (e3 - n2.width * r) / 2,
    offsetY: (t2 - n2.height * r) / 2
  };
}
function $t(e3, t2, n2, r) {
  let i = e3.x + Y2, a2 = e3.y + X2 / 2, o2 = t2?.x ?? 950, s2 = t2 === void 0 ? Math.min(520, a2 + 80) : t2.y + X2 / 2;
  return {
    startX: i,
    startY: a2,
    middleX: (i + o2) / 2,
    endX: o2,
    endY: s2,
    kind: n2,
    focused: r
  };
}
function en(e3, t2) {
  let n2 = Math.abs(e3.middleX - e3.startX), r = Math.abs(e3.endY - e3.startY), i = Math.abs(e3.endX - e3.middleX), a2 = t2 * (n2 + r + i), o2 = (e4, t3, n3) => e4 + (t3 - e4) * n3;
  return a2 <= n2 ? {
    x: o2(e3.startX, e3.middleX, n2 === 0 ? 1 : a2 / n2),
    y: e3.startY
  } : (a2 -= n2, a2 <= r ? {
    x: e3.middleX,
    y: o2(e3.startY, e3.endY, r === 0 ? 1 : a2 / r)
  } : (a2 -= r, {
    x: o2(e3.middleX, e3.endX, i === 0 ? 1 : a2 / i),
    y: e3.endY
  }));
}
function Z(e3, t2, n2) {
  let r = getComputedStyle(e3).getPropertyValue(t2).trim();
  return r === "" ? n2 : r;
}
var tn = (0, import_react.memo)(function({ node: r, trace: i, onSelect: a2, layout: o2, showLinks: s2 = true, compact: c2 = false }) {
  let l2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
    "aria-label": `${r.label}, ${W(r.durationNano)}`,
    "aria-level": (o2?.column ?? r.depth) + 1,
    "data-tree-x": o2?.x,
    "data-tree-y": o2?.y,
    "data-testid": "trace-tree-node",
    "data-trace-node-id": r.id,
    onClick: () => a2(r.id),
    role: "treeitem",
    type: "button",
    children: c2 ? r.label : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: W(r.durationNano) })] })
  });
  return c2 ? l2 : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    style: { paddingInlineStart: `${r.depth * 1.5}rem` },
    children: [l2, s2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wt, {
      node: r,
      trace: i
    }) : null]
  });
});
var nn = (0, import_react.memo)(function({ trace: e3, reducedMotion: r = false, viewNavigation: i }) {
  let [a2, c2] = (0, import_react.useState)(), [f, p] = (0, import_react.useState)("none"), [h2, v2] = (0, import_react.useState)(Jt), y = (0, import_react.useRef)(null), b2 = (0, import_react.useRef)(null), x2 = (0, import_react.useRef)(false), S2 = (0, import_react.useCallback)((e4) => c2(e4), []), C2 = Dt(), w = (0, import_react.useMemo)(() => e3.status === "READY" ? qt(e3) : [], [e3]), T = (0, import_react.useMemo)(() => new Map(w.map((e4) => [e4.node.id, e4])), [w]), E2 = (0, import_react.useMemo)(() => new Map(e3.nodes.map((e4) => [e4.id, e4])), [e3.nodes]), D2 = (0, import_react.useMemo)(() => {
    let t2 = /* @__PURE__ */ new Map();
    for (let n2 of e3.nodes) {
      if (n2.parentId === void 0) continue;
      let e4 = t2.get(n2.parentId);
      e4 === void 0 ? t2.set(n2.parentId, [n2]) : e4.push(n2);
    }
    return t2;
  }, [e3.nodes]), O2 = E2.get(a2 ?? "") ?? e3.nodes[0], k2 = (0, import_react.useRef)(O2?.id);
  (0, import_react.useEffect)(() => {
    k2.current = O2?.id;
  }, [O2?.id]);
  let ee2 = r ? O2?.id : void 0, A2 = (0, import_react.useMemo)(() => {
    if (O2 === void 0) return /* @__PURE__ */ new Set();
    if (f === "none") return St;
    let e4 = /* @__PURE__ */ new Set([O2.id]);
    if (f === "ancestors") {
      let t2 = O2;
      for (; t2.parentId !== void 0; ) {
        e4.add(t2.parentId);
        let n2 = E2.get(t2.parentId);
        if (n2 === void 0) break;
        t2 = n2;
      }
    }
    if (f === "descendants") {
      let t2 = [O2.id];
      for (; t2.length > 0; ) {
        let n2 = t2.shift();
        for (let r2 of D2.get(n2) ?? []) e4.add(r2.id), t2.push(r2.id);
      }
    }
    return e4;
  }, [
    D2,
    f,
    E2,
    O2
  ]), j2 = (0, import_react.useMemo)(() => w.flatMap((e4) => {
    if (e4.node.parentId === void 0) return [];
    let t2 = T.get(e4.node.parentId);
    return t2 === void 0 ? [] : [$t(t2, e4, "parent", f === "none" || A2.has(t2.node.id) && A2.has(e4.node.id))];
  }), [
    T,
    w,
    f,
    A2
  ]), te2 = (0, import_react.useMemo)(() => e3.links.flatMap((e4) => {
    let t2 = T.get(e4.from.span_id);
    return t2 === void 0 ? [] : [$t(t2, T.get(e4.to.span_id), "link", f === "none")];
  }), [
    T,
    f,
    e3.links
  ]), M2 = (0, import_react.useMemo)(() => [...j2, ...te2], [te2, j2]), N2 = j2.length > 128, P2 = (0, import_react.useMemo)(() => {
    let e4 = M2.filter((e6) => e6.focused);
    return N2 ? e4.slice(0, 8) : e4;
  }, [N2, M2]);
  if ((0, import_react.useEffect)(() => {
    let t2 = y.current;
    if (t2 === null || window.CanvasRenderingContext2D === void 0) return;
    let n2 = t2.getContext("2d");
    if (n2 === null) return;
    let i2 = "", a3 = "", o2 = "", s2 = "", c3 = "", l2 = "", u2 = "", d2 = "", p2 = "", m2 = "", g2 = () => {
      i2 = Z(t2, "--surface-raised", "#17212d"), a3 = Z(t2, "--border-strong", "#607084"), o2 = Z(t2, "--content-primary", "#f1f5f9"), s2 = Z(t2, "--content-secondary", "#a9b4c2"), c3 = Z(t2, "--data-series-1", "#38bdf8"), l2 = Z(t2, "--data-series-2", "#2dd4bf"), u2 = Z(t2, "--status-error", "#fb7185"), d2 = Z(t2, "--interaction-accent", "#38bdf8"), p2 = Z(t2, "--border-strong", "#607084"), m2 = Z(t2, "--status-warning", "#fbbf24");
    };
    g2();
    let _2 = e3.durationNano ?? "0", v3 = 0, b3, x3, S3 = (e4) => {
      n2.save(), n2.globalAlpha = e4.focused ? 1 : 0.2, n2.strokeStyle = e4.kind === "link" ? m2 : p2, n2.lineWidth = 2, n2.setLineDash(e4.kind === "link" ? [7, 6] : []), n2.beginPath(), n2.moveTo(e4.startX, e4.startY), n2.lineTo(e4.middleX, e4.startY), n2.lineTo(e4.middleX, e4.endY), n2.lineTo(e4.endX, e4.endY), n2.stroke(), n2.setLineDash([]), n2.fillStyle = e4.kind === "link" ? m2 : p2;
      let t3 = e4.endX >= e4.startX ? 1 : -1;
      n2.beginPath(), n2.moveTo(e4.endX, e4.endY), n2.lineTo(e4.endX - t3 * 9, e4.endY - 5), n2.lineTo(e4.endX - t3 * 9, e4.endY + 5), n2.closePath(), n2.fill(), n2.restore();
    }, C3 = (e4) => {
      let g3 = t2.getBoundingClientRect(), y2 = g3.width || q, b4 = g3.height || J, x4 = Math.max(1, window.devicePixelRatio || 1), T2 = Math.round(y2 * x4), E3 = Math.round(b4 * x4);
      (t2.width !== T2 || t2.height !== E3) && (t2.width = T2, t2.height = E3), t2.dataset.pixelRatio = String(x4), t2.dataset.backingSize = `${T2}x${E3}`, n2.resetTransform(), n2.clearRect(0, 0, T2, E3);
      let D3 = Qt(y2, b4, h2);
      if (n2.setTransform(D3.scale * x4, 0, 0, D3.scale * x4, (D3.offsetX - h2.x * D3.scale) * x4, (D3.offsetY - h2.y * D3.scale) * x4), N2) for (let e6 of ["parent", "link"]) {
        let t3 = M2.filter((t4) => t4.kind === e6);
        if (t3.length !== 0) {
          n2.save(), n2.strokeStyle = e6 === "link" ? m2 : p2, n2.lineWidth = 2, n2.setLineDash(e6 === "link" ? [7, 6] : []), n2.beginPath();
          for (let e7 of t3) n2.moveTo(e7.startX, e7.startY), n2.lineTo(e7.middleX, e7.startY), n2.lineTo(e7.middleX, e7.endY), n2.lineTo(e7.endX, e7.endY);
          n2.stroke(), n2.restore();
        }
      }
      else M2.forEach(S3);
      r || P2.forEach((t3, r2) => {
        let i3 = en(t3, ((e4 / 1600 + r2 * 0.17) % 1 + 1) % 1);
        n2.save(), n2.fillStyle = t3.kind === "link" ? m2 : d2, n2.shadowBlur = N2 ? 0 : 10, n2.shadowColor = n2.fillStyle, n2.beginPath(), n2.arc(i3.x, i3.y, 4, 0, Math.PI * 2), n2.fill(), n2.restore();
      }), w.forEach(({ node: e6, x: t3, y: r2 }) => {
        let p3 = f === "none" || A2.has(e6.id);
        if (n2.save(), n2.globalAlpha = p3 ? 1 : 0.28, n2.fillStyle = i2, n2.strokeStyle = e6.status === "ERROR" ? u2 : k2.current === e6.id ? d2 : a3, n2.lineWidth = k2.current === e6.id ? 2.5 : 1.2, N2) {
          n2.fillRect(t3, r2, Y2, X2), n2.strokeRect(t3, r2, Y2, X2), n2.fillStyle = e6.kind === "CLIENT" ? l2 : c3, n2.fillRect(t3, r2, 4, X2), n2.restore();
          return;
        }
        n2.beginPath(), n2.moveTo(t3, r2), n2.lineTo(t3 + Y2 - 9, r2), n2.quadraticCurveTo(t3 + Y2, r2, t3 + Y2, r2 + 9), n2.lineTo(t3 + Y2, r2 + X2 - 9), n2.quadraticCurveTo(t3 + Y2, r2 + X2, t3 + Y2 - 9, r2 + X2), n2.lineTo(t3, r2 + X2), n2.closePath(), n2.fill(), n2.stroke(), n2.save(), n2.clip(), n2.fillStyle = e6.kind === "CLIENT" ? l2 : c3, n2.fillRect(t3, r2, 4, X2), n2.restore(), n2.fillStyle = s2, n2.font = "10px ui-monospace, monospace", n2.fillText(e6.kind, t3 + 14, r2 + 17), n2.textAlign = "right", n2.fillText(e6.status, t3 + 176, r2 + 17), n2.textAlign = "left", n2.fillStyle = o2, n2.font = "650 12px system-ui", n2.fillText(e6.label, t3 + 14, r2 + 37, 160), N2 ? (n2.fillStyle = s2, n2.font = "10px ui-monospace, monospace", n2.textAlign = "right", n2.fillText(W(e6.durationNano), t3 + 176, r2 + 54), n2.textAlign = "left") : (n2.fillStyle = s2, n2.font = "10px ui-monospace, monospace", n2.fillText(`+${W(e6.startOffsetNano)} \xB7 ${Tt(e6.id)}`, t3 + 14, r2 + 53, 120), n2.textAlign = "right", n2.fillText(W(e6.durationNano), t3 + 176, r2 + 53), n2.textAlign = "left", n2.fillStyle = a3, n2.fillRect(t3 + 14, r2 + 61, 160, 3), n2.fillStyle = e6.kind === "CLIENT" ? l2 : c3, n2.fillRect(t3 + 14 + U(e6.startOffsetNano, _2) * 1.6, r2 + 61, Math.max(2, U(e6.durationNano, _2) * 1.6), 3)), n2.restore();
      }), n2.resetTransform(), r || (v3 = window.requestAnimationFrame(C3));
    };
    return C3(performance.now()), r && typeof ResizeObserver < "u" && (b3 = new ResizeObserver(() => C3(performance.now())), b3.observe(t2)), typeof MutationObserver < "u" && (x3 = new MutationObserver(() => {
      g2(), r && C3(performance.now());
    }), x3.observe(t2.closest(".wsr-bi") ?? t2, {
      attributeFilter: [
        "class",
        "data-theme",
        "style"
      ],
      attributes: true,
      subtree: true
    })), () => {
      window.cancelAnimationFrame(v3), b3?.disconnect(), x3?.disconnect();
    };
  }, [
    h2,
    N2,
    M2,
    P2,
    w,
    f,
    A2,
    r,
    ee2,
    e3.durationNano
  ]), (0, import_react.useEffect)(() => {
    let e4 = b2.current;
    if (e4 === null || window.CanvasRenderingContext2D === void 0) return;
    let t2 = e4.getContext("2d");
    if (t2 === null) return;
    let n2 = "", r2 = "", i2 = "", a3 = "", o2 = "", s2 = () => {
      n2 = Z(e4, "--data-series-1", "#38bdf8"), r2 = Z(e4, "--data-series-2", "#2dd4bf"), i2 = Z(e4, "--status-error", "#fb7185"), a3 = Z(e4, "--border-strong", "#607084"), o2 = Z(e4, "--status-warning", "#fbbf24");
    };
    s2();
    let c3 = () => {
      let s3 = e4.getBoundingClientRect(), c4 = s3.width || 140, l3 = s3.height || 80, u3 = Math.max(1, window.devicePixelRatio || 1), d2 = Math.round(c4 * u3), f2 = Math.round(l3 * u3);
      (e4.width !== d2 || e4.height !== f2) && (e4.width = d2, e4.height = f2), t2.resetTransform(), t2.clearRect(0, 0, d2, f2), t2.setTransform(d2 / q, 0, 0, f2 / J, 0, 0), t2.lineWidth = 5, M2.forEach((e6) => {
        t2.strokeStyle = e6.kind === "link" ? o2 : a3, t2.setLineDash(e6.kind === "link" ? [14, 12] : []), t2.beginPath(), t2.moveTo(e6.startX, e6.startY), t2.lineTo(e6.middleX, e6.startY), t2.lineTo(e6.middleX, e6.endY), t2.lineTo(e6.endX, e6.endY), t2.stroke();
      }), t2.setLineDash([]), w.forEach(({ node: e6, x: a4, y: o3 }) => {
        t2.fillStyle = e6.status === "ERROR" ? i2 : e6.kind === "CLIENT" ? r2 : n2, t2.fillRect(a4, o3, Y2, X2);
      }), t2.resetTransform();
    };
    c3();
    let l2 = typeof ResizeObserver > "u" ? void 0 : new ResizeObserver(c3);
    l2?.observe(e4);
    let u2 = typeof MutationObserver > "u" ? void 0 : new MutationObserver(() => {
      s2(), c3();
    });
    return u2?.observe(e4.closest(".wsr-bi") ?? e4, {
      attributeFilter: [
        "class",
        "data-theme",
        "style"
      ],
      attributes: true,
      subtree: true
    }), () => {
      l2?.disconnect(), u2?.disconnect();
    };
  }, [M2, w]), e3.status !== "READY" || O2 === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ut, { trace: e3 });
  let F2 = f === "none" ? "Focus receipt \xB7 exact PARENT_EDGE identity; choose a lens to inspect." : `${f === "ancestors" ? "Ancestors" : "Descendants"} receipt \xB7 ${A2.size} exact Span ${A2.size === 1 ? "identity" : "identities"} \xB7 recorded PARENT_EDGE only.`, I2 = (e4) => {
    let t2 = e4.currentTarget.getBoundingClientRect();
    if (t2.width <= 0 || t2.height <= 0) return;
    let n2 = (e4.clientX - t2.left) / t2.width * q, r2 = (e4.clientY - t2.top) / t2.height * J;
    v2((e6) => Yt({
      ...e6,
      x: n2 - e6.width / 2,
      y: r2 - e6.height / 2
    }));
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
    "aria-label": "Recorded trace tree",
    className: "trace-view trace-tree-graph",
    "data-lens": f,
    "data-motion": r ? "off" : "edge-flow",
    "data-testid": "trace-tree",
    "data-trace-renderer": "tree",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
        className: "trace-summary trace-summary-dense trace-tree-context trace-view-header",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "trace-summary-identity trace-view-header-copy",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                variant: "overline",
                children: "Exact recorded call graph"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                as: "strong",
                variant: "h2",
                children: e3.nodes[0]?.label ?? e3.traceId
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                variant: "caption",
                children: e3.traceId
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            "aria-hidden": "true",
            className: "trace-view-header-spacer"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            className: "trace-summary-metrics trace-view-header-metrics",
            children: [
              ["Exact spans", e3.nodes.length],
              ["PARENT_EDGE", e3.parentEdges.length],
              ["LINK", e3.links.length]
            ].map(([e4, r2]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
              className: "trace-summary-stat trace-view-header-stat",
              children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                as: "small",
                variant: "caption",
                children: e4
              }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                as: "strong",
                className: "numeric-exact",
                variant: "h2",
                children: r2
              })]
            }, e4))
          })
        ]
      }),
      i,
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "trace-workbench",
        children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
          className: "trace-tree-canvas-shell",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
              className: "trace-tree-canvas-head",
              children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                as: "h2",
                variant: "subtitle1",
                children: "Span call tree"
              }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                as: "p",
                variant: "caption",
                children: "Click a Span or exact relationship \xB7 deterministic geometry"
              })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(_, {
                "aria-label": "Tree camera controls",
                className: "trace-tree-actions",
                role: "group",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(g, {
                    appearance: "ghost",
                    "aria-label": "Fit tree",
                    onClick: () => v2(Jt),
                    type: "button",
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
                      "aria-hidden": "true",
                      viewBox: "0 0 16 16",
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" })
                    })
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(g, {
                    appearance: "ghost",
                    "aria-label": "Zoom out",
                    disabled: h2.width === q,
                    onClick: () => v2((e4) => Xt(e4, 1.25)),
                    type: "button",
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
                      "aria-hidden": "true",
                      viewBox: "0 0 16 16",
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 8h10" })
                    })
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(g, {
                    appearance: "ghost",
                    "aria-label": "Zoom in",
                    disabled: h2.width <= 392,
                    onClick: () => v2((e4) => Xt(e4, 0.8)),
                    type: "button",
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
                      "aria-hidden": "true",
                      viewBox: "0 0 16 16",
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 8h10M8 3v10" })
                    })
                  })
                ]
              })]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
              "aria-label": "Trace tree legend",
              className: "trace-tree-legend",
              children: [
                ["internal", "INTERNAL"],
                ["client", "CLIENT"],
                ["error", "ERROR"],
                ["parent", "PARENT_EDGE"],
                ["link", "LINK"],
                ["flow", "Request flow"]
              ].map(([e4, r2]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
                "aria-hidden": "true",
                "data-legend-kind": e4
              }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r2 })] }, e4))
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className: "trace-tree-canvas",
              "data-narrow": C2,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
                  "aria-label": "Recorded span call tree graph",
                  className: "trace-tree-canvas-surface",
                  "data-camera-view": Zt(h2),
                  "data-edge-flow-count": r ? 0 : P2.length,
                  "data-edge-routing": "orthogonal",
                  "data-geometry-detail": N2 ? "batched" : "complete",
                  "data-link-count": te2.length,
                  "data-layout": "call-graph",
                  "data-node-shape": "flat-left-rounded-right",
                  "data-parent-edge-count": j2.length,
                  "data-resolution-mode": "device-pixel-ratio",
                  "data-render-detail": N2 ? "summary" : "complete",
                  "data-testid": "trace-tree-canvas",
                  height: J,
                  onPointerDown: (e4) => {
                    let t2 = e4.currentTarget.getBoundingClientRect();
                    if (t2.width <= 0 || t2.height <= 0) return;
                    let n2 = Qt(t2.width, t2.height, h2), r2 = h2.x + (e4.clientX - t2.left - n2.offsetX) / n2.scale, i2 = h2.y + (e4.clientY - t2.top - n2.offsetY) / n2.scale, a3 = [...w].reverse().find((e6) => r2 >= e6.x && r2 <= e6.x + Y2 && i2 >= e6.y && i2 <= e6.y + X2);
                    a3 !== void 0 && S2(a3.node.id);
                  },
                  onWheel: (e4) => {
                    e4.preventDefault(), v2((t2) => Xt(t2, e4.deltaY > 0 ? 1.25 : 0.8));
                  },
                  ref: y,
                  role: "img",
                  width: q
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                  "aria-label": "Recorded trace call tree",
                  className: "trace-tree-outline",
                  "data-detail": C2 ? "rows" : "compact",
                  role: "tree",
                  children: e3.nodes.map((n2) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(tn, {
                    compact: !C2,
                    layout: T.get(n2.id),
                    node: n2,
                    onSelect: S2,
                    showLinks: false,
                    trace: e3
                  }, n2.id))
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
                  "aria-label": "Tree minimap navigation",
                  className: "trace-camera-map",
                  onPointerCancel: () => {
                    x2.current = false;
                  },
                  onPointerDown: (e4) => {
                    x2.current = true, e4.currentTarget.setPointerCapture?.(e4.pointerId), I2(e4);
                  },
                  onPointerMove: (e4) => {
                    x2.current && I2(e4);
                  },
                  onPointerUp: (e4) => {
                    x2.current && I2(e4), x2.current = false, e4.currentTarget.releasePointerCapture?.(e4.pointerId);
                  },
                  role: "region",
                  children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                    as: "strong",
                    variant: "caption",
                    children: "Tree minimap"
                  }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                    className: "trace-camera-map-viewport",
                    children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
                      "aria-hidden": "true",
                      height: 80,
                      ref: b2,
                      width: 140
                    }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                      "aria-hidden": "true",
                      "data-camera-width": h2.width,
                      "data-testid": "trace-tree-minimap-viewport",
                      style: {
                        height: `${h2.height / J * 100}%`,
                        insetInlineStart: `${h2.x / q * 100}%`,
                        insetBlockStart: `${h2.y / J * 100}%`,
                        width: `${h2.width / q * 100}%`
                      }
                    })]
                  })]
                })
              ]
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wt, { trace: e3 })
          ]
        }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Ht, {
          node: O2,
          trace: e3,
          children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
            className: "trace-focus-receipt",
            children: F2
          }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "trace-passport-actions",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
                onClick: () => p("ancestors"),
                type: "button",
                children: "Ancestors"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
                onClick: () => p("descendants"),
                type: "button",
                children: "Descendants"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
                onClick: () => p("none"),
                type: "button",
                children: "Clear lens"
              })
            ]
          })]
        })]
      })
    ]
  });
});
var rn = xt;
function an({ label: e3, entries: r, total: i, totalLabel: a2 }) {
  let o2 = r.map((e4, t2) => {
    let n2 = i === 0n ? 0 : Number(e4.value * 10000n / i) / 100, a3 = r.slice(0, t2).reduce((e6, t3) => e6 + (i === 0n ? 0 : Number(t3.value * 10000n / i) / 100), 0);
    return {
      ...e4,
      offset: a3,
      share: n2
    };
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "trace-statistics-donut-layout",
    children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
      "aria-label": `${e3} donut chart`,
      className: "trace-statistics-donut",
      "data-chart-type": "donut",
      role: "img",
      viewBox: "0 0 48 48",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
          className: "trace-statistics-donut-track",
          cx: "24",
          cy: "24",
          r: "18"
        }),
        o2.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
          className: "trace-statistics-color trace-statistics-donut-segment",
          cx: "24",
          cy: "24",
          "data-category": e4.category,
          "data-color-index": e4.colorIndex,
          "data-entry-label": e4.label,
          pathLength: "100",
          r: "18",
          strokeDasharray: `${e4.share} ${100 - e4.share}`,
          strokeDashoffset: -e4.offset
        }, e4.label)),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
          x: "24",
          y: "23",
          children: a2 ?? i.toString()
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
          className: "trace-statistics-donut-caption",
          x: "24",
          y: "29",
          children: "total"
        })
      ]
    }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
      className: "trace-statistics-legend",
      children: o2.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
          "aria-hidden": "true",
          className: "trace-statistics-color",
          "data-category": e4.category,
          "data-color-index": e4.colorIndex
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
          variant: "body1",
          children: e4.label
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
          as: "strong",
          className: "trace-statistics-color trace-statistics-value",
          "data-category": e4.category,
          "data-color-index": e4.colorIndex,
          variant: "body2",
          weight: "bold",
          children: e4.displayValue
        })
      ] }, e4.label))
    })]
  });
}
function on(e3, t2) {
  let n2 = (e4) => {
    let t3 = e4 / 100 * Math.PI * 2 - Math.PI / 2;
    return [24 + Math.cos(t3) * 18, 24 + Math.sin(t3) * 18];
  };
  if (t2 - e3 >= 99.999) return "M 24 6 A 18 18 0 1 1 24 42 A 18 18 0 1 1 24 6 Z";
  let [r, i] = n2(e3), [a2, o2] = n2(t2);
  return `M 24 24 L ${r} ${i} A 18 18 0 ${+(t2 - e3 > 50)} 1 ${a2} ${o2} Z`;
}
function sn({ entries: e3, label: r, total: i }) {
  let a2 = e3.map((t2, n2) => {
    let r2 = i === 0n ? 0 : Number(t2.value * 10000n / i) / 100, a3 = e3.slice(0, n2).reduce((e4, t3) => e4 + (i === 0n ? 0 : Number(t3.value * 10000n / i) / 100), 0);
    return {
      ...t2,
      end: i > 0n && n2 === e3.length - 1 ? 100 : a3 + r2,
      start: a3
    };
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "trace-statistics-donut-layout",
    children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
      "aria-label": `${r} pie chart`,
      className: "trace-statistics-pie",
      "data-chart-type": "pie",
      role: "img",
      viewBox: "0 0 48 48",
      children: a2.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
        className: "trace-statistics-color trace-statistics-pie-segment",
        d: on(e4.start, e4.end),
        "data-category": e4.category,
        "data-color-index": e4.colorIndex,
        "data-entry-label": e4.label,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: `${e4.label}: ${e4.displayValue}` })
      }, e4.label))
    }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
      className: "trace-statistics-legend",
      children: e3.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
          "aria-hidden": "true",
          className: "trace-statistics-color",
          "data-category": e4.category,
          "data-color-index": e4.colorIndex
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
          variant: "body1",
          children: e4.label
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
          as: "strong",
          className: "trace-statistics-color trace-statistics-value",
          "data-category": e4.category,
          "data-color-index": e4.colorIndex,
          variant: "body2",
          weight: "bold",
          children: e4.displayValue
        })
      ] }, e4.label))
    })]
  });
}
function cn({ entries: e3, label: r }) {
  let i = e3.reduce((e4, t2) => t2.value > e4 ? t2.value : e4, 0n);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    "aria-label": `${r} horizontal bar chart`,
    className: "trace-statistics-kind-bars",
    "data-chart-type": "horizontal-bar",
    role: "img",
    children: e3.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "trace-statistics-kind-bar-row",
      children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
        variant: "body1",
        children: e4.label
      }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        className: "trace-statistics-kind-bar-track",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
          className: "trace-statistics-color trace-statistics-kind-bar-fill",
          "data-color-index": e4.colorIndex,
          "data-entry-label": e4.label,
          style: { width: `${U(String(e4.value), String(i))}%` },
          title: `${e4.label}: ${e4.displayValue}`,
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e4.displayValue })
        })
      })]
    }, e4.label))
  });
}
function ln({ trace: e3, viewNavigation: r }) {
  if (e3.status !== "READY" || e3.durationNano === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ut, { trace: e3 });
  let i = e3.nodes.filter(({ status: e4 }) => e4 === "ERROR").length, a2 = e3.nodes.reduce((e4, t2) => BigInt(t2.durationNano) > BigInt(e4) ? t2.durationNano : e4, "0"), o2 = [
    ["Recorded spans", String(e3.nodes.length)],
    ["Recorded links", String(e3.links.length)],
    ["ERROR spans", String(i)],
    ["Maximum recorded duration", G(a2)]
  ], s2 = Object.entries(e3.nodes.reduce((e4, t2) => (e4[t2.status] = (e4[t2.status] ?? 0) + 1, e4), {})), c2 = Object.entries(e3.nodes.reduce((e4, t2) => (e4[t2.kind] = (e4[t2.kind] ?? 0) + 1, e4), {})), l2 = s2.map(([e4, t2], n2) => ({
    category: `status-${e4.toLowerCase()}`,
    colorIndex: n2 % rn,
    displayValue: String(t2),
    label: e4,
    value: BigInt(t2)
  })), u2 = (e4, t2) => e4 === "INTERNAL" ? 0 : e4 === "CLIENT" ? 3 : t2 % rn, d2 = c2.map(([e4, t2], n2) => ({
    colorIndex: u2(e4, n2),
    displayValue: String(t2),
    label: e4,
    value: BigInt(t2)
  })), f = Object.entries(e3.nodes.reduce((e4, t2) => (e4[t2.kind] = (e4[t2.kind] ?? 0n) + BigInt(t2.durationNano), e4), {})).map(([e4, t2], n2) => ({
    colorIndex: u2(e4, n2),
    displayValue: G(String(t2)),
    label: e4,
    value: t2
  })), p = e3.nodes[0], h2 = e3.nodes.slice(1), g2 = h2.reduce((e4, t2) => e4 + BigInt(t2.durationNano), 0n), _2 = p !== void 0 && h2.length > 0 && BigInt(p.durationNano) === g2, v2 = new Map(e3.nodes.map((e4) => [e4.id, e4])), y = (e4) => {
    let t2 = e4.fields.find(({ field: e6, value: t3 }) => e6 === "wsr.statistics.topic" && typeof t3 == "string" && t3.trim().length > 0)?.value;
    if (typeof t2 == "string") return t2.trim();
    let n2 = e4, r2 = /* @__PURE__ */ new Set();
    for (; n2.parentId !== void 0 && n2.parentId !== p?.id && !r2.has(n2.id); ) {
      r2.add(n2.id);
      let e6 = v2.get(n2.parentId);
      if (e6 === void 0) break;
      n2 = e6;
    }
    return n2.label;
  }, b2 = /* @__PURE__ */ new Map();
  h2.forEach((e4, t2) => {
    let n2 = y(e4), r2 = b2.get(n2);
    r2 === void 0 ? b2.set(n2, {
      duration: BigInt(e4.durationNano),
      firstIndex: t2,
      nodes: [e4],
      topic: n2
    }) : (r2.duration += BigInt(e4.durationNano), r2.nodes.push(e4));
  });
  let x2 = [...b2.values()], S2 = (x2.length <= 4 ? x2 : (() => {
    let e4 = new Set([...x2].sort((e6, t3) => e6.duration === t3.duration ? e6.firstIndex - t3.firstIndex : e6.duration > t3.duration ? -1 : 1).slice(0, 3).map(({ topic: e6 }) => e6)), t2 = x2.filter(({ topic: t3 }) => e4.has(t3)), n2 = h2.filter((t3) => !e4.has(y(t3)));
    return [...t2, {
      duration: n2.reduce((e6, t3) => e6 + BigInt(t3.durationNano), 0n),
      firstIndex: n2.length,
      nodes: n2,
      topic: "Other"
    }];
  })()).map((e4, t2) => ({
    colorIndex: (t2 + 1) % rn,
    durationNano: String(e4.duration),
    entries: e4.nodes.map((e6) => ({
      colorIndex: h2.indexOf(e6) % rn,
      displayValue: G(e6.durationNano),
      label: e6.label,
      value: BigInt(e6.durationNano)
    })),
    id: `category-group-${t2 + 1}`,
    label: e4.topic,
    topic: e4.topic
  })), C2 = [...p === void 0 ? [] : [{
    colorIndex: 0,
    durationNano: p.durationNano,
    id: p.id,
    label: p.label
  }], ...S2.map((e4) => ({
    colorIndex: e4.colorIndex,
    durationNano: e4.durationNano,
    id: e4.id,
    label: e4.label,
    topic: e4.topic
  }))], w = String(C2.reduce((e4, t2) => BigInt(t2.durationNano) > e4 ? BigInt(t2.durationNano) : e4, 0n));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
    "aria-label": "Recorded trace statistics",
    className: "trace-view trace-statistics",
    "data-testid": "trace-statistics",
    "data-trace-renderer": "statistics",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
        className: "trace-statistics-intro trace-view-header",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "trace-statistics-heading trace-view-header-copy",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                as: "span",
                className: "trace-overline",
                variant: "overline",
                children: "Exact recorded inventory"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                as: "h2",
                variant: "h2",
                children: "Trace Statistics"
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                as: "p",
                variant: "caption",
                children: "Exact inventory and recorded-time aggregates only; no inferred causality."
              })
            ]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            "aria-hidden": "true",
            className: "trace-view-header-spacer"
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
            className: "trace-statistics-summary trace-view-header-metrics",
            children: o2.map(([e4, r2]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className: "trace-view-header-stat",
              children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                as: "dt",
                variant: "caption",
                children: e4
              }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                as: "dd",
                className: "numeric-exact",
                variant: "h2",
                children: r2
              })]
            }, e4))
          })
        ]
      }),
      r,
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "trace-statistics-grid",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
            className: "panel-card trace-statistics-inventory",
            children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
              as: "h3",
              variant: "subtitle1",
              children: "Recorded status inventory"
            }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(an, {
              entries: l2,
              label: "Recorded status inventory",
              total: BigInt(e3.nodes.length)
            })]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
            className: "panel-card trace-statistics-inventory",
            children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
              as: "h3",
              variant: "subtitle1",
              children: "Recorded kind inventory"
            }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(sn, {
              entries: d2,
              label: "Recorded kind inventory",
              total: BigInt(e3.nodes.length)
            })]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
            className: "panel-card trace-statistics-inventory",
            children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
              as: "h3",
              variant: "subtitle1",
              children: "Recorded duration by kind"
            }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(cn, {
              entries: f,
              label: "Recorded duration by kind"
            })]
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
            className: "panel-card trace-duration-distribution",
            children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
              as: "h3",
              variant: "subtitle1",
              children: "Recorded duration distribution"
            }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className: "trace-duration-distribution-body",
              children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                "aria-label": "Recorded duration distribution vertical bar chart",
                className: "trace-duration-chart",
                "data-chart-type": "vertical-bar",
                "data-exact-category-total": _2,
                role: "img",
                children: C2.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                  className: "trace-duration-column trace-statistics-color",
                  "data-color-index": e4.colorIndex,
                  "data-topic": e4.topic,
                  children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                    className: "trace-duration-column-plot",
                    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                      className: "trace-duration-column-fill",
                      style: { height: `${U(e4.durationNano, w)}%` },
                      title: `${e4.label}: ${G(e4.durationNano)}`,
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: G(e4.durationNano) })
                    })
                  }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                    as: "span",
                    className: "trace-duration-column-label",
                    title: e4.label,
                    variant: "caption",
                    weight: "medium",
                    children: e4.label
                  })]
                }, e4.id))
              }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                className: "trace-duration-breakdowns",
                children: S2.map((e4) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
                  className: "trace-duration-breakdown",
                  "data-topic": e4.topic,
                  children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m, {
                    as: "h4",
                    className: "trace-duration-breakdown-title trace-statistics-color",
                    "data-color-index": e4.colorIndex,
                    variant: "caption",
                    weight: "bold",
                    children: e4.label
                  }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(an, {
                    entries: e4.entries,
                    label: `Recorded duration ${e4.topic}`,
                    total: BigInt(e4.durationNano),
                    totalLabel: G(e4.durationNano)
                  })]
                }, e4.id))
              })]
            })]
          })
        ]
      })
    ]
  });
}
var mn = ({ trace_id: e3, span_id: t2 }) => `${e3}:${t2}`;
var $ = (e3, t2) => e3 < t2 ? -1 : +(e3 > t2);
function hn(e3) {
  return {
    schemaVersion: "wsr.trace-view@1",
    status: "INVALID",
    nodes: [],
    parentEdges: [],
    links: [],
    errors: [...new Set(e3)].sort($)
  };
}
function gn(e3) {
  let t2 = [], n2 = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), i = [], a2 = [], o2 = /* @__PURE__ */ new Set();
  for (let s3 of e3) {
    if (s3.kind === "NODE") {
      let e4 = mn({
        trace_id: s3.trace_id,
        span_id: s3.node.span_id
      });
      o2.add(s3.trace_id), n2.has(e4) ? t2.push(`duplicate NODE ${e4}`) : n2.set(e4, s3);
      try {
        BigInt(s3.node.end_time_unix_nano) < BigInt(s3.node.start_time_unix_nano) && t2.push(`negative recorded duration for ${e4}`);
      } catch {
        t2.push(`invalid recorded time for ${e4}`);
      }
      continue;
    }
    if (s3.kind === "PARENT_EDGE") {
      let e4 = mn(s3.edge.from), n3 = mn(s3.edge.to), a3 = r.get(e4);
      a3 !== void 0 && a3 !== n3 ? t2.push(`multiple recorded parents for ${e4}`) : r.set(e4, n3), i.push({
        id: s3.id,
        from: { ...s3.edge.from },
        to: { ...s3.edge.to },
        truth: { ...s3.truth },
        recordedAt: s3.recorded_at,
        source: { ...s3.source }
      });
      continue;
    }
    a2.push({
      id: s3.id,
      from: { ...s3.edge.from },
      to: { ...s3.edge.to },
      flags: s3.edge.flags,
      traceState: s3.edge.trace_state,
      truth: { ...s3.truth },
      recordedAt: s3.recorded_at,
      source: { ...s3.source }
    });
  }
  o2.size > 1 && t2.push("multiple NODE trace identities");
  let s2 = /* @__PURE__ */ new Map(), c2 = /* @__PURE__ */ new Set(), l2 = (e4) => {
    let i2 = s2.get(e4);
    if (i2 !== void 0) return i2;
    if (c2.has(e4)) {
      t2.push(`recorded parent cycle at ${e4}`);
      return;
    }
    let a3 = r.get(e4);
    if (a3 === void 0) return s2.set(e4, 0), 0;
    if (!n2.has(a3)) {
      t2.push(`missing recorded parent ${a3} for ${e4}`);
      return;
    }
    c2.add(e4);
    let o3 = l2(a3);
    if (c2.delete(e4), o3 !== void 0) return s2.set(e4, o3 + 1), o3 + 1;
  };
  for (let e4 of [...n2.keys()].sort($)) l2(e4);
  if (t2.length > 0) return hn(t2);
  let u2 = [...n2.values()].sort((e4, t3) => {
    let n3 = BigInt(e4.node.start_time_unix_nano) - BigInt(t3.node.start_time_unix_nano);
    return n3 === 0n ? $(e4.recorded_at, t3.recorded_at) || $(e4.id, t3.id) : n3 < 0n ? -1 : 1;
  });
  if (u2.length === 0) return hn(["recorded trace has no NODE"]);
  let d2 = u2.reduce((e4, t3) => BigInt(t3.node.start_time_unix_nano) < e4 ? BigInt(t3.node.start_time_unix_nano) : e4, BigInt(u2[0].node.start_time_unix_nano)), f = u2.reduce((e4, t3) => BigInt(t3.node.end_time_unix_nano) > e4 ? BigInt(t3.node.end_time_unix_nano) : e4, BigInt(u2[0].node.end_time_unix_nano));
  return {
    schemaVersion: "wsr.trace-view@1",
    status: "READY",
    traceId: [...o2][0],
    startTimeUnixNano: d2.toString(),
    endTimeUnixNano: f.toString(),
    durationNano: (f - d2).toString(),
    nodes: u2.map((e4) => {
      let t3 = {
        trace_id: e4.trace_id,
        span_id: e4.node.span_id
      }, i2 = r.get(mn(t3));
      return {
        id: e4.node.span_id,
        endpoint: t3,
        label: e4.node.span_name,
        kind: e4.node.span_kind,
        status: e4.node.span_status,
        startTimeUnixNano: e4.node.start_time_unix_nano,
        endTimeUnixNano: e4.node.end_time_unix_nano,
        durationNano: (BigInt(e4.node.end_time_unix_nano) - BigInt(e4.node.start_time_unix_nano)).toString(),
        startOffsetNano: (BigInt(e4.node.start_time_unix_nano) - d2).toString(),
        flags: e4.node.span_flags,
        traceState: e4.node.trace_state,
        fields: e4.node.fields.map((e6) => ({ ...e6 })),
        truth: { ...e4.truth },
        depth: s2.get(mn(t3)),
        ...i2 === void 0 ? {} : { parentId: n2.get(i2).node.span_id },
        evidenceId: e4.id,
        recordedAt: e4.recorded_at,
        source: { ...e4.source }
      };
    }),
    parentEdges: i.sort((e4, t3) => $(e4.id, t3.id)),
    links: a2.sort((e4, t3) => $(e4.id, t3.id)),
    errors: []
  };
}

// node_modules/wsr-ui-core/dist/styles.css
var styles_default = `/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */
.wsr-bi{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light;--wsr-surface-panel:oklch(100% 0 0);--wsr-surface-section:var(--wsr-surface-panel);--wsr-surface-raised:oklch(99% .004 250);--wsr-surface-inset:oklch(94.5% .01 250);--wsr-shape-panel:.625rem;--wsr-shape-control:.4375rem;--wsr-type-h1:2.25rem;--wsr-type-h2:1.25rem;--wsr-type-subtitle1:1.125rem;--wsr-type-body1:1rem;--wsr-type-body2:.875rem;--wsr-type-caption:.75rem;--wsr-type-overline:.5625rem;--trace-indent-column:0;--trace-indent-columns:1;--surface-canvas:oklch(97.5% .006 250);--surface-base:var(--surface-canvas);--surface-section:var(--wsr-surface-section,var(--wsr-surface-panel));--surface-panel:var(--wsr-surface-panel,oklch(100% 0 0));--surface-raised:var(--wsr-surface-raised,oklch(99% .004 250));--surface-inset:var(--wsr-surface-inset,oklch(94.5% .01 250));--content-primary:oklch(23% .025 255);--content-secondary:oklch(42% .025 255);--content-muted:oklch(54% .02 255);--content-inverse:oklch(99% 0 0);--border-default:oklch(86% .015 250);--border-strong:oklch(67% .025 250);--interaction-accent:oklch(49% .18 244);--interaction-selection:oklch(90% .05 244);--interaction-disabled:oklch(70% .01 250);--focus-ring:oklch(57% .17 244);--status-available:oklch(42% .12 155);--status-available-surface:oklch(94% .05 155);--status-attention:oklch(50% .13 75);--status-warning:var(--status-attention);--status-attention-surface:oklch(95% .055 85);--status-unavailable:oklch(45% .025 255);--status-unavailable-surface:oklch(94% .012 250);--status-expired:oklch(48% .1 305);--status-expired-surface:oklch(95% .035 305);--status-incompatible:oklch(48% .13 28);--status-incompatible-surface:oklch(95% .045 28);--status-error:oklch(47% .17 25);--status-error-surface:oklch(95% .05 25);--data-series-1:oklch(50% .17 244);--data-series-2:oklch(58% .15 185);--data-series-3:oklch(62% .16 300);--data-series-4:oklch(65% .16 75);--data-series-5:oklch(55% .16 25);--data-series-6:oklch(52% .1 215);--space-page:1.5rem;--space-grid:1rem;--space-cluster:.75rem;--space-control:.625rem;--space-tight:.375rem;--density-row:2.75rem;--density-control:2.5rem;--shape-panel:var(--wsr-shape-panel,.625rem);--shape-control:var(--wsr-shape-control,.4375rem);--shape-pill:999px;--type-h1-size:var(--wsr-type-h1,2.25rem);--type-heading-size:var(--wsr-type-h2,1.25rem);--type-subtitle-size:var(--wsr-type-subtitle1,1.125rem);--type-body-size:var(--wsr-type-body1,1rem);--type-body-small-size:var(--wsr-type-body2,.875rem);--type-caption-size:var(--wsr-type-caption,.75rem);--type-overline-size:var(--wsr-type-overline,.5625rem);--type-label-size:var(--wsr-type-body2,.875rem);--type-code-size:var(--wsr-type-caption,.75rem);--type-code-family:var(--wsr-code-font-family,ui-monospace, SFMono-Regular, Consolas, monospace);--type-value-size:1.5rem;--type-numeric-size:1.5rem;--layout-table-max-height:32rem;--layout-visual-preview-height:6rem;--dashboard-grid-column-width:10rem;--dashboard-grid-gap:0px;--dashboard-grid-inline-padding:0px;--motion-finite-duration:.32s;--wsr-container-border-style:solid;box-sizing:border-box;min-width:0;color:var(--content-primary);font-family:var(--wsr-font-family,Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)}.wsr-bi[data-theme=dark]{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark;--wsr-surface-panel:oklch(22.5% .025 255);--wsr-surface-section:var(--wsr-surface-panel);--wsr-surface-raised:oklch(25.5% .025 255);--wsr-surface-inset:oklch(16% .02 255);--surface-canvas:oklch(18% .02 255);--surface-section:var(--wsr-surface-section,var(--wsr-surface-panel));--surface-panel:var(--wsr-surface-panel,oklch(22.5% .025 255));--surface-raised:var(--wsr-surface-raised,oklch(25.5% .025 255));--surface-inset:var(--wsr-surface-inset,oklch(16% .02 255));--content-primary:oklch(94% .01 250);--content-secondary:oklch(76% .018 250);--content-muted:oklch(64% .02 250);--content-inverse:oklch(18% .02 255);--border-default:oklch(34% .025 250);--border-strong:oklch(49% .03 250);--interaction-accent:oklch(76% .13 235);--interaction-selection:oklch(32% .07 244);--interaction-disabled:oklch(48% .018 250);--focus-ring:oklch(73% .14 235);--status-available:oklch(79% .12 153);--status-available-surface:oklch(31% .07 155);--status-attention:oklch(84% .12 82);--status-attention-surface:oklch(32% .06 76);--status-unavailable:oklch(72% .025 250);--status-unavailable-surface:oklch(28% .02 250);--status-expired:oklch(79% .1 305);--status-expired-surface:oklch(31% .06 305);--status-incompatible:oklch(82% .13 35);--status-incompatible-surface:oklch(31% .07 28);--status-error:oklch(80% .14 25);--status-error-surface:oklch(31% .08 25);--data-series-1:oklch(75% .14 235);--data-series-2:oklch(77% .12 185);--data-series-3:oklch(78% .13 300);--data-series-4:oklch(82% .13 80);--data-series-5:oklch(77% .13 28);--data-series-6:oklch(74% .1 210)}.wsr-bi[data-density=compact]{--space-page:1rem;--space-grid:.75rem;--space-cluster:.5rem;--space-control:.375rem;--space-tight:.25rem;--density-control:2.75rem}.wsr-bi *,.wsr-bi :before,.wsr-bi :after{box-sizing:inherit}.wsr-bi :focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}.wsr-bi .dashboard-grid-shell{min-width:0;overflow:auto hidden}.wsr-bi .dashboard-grid-shell[data-editing=true]{border-radius:var(--shape-panel);background-color:var(--surface-inset);background-image:linear-gradient(to right, var(--border-default) 1px, transparent 1px), linear-gradient(to bottom, var(--border-default) 1px, transparent 1px);background-position:var(--dashboard-grid-inline-padding) 0;background-size:calc(var(--dashboard-grid-column-width) + var(--dashboard-grid-gap)) 176px}.wsr-bi .dashboard-grid{transition:height var(--motion-finite-duration) ease;position:relative}.wsr-bi .dashboard-grid>.react-grid-item{min-width:0;transition:transform .18s,width .18s,height .18s}.wsr-bi .dashboard-grid>.react-grid-item>.dashboard-metric-panel{height:100%;overflow:auto}.wsr-bi .dashboard-grid-shell[data-editing=true] .dashboard-grid>.react-grid-item:not(.react-grid-placeholder){cursor:grab;outline:1px dashed var(--interaction-accent);outline-offset:2px}.wsr-bi .dashboard-grid>.react-grid-item.react-draggable-dragging{z-index:3;cursor:grabbing;transition:none}.wsr-bi .dashboard-grid>.react-grid-placeholder{z-index:2;border-radius:var(--shape-panel);background:var(--interaction-selection);outline:2px solid var(--interaction-accent);opacity:.72}.wsr-bi .dashboard-grid .react-resizable-handle{cursor:se-resize;width:1.25rem;height:1.25rem;position:absolute;bottom:.25rem;right:.25rem}.wsr-bi .dashboard-grid-shell[data-editing=false] .react-resizable-handle{display:none}.wsr-bi .dashboard-grid .react-resizable-handle:after{border-right:2px solid var(--interaction-accent);border-bottom:2px solid var(--interaction-accent);content:"";width:.5rem;height:.5rem;position:absolute;bottom:.1875rem;right:.1875rem}.wsr-bi .dashboard-import-input{clip-path:inset(50%);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}.wsr-bi .dashboard-actions{justify-content:end}.wsr-bi .dashboard-actions .wsr-button[data-appearance=ghost],.wsr-bi .dashboard-widget-delete.wsr-button{border:0}.wsr-bi .dashboard-action-error{max-width:16rem;color:var(--status-error);font-size:var(--type-caption-size)}.wsr-bi .dashboard-widget-delete{z-index:4;background:var(--surface-raised);border:0;position:absolute;inset-block-start:var(--space-tight);inset-inline-end:var(--space-tight)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .dashboard-widget-delete{background:color-mix(in oklch, var(--surface-raised) 88%, transparent)}}.wsr-bi .dashboard-widget-delete{color:var(--content-secondary)}.wsr-bi .dashboard-widget-delete.wsr-button:is(:hover,:focus-visible){background:var(--status-error-surface);color:var(--status-error);border:0}.wsr-bi .dashboard-remove-icon{width:1em;height:1em;-webkit-mask-image:var(--svg);-webkit-mask-image:var(--svg);-webkit-mask-image:var(--svg);-webkit-mask-image:var(--svg);mask-image:var(--svg);--svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M18 6L6 18M6 6l12 12'/%3E%3C/svg%3E");background-color:currentColor;width:1rem;height:1rem;display:inline-block;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}.wsr-bi .dashboard-confirm-icon{width:1em;height:1em;-webkit-mask-image:var(--svg);-webkit-mask-image:var(--svg);-webkit-mask-image:var(--svg);-webkit-mask-image:var(--svg);mask-image:var(--svg);--svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m5 12l5 5L20 7'/%3E%3C/svg%3E");background-color:currentColor;width:1rem;height:1rem;display:inline-block;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}.wsr-bi .panel-card,.wsr-bi .metric-frame,.wsr-bi .dashboard-metric-panel,.wsr-bi .bi-card{gap:var(--space-grid);min-width:0;padding:var(--space-page);border:1px var(--wsr-container-border-style) var(--border-default);border-radius:var(--shape-panel);background:var(--surface-panel);flex-direction:column;display:flex}.wsr-bi .dashboard-metric-panel{gap:var(--space-cluster);padding:var(--space-cluster);container:dashboard-panel/inline-size}.wsr-bi .dashboard-grid>.react-grid-item>.dashboard-metric-panel[data-visualizer=numeric-card\\@1]{overflow:hidden}.wsr-bi .dashboard-panel-head{justify-content:space-between;align-items:flex-start;gap:var(--space-control);display:flex}.wsr-bi .dashboard-panel-head h3,.wsr-bi .dashboard-panel-meta{margin:0}.wsr-bi .dashboard-panel-actions{justify-content:flex-end;margin-top:auto;display:flex}.wsr-bi .dashboard-panel-head h3{font-size:var(--type-label-size);line-height:1.35}.wsr-bi .dashboard-metric-panel[data-visualizer=numeric-card\\@1] .dashboard-panel-title{font-size:var(--type-caption-size)}.wsr-bi .dashboard-evidence-icon{width:1em;height:1em;-webkit-mask-image:var(--svg);-webkit-mask-image:var(--svg);-webkit-mask-image:var(--svg);-webkit-mask-image:var(--svg);mask-image:var(--svg);--svg:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cg fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Cpath d='M14 3v4a1 1 0 0 0 1 1h4'/%3E%3Cpath d='M12 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v4.5'/%3E%3Cpath d='M14 17.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0m4.5 2L21 22'/%3E%3C/g%3E%3C/svg%3E");background-color:currentColor;width:1rem;height:1rem;display:inline-block;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}.wsr-bi .dashboard-panel-meta{color:var(--content-secondary);font-size:var(--type-caption-size)}.wsr-bi .dashboard-ratio{border-radius:var(--shape-pill);background:var(--surface-inset);height:.5rem;overflow:hidden}.wsr-bi .dashboard-ratio i{background:var(--interaction-accent);height:100%;display:block}.wsr-bi .bi-section{gap:var(--space-grid);min-width:0;display:grid}.wsr-bi .metric-frame-header,.wsr-bi .metric-actions{justify-content:space-between;align-items:center;gap:var(--space-cluster);flex-wrap:wrap;display:flex}.wsr-bi .metric-value,.wsr-bi .status-stack{gap:var(--space-tight);display:grid}.wsr-bi .metric-number{font-size:var(--type-numeric-size);font-variant-numeric:tabular-nums;font-weight:650}.wsr-bi .numeric-exact,.wsr-bi .text-code{overflow-wrap:anywhere;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:var(--type-code-size);font-variant-numeric:tabular-nums}.wsr-bi .text-heading{font-size:var(--type-heading-size);margin:0;font-weight:650}.wsr-bi .text-label{font-size:var(--type-label-size);letter-spacing:.08em;text-transform:uppercase;font-weight:700}.wsr-bi .status-label{align-items:center;gap:var(--space-tight);width:fit-content;padding:var(--space-tight) var(--space-cluster);border-radius:var(--shape-pill);font-size:var(--type-label-size);border:1px solid;font-weight:700;display:inline-flex}.wsr-bi .status-available{background:var(--status-available-surface);color:var(--status-available)}@container dashboard-panel (width<=12rem){.dashboard-panel-head .status-available{border-radius:50%;justify-content:center;width:1.5rem;height:1.5rem;padding:0}.dashboard-panel-head .status-available .status-label-text{display:none}}.wsr-bi .status-attention{background:var(--status-attention-surface);color:var(--status-attention)}.wsr-bi .status-unavailable{background:var(--status-unavailable-surface);color:var(--status-unavailable)}.wsr-bi .status-expired{background:var(--status-expired-surface);color:var(--status-expired)}.wsr-bi .status-incompatible{background:var(--status-incompatible-surface);color:var(--status-incompatible)}.wsr-bi .status-error{background:var(--status-error-surface);color:var(--status-error)}.wsr-bi .action-control,.wsr-bi .recorded-node,.wsr-bi .recorded-relation{min-height:var(--density-control);padding:var(--space-control);border:1px solid var(--border-strong);border-radius:var(--shape-control);background:var(--surface-raised);color:var(--content-primary);font:inherit;cursor:pointer}.wsr-bi .visual-with-fallback,.wsr-bi .compare-result,.wsr-bi .recorded-structure{gap:var(--space-grid);min-width:0;display:grid}.wsr-bi .compare-result{grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))}.wsr-bi .visual-preview{width:100%;height:var(--layout-visual-preview-height)}.wsr-bi .fill-current{fill:currentColor}.wsr-bi .text-data-series-1{color:var(--data-series-1)}.wsr-bi .stroke-border-default{stroke:var(--border-default)}.wsr-bi .visual-data-table{table-layout:fixed;border-collapse:collapse;width:100%;max-width:100%;font-size:var(--type-label-size)}.wsr-bi .visual-data-table th,.wsr-bi .visual-data-table td{padding:var(--space-tight);border-block-end:1px solid var(--border-default);overflow-wrap:anywhere;text-align:start}.wsr-bi .bounded-table,.wsr-bi .recorded-graph-frame{max-width:100%;overflow:auto}.wsr-bi .recorded-graph{width:100%;min-width:40rem}.wsr-bi .recorded-graph-parent{stroke:var(--border-strong)}.wsr-bi .recorded-graph-link{stroke:var(--interaction-accent);stroke-dasharray:5 4}.wsr-bi .recorded-graph-node{fill:var(--surface-panel);stroke:var(--interaction-accent)}.wsr-bi .recorded-graph-label{fill:var(--content-primary);font-size:var(--type-label-size)}.wsr-bi .trace-view,.wsr-bi .trace-tree,.wsr-bi .trace-tree-row{gap:var(--space-grid);min-width:0;display:grid}.wsr-bi .trace-summary,.wsr-bi .trace-waterfall-row,.wsr-bi .trace-node-label,.wsr-bi .trace-tree-row>.recorded-node{justify-content:space-between;align-items:center;gap:var(--space-cluster);min-width:0;display:flex}.wsr-bi .trace-waterfall-row{grid-template-columns:minmax(10rem,.35fr) minmax(16rem,1fr);display:grid}.wsr-bi .trace-timeline-track{min-height:var(--density-row);border:1px solid var(--border-default);border-radius:var(--shape-control);background:var(--surface-inset);position:relative;overflow:hidden}.wsr-bi .trace-timeline-bar{inset-block:var(--space-tight);border-radius:var(--shape-control);background:var(--data-series-1);transform-origin:0;min-width:2px;animation:trace-recorded-reveal var(--motion-finite-duration) ease-out both;position:absolute}.wsr-bi [data-motion=off] .trace-timeline-bar{animation:none}.wsr-bi .trace-passport-grid{gap:var(--space-tight) var(--space-grid);grid-template-columns:minmax(9rem,auto) minmax(0,1fr);margin:0;display:grid}.wsr-bi .trace-passport-grid dt{color:var(--content-secondary);font-weight:650}.wsr-bi .trace-passport-grid dd{overflow-wrap:anywhere;min-width:0;margin:0}.wsr-bi .trace-link-list{color:var(--content-secondary);margin:0}.wsr-bi .trace-sr-only{clip:rect(0 0 0 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}@keyframes trace-recorded-reveal{0%{opacity:0;transform:scaleX(0)}to{opacity:1;transform:scaleX(1)}}@media (width<=40rem){.wsr-bi .trace-waterfall-row{grid-template-columns:1fr}}@media (prefers-reduced-motion:reduce){.wsr-bi{--motion-finite-duration:0s}}.wsr-bi .trace-view{gap:var(--space-grid);min-width:0;display:grid}.wsr-bi .trace-summary-dense{align-items:center;gap:var(--space-grid);padding:var(--space-grid);border:1px solid var(--border-default);border-radius:var(--shape-panel);background:var(--surface-panel);grid-template-columns:minmax(12rem,1fr) repeat(4,auto);display:grid}.wsr-bi .trace-summary-dense>span{color:var(--content-secondary);font:var(--type-code-size) var(--type-code-family)}.wsr-bi .trace-overline{color:var(--content-secondary);font-size:var(--type-overline-size);letter-spacing:.08em;text-transform:uppercase;font-weight:700;display:block}.wsr-bi .trace-view-tools,.wsr-bi .trace-passport-head{justify-content:space-between;align-items:center;gap:var(--space-cluster);flex-wrap:wrap;display:flex}.wsr-bi .trace-view-tools input{min-width:min(100%,18rem);margin-inline-start:auto}.wsr-bi .trace-minimap{gap:var(--space-tight);min-height:3.75rem;padding:var(--space-tight) var(--space-grid);border:1px solid var(--border-default);border-radius:var(--shape-panel);background:var(--surface-inset);display:grid;overflow:hidden}.wsr-bi .trace-minimap-track{border:1px solid var(--interaction-accent);border-radius:var(--shape-control);min-height:1.75rem;position:relative}.wsr-bi .trace-workbench{gap:var(--space-grid);grid-template-columns:minmax(0,1fr) minmax(16rem,19rem);min-width:0;display:grid}.wsr-bi .trace-waterfall-canvas,.wsr-bi .trace-tree-canvas-shell,.wsr-bi .span-passport{border:1px solid var(--border-default);border-radius:var(--shape-panel);background:var(--surface-panel);min-width:0;overflow:hidden}.wsr-bi .trace-waterfall-row{border-block-end:1px solid var(--border-default);min-height:3rem;display:flex}.wsr-bi .trace-node-label{gap:var(--space-tight);text-align:start;background:0 0;border:0;border-radius:0;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;display:grid}.wsr-bi .trace-node-copy{min-width:0}.wsr-bi .trace-node-copy strong,.wsr-bi .trace-node-copy small{text-overflow:ellipsis;white-space:nowrap;display:block;overflow:hidden}.wsr-bi .trace-node-copy small{color:var(--content-secondary);font:var(--type-caption-size) var(--type-code-family)}.wsr-bi .trace-glyph{border-radius:var(--shape-control);width:1.4rem;height:1.4rem;color:var(--data-series-1);border:1px solid;place-items:center;display:grid}.wsr-bi .trace-kind-client{color:var(--data-series-2)}.wsr-bi .trace-error{color:var(--status-error)}.wsr-bi .trace-timeline-track{border:0;border-inline-start:1px solid var(--border-default);background-color:var(--surface-inset);background-image:linear-gradient(90deg, transparent 24.8%, var(--border-default) 25%, transparent 25.2%, transparent 49.8%, var(--border-default) 50%, transparent 50.2%, transparent 74.8%, var(--border-default) 75%, transparent 75.2%);border-radius:0;min-height:3rem;position:relative;overflow:hidden}.wsr-bi .trace-timeline-bar{min-width:2px;padding-inline:var(--space-tight);border:1px solid var(--data-series-1);border-radius:var(--shape-control);background:var(--data-series-1);display:block;position:absolute;inset-block:.85rem;overflow:hidden}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-timeline-bar{background:color-mix(in srgb, var(--data-series-1) 45%, var(--surface-panel))}}.wsr-bi .trace-timeline-bar{color:var(--content-primary);font-size:var(--type-caption-size);text-overflow:ellipsis;white-space:nowrap;transform-origin:0;animation:trace-recorded-reveal var(--motion-finite-duration) ease-out both}.wsr-bi .trace-timeline-bar.trace-kind-client{border-color:var(--data-series-2);background:var(--data-series-2)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-timeline-bar.trace-kind-client{background:color-mix(in srgb, var(--data-series-2) 40%, var(--surface-panel))}}.wsr-bi .trace-timeline-bar.trace-status-error{border-color:var(--status-error);background:var(--status-error)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-timeline-bar.trace-status-error{background:color-mix(in srgb, var(--status-error) 35%, var(--surface-panel))}}.wsr-bi .trace-passport-head{justify-content:space-between;align-items:center;gap:var(--space-cluster);border-block-end:1px solid var(--border-default);min-height:2.75rem;padding:0 .75rem;display:flex}.wsr-bi .trace-passport-head strong{font-size:.625rem}.wsr-bi .trace-passport-head span{color:var(--content-muted);letter-spacing:.08em;text-transform:uppercase;font-size:.5rem}.wsr-bi .trace-passport-body{padding:.8125rem}.wsr-bi .trace-passport-title{align-items:center;gap:.5625rem;margin-block-end:.875rem;display:flex}.wsr-bi .trace-passport-title>div{min-width:0}.wsr-bi .trace-passport-name{font-size:var(--type-body-size);display:block}.wsr-bi .trace-passport-title small{color:var(--content-muted);margin-block-start:.1875rem;font-size:.5rem;display:block}.wsr-bi .trace-passport-sigil{border:1px solid var(--data-series-1);background:var(--data-series-1);border-radius:.4375rem;flex:none;place-items:center;width:1.8125rem;height:1.8125rem;display:grid}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-passport-sigil{background:color-mix(in srgb, var(--data-series-1) 16%, var(--surface-panel))}}.wsr-bi .trace-passport-sigil{color:var(--data-series-1);font-size:.5rem;font-weight:800}.wsr-bi .trace-passport-sigil.trace-kind-client{border-color:var(--data-series-2);background:var(--data-series-2)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-passport-sigil.trace-kind-client{background:color-mix(in srgb, var(--data-series-2) 16%, var(--surface-panel))}}.wsr-bi .trace-passport-sigil.trace-kind-client{color:var(--data-series-2)}.wsr-bi .trace-passport-sigil.trace-status-error{border-color:var(--status-error);background:var(--status-error)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-passport-sigil.trace-status-error{background:color-mix(in srgb, var(--status-error) 16%, var(--surface-panel))}}.wsr-bi .trace-passport-sigil.trace-status-error{color:var(--status-error)}.wsr-bi .trace-passport-grid{grid-template-columns:1fr;gap:.6875rem;display:grid}.wsr-bi .trace-passport-grid dt{color:var(--content-muted);letter-spacing:.1em;text-transform:uppercase;margin:0;font-size:.5rem}.wsr-bi .trace-passport-grid dd{font-size:var(--type-caption-size);margin-block-start:.1875rem;line-height:1.45}.wsr-bi .trace-passport-grid .text-code,.wsr-bi .trace-passport-grid .numeric-exact{font-size:.5rem}.wsr-bi .trace-link-receipt,.wsr-bi .trace-focus-receipt{margin-block:var(--space-grid);border-radius:var(--shape-control);color:var(--content-secondary);font-family:var(--type-code-family);font-size:var(--type-caption-size);text-align:start;padding:.65rem;line-height:1.5}.wsr-bi .trace-link-receipt{border-inline-start:3px solid var(--status-warning);background:var(--status-warning)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-link-receipt{background:color-mix(in srgb, var(--status-warning) 16%, var(--surface-panel))}}.wsr-bi .trace-tree-canvas{background-color:var(--surface-inset);background-image:radial-gradient(var(--border-default) 1px, transparent 1px);background-size:1.25rem 1.25rem;min-height:36rem;position:relative;overflow:hidden}.wsr-bi .trace-tree-canvas-surface{cursor:pointer;touch-action:none;width:100%;height:100%;display:block;position:absolute;inset:0}.wsr-bi .trace-camera-map{z-index:2;width:9.5rem;padding:var(--space-tight);border:1px solid var(--border-strong);border-radius:var(--shape-control);background:var(--surface-base);position:absolute;inset-block-end:var(--space-grid);inset-inline-start:var(--space-grid)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-camera-map{background:color-mix(in srgb, var(--surface-base) 90%, transparent)}}.wsr-bi .trace-camera-map{cursor:crosshair;touch-action:none;-webkit-user-select:none;user-select:none}.wsr-bi .trace-camera-map>strong{color:var(--content-secondary);text-transform:uppercase}.wsr-bi .trace-camera-map-viewport{border-radius:calc(var(--shape-control) / 2);background:var(--surface-inset);height:5rem;margin-block-start:var(--space-tight);position:relative;overflow:hidden}.wsr-bi .trace-camera-map-viewport canvas{width:100%;height:100%;display:block}.wsr-bi .trace-camera-map-viewport>span{border:1px solid var(--interaction-accent);background:var(--interaction-accent);position:absolute}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-camera-map-viewport>span{background:color-mix(in srgb, var(--interaction-accent) 15%, transparent)}}.wsr-bi .trace-camera-map-viewport>span{pointer-events:none}.wsr-bi .trace-tree-outline{clip-path:inset(50%);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}.wsr-bi .trace-tree-outline>div>button{justify-content:space-between;width:100%;display:flex}.wsr-bi .trace-statistics-summary{gap:var(--space-grid);grid-template-columns:repeat(4,minmax(0,1fr));margin:0;display:grid}.wsr-bi .trace-statistics-summary>div{min-width:0}.wsr-bi .trace-statistics-summary dt{color:var(--content-secondary)}.wsr-bi .trace-statistics-summary dd{margin:var(--space-grid) 0 0;font-size:var(--type-value-size)}@media (width<=64rem){.wsr-bi .trace-workbench{grid-template-columns:1fr}.wsr-bi .span-passport{display:none}.wsr-bi .trace-summary-dense{grid-template-columns:minmax(12rem,1fr) repeat(2,auto)}.wsr-bi .trace-summary-dense>span:nth-last-child(-n+2){display:none}}@media (width<=40rem){.wsr-bi .trace-summary-dense,.wsr-bi .trace-statistics-summary{grid-template-columns:1fr}.wsr-bi .trace-minimap,.wsr-bi .trace-waterfall-canvas,.wsr-bi .trace-tree-canvas-surface,.wsr-bi .trace-camera-map{display:none}.wsr-bi .trace-tree-canvas{min-height:auto}.wsr-bi .trace-tree-outline{clip-path:none;white-space:normal;width:auto;height:auto;position:static;overflow:visible}.wsr-bi .trace-tree-outline>div{min-width:0;min-height:var(--density-row);border-block-end:1px solid var(--border-default)}.wsr-bi .trace-tree-graph,.wsr-bi .trace-tree-canvas-shell,.wsr-bi .trace-tree-outline,.wsr-bi .trace-tree-outline>div>button,.wsr-bi .trace-tree-outline>div>button>span{min-width:0;max-width:100%}.wsr-bi .trace-tree-outline>div>button>span{overflow-wrap:anywhere}.wsr-bi .trace-view-tools input{order:2;width:100%;margin:0}}.wsr-bi .trace-view{gap:.75rem}.wsr-bi .trace-view button,.wsr-bi .trace-view input[type=search]{border:1px solid var(--border-strong);border-radius:var(--shape-control);background:var(--surface-raised);min-height:2rem;color:var(--content-primary);font:inherit;font-size:var(--type-label-size);padding:0 .7rem}.wsr-bi .trace-view button{cursor:pointer}.wsr-bi .trace-view button[aria-pressed=true]{border-color:var(--interaction-accent);background:var(--interaction-selection)}.wsr-bi .trace-summary-dense{padding:.75rem .9rem}.wsr-bi .trace-summary-dense>div>strong{font-size:var(--type-heading-size);margin-block-start:.2rem;display:block}.wsr-bi .trace-node-label{padding-block:.35rem}.wsr-bi .trace-workbench{grid-template-columns:minmax(0,1fr) minmax(17rem,18.75rem);gap:.75rem}.wsr-bi .trace-tree-canvas-head{align-items:center;gap:var(--space-grid);border-block-end:1px solid var(--border-default);grid-template-columns:minmax(0,1fr) auto;min-height:3rem;padding:.45rem .75rem;display:grid}.wsr-bi .trace-tree-canvas-head>div:first-child{gap:.15rem;min-width:0;display:grid}.wsr-bi .trace-tree-canvas-head h2,.wsr-bi .trace-tree-canvas-head p{margin:0}.wsr-bi .trace-tree-canvas-head h2{font-size:var(--type-label-size)}.wsr-bi .trace-tree-canvas-head p{color:var(--content-muted);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.wsr-bi .trace-tree-canvas-head [role=group]{gap:var(--space-tight);display:flex}.wsr-bi .trace-tree-canvas-head button{min-height:1.65rem}.wsr-bi .trace-tree-actions{justify-self:end}.wsr-bi .trace-tree-actions .wsr-button[data-icon-button=true]:is(:hover,:focus-visible){border-color:var(--interaction-accent);background:var(--interaction-selection);color:var(--interaction-accent)}.wsr-bi .trace-tree-legend{border-block-end:1px solid var(--border-default);background:var(--surface-panel);min-height:2rem;color:var(--content-secondary);font-size:var(--type-caption-size);flex-wrap:wrap;align-items:center;gap:.4rem 1rem;margin:0;padding:.35rem .75rem;list-style:none;display:flex}.wsr-bi .trace-tree-legend li{white-space:nowrap;align-items:center;gap:.35rem;display:inline-flex}.wsr-bi .trace-tree-legend i{background:var(--data-series-1);border-radius:0 .25rem .25rem 0;flex:none;block-size:.45rem;inline-size:1rem;display:inline-block;position:relative}.wsr-bi .trace-tree-legend i[data-legend-kind=client]{background:var(--data-series-2)}.wsr-bi .trace-tree-legend i[data-legend-kind=error]{background:var(--status-error)}.wsr-bi .trace-tree-legend i[data-legend-kind=parent],.wsr-bi .trace-tree-legend i[data-legend-kind=link]{border-block-start:1px solid var(--content-secondary);background:0 0;border-radius:0;block-size:0}.wsr-bi .trace-tree-legend i[data-legend-kind=link]{border-block-start-style:dashed;border-block-start-color:var(--status-warning)}.wsr-bi .trace-tree-legend i[data-legend-kind=parent]:after,.wsr-bi .trace-tree-legend i[data-legend-kind=link]:after{content:"";border-block-start:1px solid;border-inline-end:1px solid;block-size:.3rem;inline-size:.3rem;position:absolute;inset-block-start:-.2rem;inset-inline-end:-.05rem;transform:rotate(45deg)}.wsr-bi .trace-tree-legend i[data-legend-kind=flow]{background:var(--interaction-accent);block-size:.4rem;inline-size:.4rem;box-shadow:0 0 .35rem var(--interaction-accent);border-radius:50%}.wsr-bi .trace-focus-receipt{border-inline-start:3px solid var(--interaction-accent);background:var(--interaction-accent)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-focus-receipt{background:color-mix(in srgb, var(--interaction-accent) 14%, var(--surface-panel))}}.wsr-bi .trace-passport-actions{gap:var(--space-tight);flex-wrap:wrap;display:flex}.wsr-bi .trace-waterfall-mobile{border:1px solid var(--border-default);border-radius:var(--shape-panel);background:var(--surface-panel);overflow:hidden}.wsr-bi .trace-waterfall-mobile>header{border-block-end:1px solid var(--border-default);font-size:var(--type-label-size);text-transform:uppercase;padding:.65rem .75rem;font-weight:700}.wsr-bi .trace-waterfall-mobile [role=treeitem]{border-block-end:1px solid var(--border-default);min-width:0}.wsr-bi .trace-waterfall-mobile [role=treeitem]>button{text-align:start;background:0 0;border:0;border-radius:0;grid-template-columns:minmax(0,1fr) auto;width:100%;min-height:3rem;display:grid}.wsr-bi .trace-statistics-intro{border:1px solid var(--border-default);border-radius:var(--shape-panel);background:var(--surface-panel);grid-template-columns:minmax(15rem,1fr) auto;align-items:center;gap:clamp(1rem,2.5vw,2.5rem);padding:.8rem .9rem;display:grid}.wsr-bi .trace-statistics-heading{gap:.2rem;min-width:0;display:grid}.wsr-bi .trace-statistics-intro h2,.wsr-bi .trace-statistics-intro p,.wsr-bi .trace-statistics-grid h3{margin:0}.wsr-bi .trace-statistics-intro h2{font-size:var(--type-heading-size)}.wsr-bi .trace-statistics-intro p{color:var(--content-secondary);font-size:var(--type-caption-size)}.wsr-bi .trace-statistics-intro .trace-statistics-summary{grid-template-columns:repeat(4,minmax(4.5rem,auto));align-items:center;gap:clamp(.8rem,1.8vw,1.75rem)}.wsr-bi .trace-statistics-summary>div{gap:.2rem;display:grid}.wsr-bi .trace-statistics-summary dt{font-size:var(--type-caption-size);white-space:nowrap}.wsr-bi .trace-statistics-summary dd{color:var(--content-primary);font-size:var(--type-heading-size);white-space:nowrap;margin:0;font-weight:650}.wsr-bi .trace-statistics-grid{gap:var(--space-grid);grid-template-columns:repeat(3,minmax(0,1fr));display:grid}.wsr-bi .trace-duration-distribution{grid-column:1/-1}.wsr-bi .trace-statistics-donut-layout{align-items:center;gap:var(--space-grid);grid-template-columns:minmax(7rem,.4fr) minmax(8rem,1fr);display:grid}.wsr-bi .trace-statistics-donut,.wsr-bi .trace-statistics-pie{width:min(100%,8rem);margin-inline:auto;display:block;overflow:visible}.wsr-bi .trace-statistics-pie-segment{fill:var(--trace-statistics-color);stroke:var(--surface-panel);stroke-width:.5px}.wsr-bi .trace-statistics-donut circle{fill:none;stroke-width:6px}.wsr-bi .trace-statistics-donut-track{stroke:var(--surface-inset)}.wsr-bi .trace-statistics-donut-segment{stroke:var(--trace-statistics-color);transform-origin:50%;transform:rotate(-90deg)}.wsr-bi .trace-statistics-donut text{fill:var(--content-primary);font:650 .42rem var(--type-code-family);text-anchor:middle}.wsr-bi .trace-statistics-donut .trace-statistics-donut-caption{fill:var(--content-muted);text-transform:uppercase;font-size:.22rem;font-weight:500}.wsr-bi .trace-statistics-legend{gap:.55rem;margin:0;padding:0;list-style:none;display:grid}.wsr-bi .trace-statistics-legend li{grid-template-columns:.55rem minmax(0,1fr) auto;align-items:center;gap:.45rem;display:grid}.wsr-bi .trace-statistics-legend li>i{background:var(--trace-statistics-color);border-radius:50%;width:.55rem;height:.55rem}.wsr-bi .wsr-typography.trace-statistics-value.trace-statistics-color{color:var(--trace-statistics-color)}.wsr-bi .trace-statistics-color,.wsr-bi .trace-statistics-color[data-color-index="0"]{--trace-statistics-color:var(--data-series-1)}.wsr-bi .trace-statistics-color[data-color-index="1"]{--trace-statistics-color:var(--data-series-2)}.wsr-bi .trace-statistics-color[data-color-index="2"]{--trace-statistics-color:var(--data-series-3)}.wsr-bi .trace-statistics-color[data-color-index="3"]{--trace-statistics-color:var(--data-series-4)}.wsr-bi .trace-statistics-color[data-color-index="4"]{--trace-statistics-color:var(--data-series-5)}.wsr-bi .trace-statistics-color[data-color-index="5"]{--trace-statistics-color:var(--data-series-6)}.wsr-bi .trace-statistics-color[data-category=status-ok]{--trace-statistics-color:var(--status-available)}.wsr-bi .trace-statistics-color[data-category=status-error]{--trace-statistics-color:var(--status-error)}.wsr-bi .trace-statistics-color[data-category=status-unset]{--trace-statistics-color:var(--status-unavailable)}.wsr-bi .trace-statistics-kind-bars{align-content:center;align-items:center;gap:var(--space-cluster);flex:1;grid-template-columns:minmax(4.5rem,auto) minmax(0,1fr);min-width:0;display:grid}.wsr-bi .trace-statistics-kind-bar-row{display:contents}.wsr-bi .trace-statistics-kind-bar-track{border-radius:var(--shape-control);background:var(--surface-inset);height:2rem;overflow:hidden}.wsr-bi .trace-statistics-kind-bar-fill{min-width:2rem;height:100%;padding-inline:var(--space-tight);border-radius:var(--shape-control);background:var(--trace-statistics-color);color:var(--content-inverse);justify-content:flex-end;align-items:center;display:flex;overflow:hidden}.wsr-bi .trace-statistics-kind-bar-fill>span{font:650 var(--type-caption-size) var(--type-code-family);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.wsr-bi .trace-duration-distribution-body{align-items:start;gap:var(--space-grid);grid-template-columns:minmax(0,1.2fr) minmax(15rem,.8fr);display:grid}.wsr-bi .trace-duration-breakdowns{gap:var(--space-grid);border-inline-start:1px solid var(--border-default);grid-template-columns:repeat(2,minmax(0,1fr));padding-inline-start:var(--space-grid);display:grid}.wsr-bi .trace-duration-breakdown{gap:var(--space-tight);min-width:0;display:grid}.wsr-bi .trace-duration-breakdown-title{color:var(--trace-statistics-color);margin:0}.wsr-bi .trace-duration-breakdown .trace-statistics-donut-layout{gap:var(--space-tight);grid-template-columns:4.75rem minmax(0,1fr)}.wsr-bi .trace-duration-breakdown .trace-statistics-donut{width:4.75rem}.wsr-bi .trace-duration-breakdown .trace-statistics-legend{gap:var(--space-tight)}.wsr-bi .trace-duration-breakdown .trace-statistics-legend li{gap:var(--space-tight);grid-template-columns:.45rem minmax(0,1fr) auto}.wsr-bi .trace-duration-breakdown .trace-statistics-legend li>i{width:.45rem;height:.45rem}.wsr-bi .trace-duration-breakdown .trace-statistics-legend .wsr-typography{font-size:var(--type-caption-size)}.wsr-bi .trace-duration-chart{align-items:end;gap:var(--space-cluster);grid-template-columns:repeat(auto-fit,minmax(5rem,1fr));min-width:0;padding-block-start:.35rem;display:grid}.wsr-bi .trace-duration-column{gap:var(--space-tight);text-align:center;grid-template-rows:11rem minmax(2.5rem,auto);min-width:0;display:grid}.wsr-bi .trace-duration-column-plot{border-block-end:1px solid var(--border-default);justify-content:center;align-items:flex-end;min-width:0;height:11rem;display:flex}.wsr-bi .trace-duration-column-fill{width:min(100%,4.5rem);min-height:1.75rem;padding:var(--space-tight) .2rem;border-radius:var(--shape-control) var(--shape-control) 0 0;background:var(--trace-statistics-color);color:var(--content-inverse);justify-content:center;align-items:flex-start;display:flex;overflow:hidden}.wsr-bi .trace-duration-column-fill>span{font:650 var(--type-caption-size) var(--type-code-family);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.wsr-bi .trace-duration-column-label{min-width:0;color:var(--content-secondary);text-overflow:ellipsis;overflow:hidden}@media (width<=64rem){.wsr-bi .trace-workbench{grid-template-columns:1fr}.wsr-bi .trace-statistics-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.wsr-bi .trace-duration-distribution-body{grid-template-columns:1fr}.wsr-bi .trace-duration-breakdowns{border-block-start:1px solid var(--border-default);border-inline-start:0;padding-block-start:var(--space-grid);padding-inline-start:0}}@media (width<=40rem){.wsr-bi,.wsr-bi .trace-view,.wsr-bi .trace-view>*{inline-size:100%;min-inline-size:0;max-inline-size:100%}.wsr-bi .trace-view{overflow:hidden}.wsr-bi .trace-tree-context,.wsr-bi .trace-tree-canvas-head{grid-template-columns:1fr}.wsr-bi .trace-tree-canvas-head p{display:none}.wsr-bi .trace-tree-outline>div>button{gap:var(--space-tight);background:0 0;border:0;border-radius:0;grid-template-columns:minmax(0,1fr) auto;min-height:3rem;display:grid}.wsr-bi .trace-statistics-grid,.wsr-bi .trace-statistics-intro{grid-template-columns:1fr}.wsr-bi .trace-statistics-intro .trace-statistics-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.wsr-bi .trace-duration-distribution{grid-column:auto}.wsr-bi .trace-statistics-donut-layout{grid-template-columns:minmax(6rem,.35fr) minmax(8rem,1fr)}.wsr-bi .trace-duration-breakdowns{grid-template-columns:1fr}}.wsr-bi .trace-summary-dense{grid-template-columns:minmax(16rem,1fr) auto;padding:.75rem .9rem}.wsr-bi .trace-summary-identity{gap:.18rem;min-width:0;display:grid}.wsr-bi .trace-summary-identity>strong{font-size:var(--type-heading-size)}.wsr-bi .trace-summary-identity>code{color:var(--content-muted);font:var(--type-caption-size) var(--type-code-family);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.wsr-bi .trace-summary-metrics{justify-content:flex-end;align-items:center;gap:clamp(1rem,2.4vw,2.25rem);display:flex}.wsr-bi .trace-summary-stat{gap:.2rem;min-width:4rem;display:grid}.wsr-bi .trace-summary-stat small{color:var(--content-muted);font-size:var(--type-caption-size)}.wsr-bi .trace-summary-stat strong{color:var(--content-primary);font:650 var(--type-heading-size) var(--type-code-family)}.wsr-bi .trace-summary-stat>.wsr-typography{font-size:var(--type-heading-size)}.wsr-bi .trace-summary-stat[data-tone=error] strong{color:var(--status-error)}.wsr-bi .trace-summary-stat[data-tone=success] strong{color:var(--status-available)}.wsr-bi .trace-view-header{align-items:center;gap:var(--space-grid);border:1px solid var(--border-default);border-radius:var(--shape-panel);background:var(--surface-panel);flex-direction:row;min-width:0;padding:.75rem .9rem;display:flex}.wsr-bi .trace-view-header-copy{flex-direction:column;flex:0 auto;gap:.2rem;min-width:14rem;display:flex}.wsr-bi .trace-view-header-spacer{min-width:var(--space-grid);flex:auto}.wsr-bi .trace-view-header-metrics{flex-direction:row;flex:none;align-items:center;gap:clamp(1rem,2.4vw,2.25rem);min-width:0;margin:0;display:flex}.wsr-bi .trace-view-header-stat{flex-direction:column;gap:.2rem;min-width:4rem;display:flex}.wsr-bi .trace-view-header-copy>.wsr-typography[data-variant=overline]{color:var(--content-secondary);font-size:var(--type-overline-size);font-weight:700}.wsr-bi .trace-view-header-copy>.wsr-typography[data-variant=caption]{color:var(--content-muted);font-size:var(--type-caption-size);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.wsr-bi .trace-view-header-stat>.wsr-typography[data-variant=caption]{color:var(--content-muted);font-size:var(--type-caption-size);white-space:nowrap}.wsr-bi .trace-view-header-stat>.wsr-typography[data-variant=h2]{color:var(--content-primary);font-size:var(--type-heading-size);white-space:nowrap;margin:0;font-weight:650}.wsr-bi .trace-minimap{grid-template-columns:minmax(8rem,10rem) minmax(25rem,1fr);align-items:stretch;gap:0;min-height:3.25rem;padding:0}.wsr-bi .trace-minimap-copy{border-inline-end:1px solid var(--border-default);background:var(--surface-panel);align-content:center;gap:.15rem;padding-inline:.85rem;display:grid}.wsr-bi .trace-minimap-copy>strong{font-size:var(--type-label-size)}.wsr-bi .trace-minimap-copy>small{color:var(--content-muted);font-size:var(--type-caption-size)}.wsr-bi .trace-minimap-track{background:var(--surface-inset);cursor:crosshair;touch-action:none;border:0;border-radius:0;min-height:3.25rem;overflow:hidden}.wsr-bi .trace-minimap-overview{z-index:1;pointer-events:none;width:100%;height:calc(100% - 1.25rem);position:absolute;inset:.25rem 0 1rem;overflow:hidden}.wsr-bi .trace-minimap-overview .trace-minimap-span{--trace-waterfall-color:var(--data-series-1);stroke:var(--trace-waterfall-color)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-minimap-overview .trace-minimap-span{stroke:color-mix(in srgb, var(--trace-waterfall-color) 45%, var(--surface-panel))}}.wsr-bi .trace-minimap-overview .trace-minimap-span{stroke-linecap:round;vector-effect:non-scaling-stroke}.wsr-bi .trace-minimap-overview .trace-minimap-span[data-color-index="1"]{--trace-waterfall-color:var(--data-series-2)}.wsr-bi .trace-minimap-overview .trace-minimap-span[data-color-index="2"]{--trace-waterfall-color:var(--data-series-3)}.wsr-bi .trace-minimap-overview .trace-minimap-span[data-color-index="3"]{--trace-waterfall-color:var(--data-series-4)}.wsr-bi .trace-minimap-overview .trace-minimap-span[data-color-index="4"]{--trace-waterfall-color:var(--data-series-5)}.wsr-bi .trace-minimap-overview .trace-minimap-span[data-color-index="5"]{--trace-waterfall-color:var(--data-series-6)}.wsr-bi .trace-minimap-overview .trace-minimap-span.trace-status-error{stroke:var(--status-error)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-minimap-overview .trace-minimap-span.trace-status-error{stroke:color-mix(in srgb, var(--status-error) 35%, var(--surface-panel))}}.wsr-bi .trace-minimap-ruler{z-index:3;pointer-events:none;position:absolute;inset:0}.wsr-bi .trace-minimap-ruler>span{background:var(--surface-inset);padding-inline:.15rem;position:absolute;inset-block-end:.18rem}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-minimap-ruler>span{background:color-mix(in srgb, var(--surface-inset) 86%, transparent)}}.wsr-bi .trace-minimap-ruler>span{color:var(--content-muted);font:normal var(--type-caption-size) var(--type-code-family);white-space:nowrap;line-height:1.2;transform:translate(-50%)}.wsr-bi .trace-minimap-ruler>span:before{border-inline-start:1px solid var(--border-strong);content:"";height:.24rem;position:absolute;inset-block-end:calc(100% + .08rem);inset-inline-start:50%}.wsr-bi .trace-minimap-ruler>span:first-child{transform:none}.wsr-bi .trace-minimap-ruler>span:first-child:before{inset-inline-start:0}.wsr-bi .trace-minimap-ruler>span:last-child{transform:translate(-100%)}.wsr-bi .trace-minimap-ruler>span:last-child:before{inset-inline-start:100%}.wsr-bi .trace-minimap-window{z-index:2;border-block:1px solid var(--status-warning);min-width:2px;position:absolute;inset-block:.25rem}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-minimap-window{border-block:1px solid color-mix(in srgb, var(--status-warning) 82%, transparent)}}.wsr-bi .trace-minimap-window{background:var(--status-warning)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-minimap-window{background:color-mix(in srgb, var(--status-warning) 14%, transparent)}}.wsr-bi .trace-minimap-window{box-shadow:inset 0 0 0 1px var(--status-warning)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-minimap-window{box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--status-warning) 28%, transparent)}}.wsr-bi .trace-minimap-window{cursor:grab}.wsr-bi .trace-minimap-resize-handle{z-index:1;cursor:ew-resize;pointer-events:auto;width:.75rem;position:absolute;inset-block:0}.wsr-bi .trace-minimap-resize-handle:before{background:var(--status-warning);content:"";border-radius:99px;width:2px;position:absolute;inset-block:28%;inset-inline-start:calc(50% - 1px)}.wsr-bi .trace-minimap-resize-handle[data-edge=left]{inset-inline-start:-.375rem}.wsr-bi .trace-minimap-resize-handle[data-edge=right]{inset-inline-end:-.375rem}.wsr-bi .trace-minimap-window[data-full=true]{pointer-events:none;background:0 0;border:0}.wsr-bi .trace-waterfall-toolbar{align-items:center;gap:var(--space-grid);border-block-end:1px solid var(--border-default);grid-template-columns:minmax(7rem,1fr) minmax(15rem,21rem) minmax(7rem,1fr);min-height:3rem;padding:.45rem .75rem;display:grid}.wsr-bi .trace-waterfall-heading,.wsr-bi .trace-waterfall-actions{align-items:center;gap:var(--space-tight);display:flex}.wsr-bi .trace-waterfall-actions{justify-self:end}.wsr-bi .trace-waterfall-heading>strong{font-size:var(--type-label-size);margin-inline-end:.4rem}.wsr-bi .trace-waterfall-actions button{min-height:1.65rem}.wsr-bi .trace-waterfall-actions .wsr-button[data-icon-button=true]:is(:hover,:focus-visible){border-color:var(--interaction-accent);background:var(--interaction-selection);color:var(--interaction-accent)}.wsr-bi .trace-waterfall-toolbar input{width:100%;min-height:2rem}.wsr-bi .trace-waterfall-table{grid-template-columns:minmax(16rem,19rem) minmax(0,1fr);align-items:start;min-width:0;display:grid}.wsr-bi .trace-waterfall-label-pane{border-inline-end:1px solid var(--border-strong);min-width:0}.wsr-bi .trace-waterfall-column-head{border-block-end:1px solid var(--border-default);height:2rem;color:var(--content-secondary);font-size:var(--type-caption-size);text-transform:uppercase;align-items:center;padding-inline:.85rem;font-weight:700;display:flex}.wsr-bi .trace-waterfall-label-rows{flex-direction:column;min-width:0;display:flex;position:absolute;inset-block-start:0;inset-inline:0}.wsr-bi .trace-waterfall-scroll-viewport{overscroll-behavior:contain;scrollbar-gutter:stable;overflow:hidden auto}.wsr-bi .trace-waterfall-scroll-space{min-width:0;position:relative}.wsr-bi .trace-waterfall-row{cursor:pointer;align-items:stretch;height:3rem;min-height:3rem;display:flex}.wsr-bi .trace-node-label{align-items:stretch;gap:.3rem;width:100%;min-width:0;padding:0 .65rem 0 0;display:flex}.wsr-bi .trace-indent-items{flex:none;align-self:stretch;display:flex}.wsr-bi .trace-indent-item{--trace-indent-color:var(--data-series-1);background:var(--trace-indent-color);width:.65rem;display:block}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-indent-item{background:color-mix(in srgb, var(--trace-indent-color) 24%, transparent)}}.wsr-bi .trace-indent-item[data-guide-depth="1"]{--trace-indent-color:var(--data-series-2)}.wsr-bi .trace-indent-item[data-guide-depth="2"]{--trace-indent-color:var(--data-series-3)}.wsr-bi .trace-indent-item[data-guide-depth="3"]{--trace-indent-color:var(--data-series-4)}.wsr-bi .trace-indent-item[data-guide-depth="4"]{--trace-indent-color:var(--data-series-5)}.wsr-bi .trace-indent-item[data-guide-depth="5"]{--trace-indent-color:var(--data-series-6)}.wsr-bi .trace-collapse-control,.wsr-bi .trace-collapse-placeholder{align-self:center;width:1.25rem;height:1.25rem}.wsr-bi .trace-view .trace-collapse-control{min-height:0;color:var(--content-secondary);background:0 0;border:0;place-items:center;padding:0;font-size:1rem;display:grid}.wsr-bi .trace-view .trace-node-main{text-align:start;background:0 0;border:0;border-radius:0;flex:auto;align-content:center;gap:.15rem;min-width:0;min-height:0;padding:0;display:grid}.wsr-bi .trace-node-title-line{align-items:center;gap:.4rem;min-width:0;display:flex}.wsr-bi .trace-node-title-line>strong{font-size:var(--type-label-size);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.wsr-bi .trace-node-main>small{color:var(--content-muted);font:var(--type-caption-size) var(--type-code-family);text-overflow:ellipsis;white-space:nowrap;padding-inline-start:0;overflow:hidden}.wsr-bi .trace-waterfall-row{border-block-end:0}.wsr-bi .trace-waterfall-row:nth-child(2n){background:var(--surface-raised)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-waterfall-row:nth-child(2n){background:color-mix(in srgb, var(--surface-raised) 42%, var(--surface-panel))}}.wsr-bi .trace-waterfall-row.is-selected{background:var(--interaction-selection)}.wsr-bi .trace-waterfall-chart{background:var(--surface-inset);min-width:0;display:block;overflow:hidden}.wsr-bi .trace-waterfall-axis-line,.wsr-bi .trace-waterfall-gridline{stroke:var(--border-strong);stroke-width:1px;vector-effect:non-scaling-stroke}.wsr-bi .trace-waterfall-gridline{opacity:.64}.wsr-bi .trace-waterfall-axis-tick{pointer-events:none}.wsr-bi .trace-waterfall-axis-tick text{fill:var(--content-muted);font:normal var(--type-caption-size) var(--type-code-family)}.wsr-bi .trace-waterfall-lane{cursor:pointer;outline:none}.wsr-bi .trace-waterfall-lane-hit-target{fill:#0000}.wsr-bi .trace-waterfall-lane[data-selected=true] .trace-waterfall-lane-hit-target{fill:var(--interaction-selection)}.wsr-bi .trace-waterfall-lane:focus-visible .trace-waterfall-lane-hit-target{stroke:var(--focus-ring);stroke-width:2px;vector-effect:non-scaling-stroke}.wsr-bi .trace-waterfall-chart .trace-timeline-bar{--trace-waterfall-color:var(--data-series-1);fill:var(--trace-waterfall-color)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-waterfall-chart .trace-timeline-bar{fill:color-mix(in srgb, var(--trace-waterfall-color) 45%, var(--surface-panel))}}.wsr-bi .trace-waterfall-chart .trace-timeline-bar{stroke:var(--trace-waterfall-color);stroke-width:1px;vector-effect:non-scaling-stroke}.wsr-bi .trace-waterfall-chart .trace-timeline-bar[data-color-index="1"]{--trace-waterfall-color:var(--data-series-2)}.wsr-bi .trace-waterfall-chart .trace-timeline-bar[data-color-index="2"]{--trace-waterfall-color:var(--data-series-3)}.wsr-bi .trace-waterfall-chart .trace-timeline-bar[data-color-index="3"]{--trace-waterfall-color:var(--data-series-4)}.wsr-bi .trace-waterfall-chart .trace-timeline-bar[data-color-index="4"]{--trace-waterfall-color:var(--data-series-5)}.wsr-bi .trace-waterfall-chart .trace-timeline-bar[data-color-index="5"]{--trace-waterfall-color:var(--data-series-6)}.wsr-bi .trace-waterfall-chart .trace-timeline-bar.trace-status-error{fill:var(--status-error)}@supports (color:color-mix(in lab, red, red)){.wsr-bi .trace-waterfall-chart .trace-timeline-bar.trace-status-error{fill:color-mix(in srgb, var(--status-error) 35%, var(--surface-panel))}}.wsr-bi .trace-waterfall-chart .trace-timeline-bar.trace-status-error{stroke:var(--status-error)}.wsr-bi .trace-waterfall-lane[data-selected=true] .trace-timeline-bar{stroke-width:2px}.wsr-bi .trace-waterfall-chart .trace-timeline-label{fill:var(--content-primary);font-size:var(--type-label-size);pointer-events:none;font-weight:650}.wsr-bi :is(.trace-waterfall-timeline,.trace-timeline-label)[data-motion-phase]{transform-box:fill-box;transform-origin:50%;animation-duration:.28s;animation-timing-function:cubic-bezier(.22,1,.36,1);animation-fill-mode:both}.wsr-bi :is(.trace-waterfall-timeline,.trace-timeline-label)[data-motion-phase=enter][data-motion-direction=right]{animation-name:trace-timeline-enter-right}.wsr-bi :is(.trace-waterfall-timeline,.trace-timeline-label)[data-motion-phase=enter][data-motion-direction=left]{animation-name:trace-timeline-enter-left}.wsr-bi :is(.trace-waterfall-timeline,.trace-timeline-label)[data-motion-phase=exit][data-motion-direction=right]{animation-name:trace-timeline-exit-right}.wsr-bi :is(.trace-waterfall-timeline,.trace-timeline-label)[data-motion-phase=exit][data-motion-direction=left]{animation-name:trace-timeline-exit-left}.wsr-bi[data-motion=off] :is(.trace-waterfall-timeline,.trace-timeline-label){animation:none}@keyframes trace-timeline-enter-right{0%{opacity:0;transform:translate(-1.5rem)}to{opacity:1;transform:translate(0)}}@keyframes trace-timeline-enter-left{0%{opacity:0;transform:translate(1.5rem)}to{opacity:1;transform:translate(0)}}@keyframes trace-timeline-exit-right{0%{opacity:1;transform:translate(0)}to{opacity:0;transform:translate(1.5rem)}}@keyframes trace-timeline-exit-left{0%{opacity:1;transform:translate(0)}to{opacity:0;transform:translate(-1.5rem)}}.wsr-bi .trace-node-label>.numeric-exact,.wsr-bi .trace-node-label>.trace-error{font-size:var(--type-caption-size);align-self:center}@media (width<=64rem){.wsr-bi .trace-summary-dense{grid-template-columns:1fr}.wsr-bi .trace-summary-metrics{justify-content:flex-start}}@media (width<=40rem){.wsr-bi .trace-summary-metrics{grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.wsr-bi .trace-minimap{display:none}.wsr-bi .trace-waterfall-toolbar{grid-template-columns:1fr}.wsr-bi .trace-waterfall-actions{justify-self:start}}@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-leading:initial;--tw-font-weight:initial;--tw-tracking:initial;--tw-border-style:solid}}}.wsr-bi .wsr-typography{color:var(--content-primary);margin:0}.wsr-bi .wsr-typography[data-variant=h1]{font-size:var(--type-h1-size);--tw-leading:var(--leading-tight,1.25);line-height:var(--leading-tight,1.25);--tw-font-weight:var(--font-weight-semibold,600);font-weight:var(--font-weight-semibold,600)}.wsr-bi .wsr-typography[data-variant=h2]{font-size:var(--type-heading-size);--tw-leading:var(--leading-snug,1.375);line-height:var(--leading-snug,1.375);--tw-font-weight:var(--font-weight-semibold,600);font-weight:var(--font-weight-semibold,600)}.wsr-bi .wsr-typography[data-variant=subtitle1]{font-size:var(--type-subtitle-size);--tw-leading:var(--leading-snug,1.375);line-height:var(--leading-snug,1.375);--tw-font-weight:var(--font-weight-semibold,600);font-weight:var(--font-weight-semibold,600)}.wsr-bi .wsr-typography[data-variant=body1]{font-size:var(--type-body-size);--tw-leading:var(--leading-relaxed,1.625);line-height:var(--leading-relaxed,1.625)}.wsr-bi .wsr-typography[data-variant=body2]{font-size:var(--type-body-small-size);--tw-leading:var(--leading-relaxed,1.625);line-height:var(--leading-relaxed,1.625)}.wsr-bi .wsr-typography[data-variant=caption]{font-size:var(--type-caption-size);color:var(--content-secondary)}.wsr-bi .wsr-typography[data-variant=overline]{font-size:var(--type-overline-size);--tw-font-weight:var(--font-weight-bold,700);font-weight:var(--font-weight-bold,700);--tw-tracking:var(--tracking-widest,.1em);letter-spacing:var(--tracking-widest,.1em);color:var(--content-secondary);text-transform:uppercase}.wsr-bi .wsr-typography[data-family=mono]{font-family:var(--type-code-family)}.wsr-bi .wsr-typography[data-weight=regular]{--tw-font-weight:var(--font-weight-normal,400);font-weight:var(--font-weight-normal,400)}.wsr-bi .wsr-typography[data-weight=medium]{--tw-font-weight:var(--font-weight-medium,500);font-weight:var(--font-weight-medium,500)}.wsr-bi .wsr-typography[data-weight=semibold]{--tw-font-weight:var(--font-weight-semibold,600);font-weight:var(--font-weight-semibold,600)}.wsr-bi .wsr-typography[data-weight=bold]{--tw-font-weight:var(--font-weight-bold,700);font-weight:var(--font-weight-bold,700)}.wsr-bi .wsr-typography[data-tone=primary]{color:var(--content-primary)}.wsr-bi .wsr-typography[data-tone=secondary]{color:var(--content-secondary)}.wsr-bi .wsr-typography[data-tone=muted]{color:var(--content-muted)}.wsr-bi .wsr-typography[data-tone=inverse]{color:var(--content-inverse)}.wsr-bi .wsr-typography[data-tone=error]{color:var(--status-error)}.wsr-bi .wsr-typography[data-tone=warning]{color:var(--status-attention)}.wsr-bi .wsr-typography[data-tone=success]{color:var(--status-available)}.wsr-bi .wsr-typography[data-italic]{font-style:italic}.wsr-bi .wsr-typography[data-underline]{text-decoration-line:underline}.wsr-bi .wsr-typography[data-truncate]{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.wsr-bi .wsr-button{min-height:calc(var(--spacing,.25rem) * 8);justify-content:center;align-items:center;gap:calc(var(--spacing,.25rem) * 1.5);border-radius:var(--shape-control);border-style:var(--tw-border-style);padding-inline:calc(var(--spacing,.25rem) * 2.5);padding-block:calc(var(--spacing,.25rem) * 1.5);font-size:var(--type-label-size);color:var(--content-primary);border-width:1px;display:inline-flex}.wsr-bi .wsr-button[data-appearance=outline]{border-color:var(--border-strong);background-color:var(--surface-raised)}.wsr-bi .wsr-button[data-appearance=ghost]{color:var(--content-secondary);background-color:#0000;border-color:#0000}.wsr-bi .wsr-button[data-appearance=solid][data-tone=primary]{border-color:var(--interaction-accent);background-color:var(--interaction-selection)}.wsr-bi .wsr-button[data-appearance=solid][data-tone=danger]{border-color:var(--status-error);background-color:var(--status-error-surface);color:var(--status-error)}.wsr-bi .wsr-button[data-appearance=segment]{min-height:calc(var(--spacing,.25rem) * 7);background-color:#0000;border-color:#0000}.wsr-bi .wsr-button[data-appearance=segment][aria-pressed=true]{border-color:var(--interaction-accent);background-color:var(--interaction-selection)}.wsr-bi .wsr-button:disabled{cursor:not-allowed;opacity:.5}.wsr-bi .wsr-button[data-icon-button=true]{min-height:calc(var(--spacing,.25rem) * 7);width:calc(var(--spacing,.25rem) * 7);min-width:calc(var(--spacing,.25rem) * 7);padding:0}.wsr-bi .wsr-button[data-icon-button=true] svg{height:calc(var(--spacing,.25rem) * 3.5);width:calc(var(--spacing,.25rem) * 3.5);fill:none;stroke:currentColor;stroke-width:1.35px;stroke-linecap:round;stroke-linejoin:round}.wsr-bi .wsr-button-group{align-items:center;gap:calc(var(--spacing,.25rem) * 1.5);flex-wrap:wrap;display:flex}.wsr-bi .wsr-button-group[data-segmented]{gap:var(--spacing,.25rem);border-radius:var(--shape-control);border-style:var(--tw-border-style);border-width:1px;border-color:var(--border-default);background-color:var(--surface-inset);padding:calc(var(--spacing,.25rem) * .5)}.wsr-bi .wsr-surface{border-radius:var(--shape-panel);border-style:var(--tw-border-style);border-width:1px;border-color:var(--border-default);background-color:var(--surface-section);min-width:0}.wsr-bi .wsr-surface[data-level=panel]{background-color:var(--surface-panel)}.wsr-bi .wsr-surface[data-level=inset]{border-radius:var(--shape-control);background-color:var(--surface-inset)}.wsr-bi .wsr-surface[data-level=raised]{background-color:var(--surface-raised)}.wsr-bi .wsr-surface[data-border=dashed]{--tw-border-style:dashed;border-style:dashed}.wsr-bi .wsr-surface[data-border=none]{border-style:var(--tw-border-style);border-width:0}.wsr-bi .wsr-divider{border-style:var(--tw-border-style);background-color:var(--border-default);border-width:0;width:100%;height:1px;margin:0}.wsr-bi .wsr-input{min-height:calc(var(--spacing,.25rem) * 8);border-radius:var(--shape-control);border-style:var(--tw-border-style);border-width:1px;border-color:var(--border-strong);background-color:var(--surface-inset);min-width:0;padding-inline:calc(var(--spacing,.25rem) * 2.5);font-size:var(--type-label-size);color:var(--content-primary);--tw-outline-style:none;outline-style:none}.wsr-bi .wsr-input:focus{border-color:var(--interaction-accent)}.wsr-bi .wsr-status-badge{padding-inline:calc(var(--spacing,.25rem) * 2);padding-block:calc(var(--spacing,.25rem) * .5);font-size:var(--type-overline-size);--tw-font-weight:var(--font-weight-bold,700);font-weight:var(--font-weight-bold,700);text-transform:uppercase;border-radius:2147483647px;align-items:center;display:inline-flex}.wsr-bi .wsr-status-badge[data-status=available],.wsr-bi .wsr-status-badge[data-status=selected]{background-color:var(--interaction-selection);color:var(--interaction-accent)}.wsr-bi .wsr-status-badge[data-status=partial]{background-color:var(--status-attention-surface);color:var(--status-attention)}.wsr-bi .wsr-status-badge[data-status=unavailable]{background-color:var(--surface-raised);color:var(--content-secondary)}.wsr-bi .wsr-status-badge[data-status=error]{background-color:var(--status-error-surface);color:var(--status-error)}@property --tw-leading{syntax:"*";inherits:false}@property --tw-font-weight{syntax:"*";inherits:false}@property --tw-tracking{syntax:"*";inherits:false}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}
/*$vite$:1*/`;

// packages/studio/src/client/evaluate-model.js
var STORAGE_KEY = "wsr.studio.location@1";
var MAX_URL_BYTES = 8 * 1024;
var TASK_ID = /^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,127}$/u;
var TRACE_ID = /^[a-f0-9]{32}$/u;
var SPAN_ID = /^[a-f0-9]{16}$/u;
var encoder = new TextEncoder();
function validIds(ids) {
  return Array.isArray(ids) && ids.length >= 1 && ids.length <= 24 && ids.every((id2) => typeof id2 === "string" && TASK_ID.test(id2)) && new Set(ids).size === ids.length;
}
function canonicalIds(ids) {
  if (!validIds(ids)) throw new Error("INVALID_SELECTION");
  return [...ids].sort((left, right) => {
    const leftBytes = encoder.encode(left);
    const rightBytes = encoder.encode(right);
    const length = Math.min(leftBytes.length, rightBytes.length);
    for (let index = 0; index < length; index += 1) {
      const difference = leftBytes[index] - rightBytes[index];
      if (difference !== 0) return difference;
    }
    return leftBytes.length - rightBytes.length;
  });
}
function selectionParams(selection2) {
  if (selection2.mode === "single") return [["task", canonicalIds(selection2.taskIds)]];
  if (selection2.mode === "compare") return [
    ["mode", ["compare"]],
    ["left_task", canonicalIds(selection2.leftTaskIds)],
    ["right_task", canonicalIds(selection2.rightTaskIds)]
  ];
  throw new Error("INVALID_SELECTION");
}
function appendSelection(params, selection2) {
  params.set("v", "1");
  for (const [key, values] of selectionParams(selection2)) for (const value of values) params.append(key, value);
}
function bounded(value) {
  if (encoder.encode(value).byteLength > MAX_URL_BYTES) throw new Error("STUDIO_URL_BOUND_EXCEEDED");
  return value;
}
function serializeStudioLocation(route) {
  if (route.page === "select") return "/evaluate";
  const params = new URLSearchParams();
  appendSelection(params, route.selection);
  if (route.page === "results") return bounded(`/evaluate?${params}`);
  if (route.page === "receipt") return bounded(`/evaluate/receipt?${params}`);
  if (route.page === "facts") {
    params.set("metric", route.metric);
    params.set("scope", route.scope);
    return bounded(`/evaluate/facts?${params}`);
  }
  if (route.page === "trace" && TRACE_ID.test(route.traceId) && (route.spanId === void 0 || SPAN_ID.test(route.spanId))) {
    if (route.spanId !== void 0) params.set("span", route.spanId);
    return bounded(`/evaluate/trace/${route.traceId}?${params}`);
  }
  throw new Error("UNKNOWN_STUDIO_ROUTE");
}
function parseSelection(params) {
  if (params.get("v") !== "1" || params.getAll("v").length !== 1) return void 0;
  if (params.get("mode") === "compare") {
    const leftTaskIds = params.getAll("left_task");
    const rightTaskIds = params.getAll("right_task");
    return validIds(leftTaskIds) && validIds(rightTaskIds) ? { mode: "compare", leftTaskIds: canonicalIds(leftTaskIds), rightTaskIds: canonicalIds(rightTaskIds) } : void 0;
  }
  if (params.has("mode")) return void 0;
  const taskIds = params.getAll("task");
  return validIds(taskIds) ? { mode: "single", taskIds: canonicalIds(taskIds) } : void 0;
}
function only(params, keys) {
  const allowed = new Set(keys);
  return [...params.keys()].every((key) => allowed.has(key));
}
function parseStudioLocation(relativeUrl) {
  if (typeof relativeUrl !== "string" || encoder.encode(relativeUrl).byteLength > MAX_URL_BYTES) {
    return { page: "invalid", reason: "STUDIO_URL_BOUND_EXCEEDED" };
  }
  let url;
  try {
    url = new URL(relativeUrl, "http://studio.local");
  } catch {
    return { page: "invalid", reason: "UNKNOWN_STUDIO_ROUTE" };
  }
  if (url.origin !== "http://studio.local" || url.hash !== "") return { page: "invalid", reason: "UNKNOWN_STUDIO_ROUTE" };
  if (url.pathname === "/evaluate" && url.search === "") return { page: "select" };
  if (url.pathname !== "/evaluate" && url.pathname !== "/evaluate/receipt" && url.pathname !== "/evaluate/facts" && !url.pathname.startsWith("/evaluate/trace/")) return { page: "invalid", reason: "UNKNOWN_STUDIO_ROUTE" };
  const selection2 = parseSelection(url.searchParams);
  if (selection2 === void 0) return { page: "invalid", reason: "INVALID_SELECTION" };
  const baseKeys = selection2.mode === "single" ? ["v", "task"] : ["v", "mode", "left_task", "right_task"];
  if (url.pathname === "/evaluate" && only(url.searchParams, baseKeys)) return { page: "results", selection: selection2 };
  if (url.pathname === "/evaluate/receipt" && only(url.searchParams, baseKeys)) return { page: "receipt", selection: selection2 };
  if (url.pathname === "/evaluate/facts" && only(url.searchParams, [...baseKeys, "metric", "scope"])) {
    const metric = url.searchParams.get("metric");
    const scope = url.searchParams.get("scope");
    if (metric !== null && metric.length <= 256 && ["result", "related", "read-set"].includes(scope)) {
      return { page: "facts", selection: selection2, metric, scope };
    }
  }
  if (url.pathname.startsWith("/evaluate/trace/") && only(url.searchParams, [...baseKeys, "span"])) {
    const traceId = url.pathname.slice("/evaluate/trace/".length);
    const spanId = url.searchParams.get("span") ?? void 0;
    if (TRACE_ID.test(traceId) && (spanId === void 0 || SPAN_ID.test(spanId))) return { page: "trace", selection: selection2, traceId, ...spanId === void 0 ? {} : { spanId } };
  }
  return { page: "invalid", reason: "UNKNOWN_STUDIO_ROUTE" };
}
function sideResults(result) {
  if (result?.mode === "SINGLE" && result.result?.tag === "SIDE_RESULT") {
    return [{ side: "single", value: result.result }];
  }
  if (result?.mode !== "COMPARE") return [];
  return [
    ...result.left?.tag === "SIDE_RESULT" ? [{ side: "left", value: result.left }] : [],
    ...result.right?.tag === "SIDE_RESULT" ? [{ side: "right", value: result.right }] : []
  ];
}
function projectStudioPresentation(snapshot) {
  const sides = sideResults(snapshot.result);
  const metrics = /* @__PURE__ */ new Map();
  for (const { side: side2, value } of sides) {
    for (const metric of value.metric_results ?? []) {
      const coordinate = `${metric.metric_id}@${metric.metric_version}`;
      const current = metrics.get(coordinate) ?? { coordinate, sides: [] };
      current.sides.push({ side: side2, slices: metric.slices ?? [] });
      metrics.set(coordinate, current);
    }
  }
  return Object.freeze({
    mode: snapshot.result?.mode === "COMPARE" ? "compare" : snapshot.result?.mode === "SINGLE" ? "single" : "empty",
    phase: snapshot.phase,
    page: snapshot.route?.page ?? "select",
    metrics: Object.freeze([...metrics.values()]),
    deltas: Object.freeze(snapshot.result?.mode === "COMPARE" ? [...snapshot.result.deltas ?? []] : []),
    receipts: Object.freeze(sides.map(({ side: side2, value }) => ({ side: side2, receipt: value.receipt }))),
    facts: Object.freeze([...snapshot.drilldown?.facts ?? []]),
    trace: Object.freeze([...snapshot.drilldown?.trace ?? []]),
    drilldownError: snapshot.drilldown?.error
  });
}
function bodyFor(selection2) {
  if (selection2.mode === "single") return {
    api_version: 1,
    mode: "SINGLE",
    selection: { selection_version: 1, task_ids: canonicalIds(selection2.taskIds) }
  };
  return {
    api_version: 1,
    mode: "COMPARE",
    left: { selection_version: 1, task_ids: canonicalIds(selection2.leftTaskIds) },
    right: { selection_version: 1, task_ids: canonicalIds(selection2.rightTaskIds) }
  };
}
var incompatibleResponse = Object.freeze({
  code: "incompatible-response",
  message: "Studio received an incompatible formal API response"
});
function validTaskPage(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) && value.contract?.name === "evidence.query" && value.contract?.revision === "1.0.0" && value.observation_profile === "2.0.0" && value.read_model_revision === "2.0.0" && typeof value.snapshot === "string" && value.snapshot !== "" && Array.isArray(value.items) && value.items.length <= 200 && value.items.every((item) => item !== null && typeof item === "object" && TASK_ID.test(item.task_id)) && (value.next_cursor === null || typeof value.next_cursor === "string");
}
function side(value, catalogCoordinates) {
  return value?.tag === "SIDE_RESULT" ? Array.isArray(value.metric_results) && value.receipt !== null && typeof value.receipt === "object" && (catalogCoordinates === void 0 || value.metric_results.length === catalogCoordinates.length && value.metric_results.every((metric, index) => `${metric.metric_id}@${metric.metric_version}` === catalogCoordinates[index])) : value?.tag === "SIDE_ERROR" && typeof value.code === "string";
}
function validComputeResponse(value, catalogCoordinates) {
  if (value?.api_version !== 1) return false;
  if (value.mode === "SINGLE") return side(value.result, catalogCoordinates) && value.result.tag === "SIDE_RESULT";
  return value.mode === "COMPARE" && ["FULL_COMPARE", "PARTIAL_COMPARE"].includes(value.status) && side(value.left, catalogCoordinates) && side(value.right, catalogCoordinates) && Array.isArray(value.deltas);
}
function initialRoute(storage, context) {
  const saved = storage?.getItem(STORAGE_KEY);
  if (saved !== null && saved !== void 0) {
    const parsed = parseStudioLocation(saved);
    if (parsed.page !== "invalid") return parsed;
  }
  return context?.taskId !== void 0 && TASK_ID.test(context.taskId) ? { page: "results", selection: { mode: "single", taskIds: [context.taskId] } } : { page: "select" };
}
function createEvaluateController({ gateway, storage, initialContext, catalogCoordinates } = {}) {
  if (gateway === void 0 || typeof gateway.call !== "function") throw new Error("STUDIO_GATEWAY_REQUIRED");
  const route = initialRoute(storage, initialContext);
  let snapshot = {
    phase: "idle",
    route,
    selection: route.selection,
    recentSelection: route.selection,
    taskList: { phase: "idle", items: [] },
    drilldown: { phase: "idle", facts: [], trace: [] },
    result: void 0,
    error: void 0,
    refreshing: false
  };
  const listeners = /* @__PURE__ */ new Set();
  const publish = (change) => {
    snapshot = { ...snapshot, ...change };
    for (const listener of listeners) listener();
  };
  const persist = (nextRoute) => {
    snapshot = { ...snapshot, route: nextRoute };
    storage?.setItem(STORAGE_KEY, serializeStudioLocation(nextRoute));
    for (const listener of listeners) listener();
  };
  const controller = {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setSelection(selection2) {
      bodyFor(selection2);
      publish({ selection: selection2, recentSelection: selection2, route: { page: "results", selection: selection2 }, phase: "idle", error: void 0 });
      storage?.setItem(STORAGE_KEY, serializeStudioLocation({ page: "results", selection: selection2 }));
    },
    clearSelection() {
      const nextRoute = { page: "select" };
      snapshot = {
        ...snapshot,
        phase: "idle",
        route: nextRoute,
        selection: void 0,
        result: void 0,
        error: void 0,
        refreshing: false,
        drilldown: { phase: "idle", facts: [], trace: [] }
      };
      storage?.setItem(STORAGE_KEY, serializeStudioLocation(nextRoute));
      for (const listener of listeners) listener();
    },
    async loadTasks(cursor) {
      publish({ taskList: { ...snapshot.taskList, phase: "loading", error: void 0 } });
      const answer = await gateway.call("tasks/list", { limit: 100, ...cursor === void 0 ? {} : { cursor } });
      if (!answer.ok) {
        publish({ taskList: { ...snapshot.taskList, phase: "error", error: answer.error } });
        return;
      }
      if (!validTaskPage(answer.value)) {
        publish({ taskList: { ...snapshot.taskList, phase: "error", error: incompatibleResponse } });
        return;
      }
      const prior = cursor === void 0 ? [] : snapshot.taskList.items;
      const byId = new Map([...prior, ...answer.value.items].map((item) => [item.task_id, item]));
      const items = [...byId.values()].sort((left, right) => canonicalIds([left.task_id, right.task_id])[0] === left.task_id ? -1 : 1);
      publish({ taskList: { phase: "ready", items, page: answer.value } });
    },
    async evaluate() {
      if (snapshot.selection === void 0) throw new Error("INVALID_SELECTION");
      const retaining = snapshot.result !== void 0;
      publish({ phase: retaining ? snapshot.phase : "loading", refreshing: retaining, error: void 0 });
      const answer = await gateway.call("evaluations/compute", bodyFor(snapshot.selection));
      if (!answer.ok) {
        publish({ phase: retaining ? "degraded" : "error", refreshing: false, error: answer.error });
        return;
      }
      if (!validComputeResponse(answer.value, catalogCoordinates)) {
        publish({ phase: retaining ? "degraded" : "error", refreshing: false, error: incompatibleResponse });
        return;
      }
      const phase = answer.value?.mode === "COMPARE" && answer.value.status === "PARTIAL_COMPARE" ? "partial" : "ready";
      const nextRoute = { page: "results", selection: snapshot.selection };
      snapshot = { ...snapshot, phase, refreshing: false, error: void 0, result: answer.value, route: nextRoute };
      storage?.setItem(STORAGE_KEY, serializeStudioLocation(nextRoute));
      for (const listener of listeners) listener();
    },
    async refresh() {
      await controller.evaluate();
    },
    async loadFacts(filters) {
      publish({ drilldown: { ...snapshot.drilldown, phase: "loading", error: void 0 } });
      const answer = await gateway.call("facts/read", filters);
      if (!answer.ok) {
        publish({ drilldown: { ...snapshot.drilldown, phase: "error", error: answer.error } });
        return;
      }
      publish({ drilldown: { ...snapshot.drilldown, phase: "ready", facts: answer.value.items ?? [], error: void 0 } });
    },
    async loadMetricFacts(metricCoordinate, scope = "result") {
      if (!["result", "related", "read-set"].includes(scope) || snapshot.result === void 0) return;
      const sides = sideResults(snapshot.result);
      const metric = sides.flatMap(({ value }) => value.metric_results ?? []).find((candidate) => `${candidate.metric_id}@${candidate.metric_version}` === metricCoordinate);
      if (metric === void 0) {
        publish({ drilldown: { ...snapshot.drilldown, phase: "error", error: incompatibleResponse } });
        return;
      }
      const deliveryIds = [...new Set(sides.flatMap(({ value }) => value.receipt?.task_population ?? []).flatMap((task) => task.memberships ?? []).map((membership) => membership.delivery_id).filter((id2) => boundedText(id2, 256)))].sort();
      const resultRefs = new Set((metric.slices ?? []).flatMap((slice) => slice.provenance_refs ?? []));
      const readSetRefs = new Set(sides.flatMap(({ value }) => value.receipt?.input_refs ?? []).filter((reference) => reference.kind === "FACT").flatMap((reference) => [reference.identity, reference.provenance_ref]));
      const wanted = scope === "read-set" ? readSetRefs : resultRefs;
      publish({ drilldown: { ...snapshot.drilldown, phase: "loading", error: void 0 } });
      const facts = [];
      for (const delivery_id of deliveryIds) {
        const answer = await gateway.call("facts/read", { delivery_id, limit: 200 });
        if (!answer.ok) {
          publish({ drilldown: { ...snapshot.drilldown, phase: "error", error: answer.error } });
          return;
        }
        if (!Array.isArray(answer.value?.items)) {
          publish({ drilldown: { ...snapshot.drilldown, phase: "error", error: incompatibleResponse } });
          return;
        }
        facts.push(...answer.value.items);
      }
      const matches = (fact) => [fact?.id, fact?.provenance?.accepted_digest].some((identity4) => wanted.has(identity4));
      const selected = scope === "related" ? facts.filter((fact) => !matches(fact)) : facts.filter(matches);
      const returned = new Set(facts.flatMap((fact) => [fact?.id, fact?.provenance?.accepted_digest]));
      const references = [...wanted].sort().map((identity4) => ({ identity: identity4, loadedAsFact: returned.has(identity4) }));
      publish({ drilldown: { ...snapshot.drilldown, phase: "ready", facts: selected, references, error: void 0 } });
    },
    async loadTrace(filters) {
      publish({ drilldown: { ...snapshot.drilldown, phase: "loading", error: void 0 } });
      const answer = await gateway.call("traces/read", filters);
      if (!answer.ok) {
        publish({ drilldown: { ...snapshot.drilldown, phase: "error", error: answer.error } });
        return;
      }
      publish({ drilldown: { ...snapshot.drilldown, phase: "ready", trace: answer.value.items ?? [], error: void 0 } });
    },
    openReceipt() {
      if (snapshot.selection === void 0 || snapshot.result === void 0) return;
      persist({ page: "receipt", selection: snapshot.selection });
    },
    openFacts(metric, scope = "result") {
      if (snapshot.selection === void 0) return;
      persist({ page: "facts", selection: snapshot.selection, metric, scope });
    },
    openTrace(traceId, spanId) {
      if (snapshot.selection === void 0) return;
      persist({ page: "trace", selection: snapshot.selection, traceId, ...spanId === void 0 ? {} : { spanId } });
    },
    backToResults() {
      if (snapshot.selection === void 0) persist({ page: "select" });
      else persist({ page: "results", selection: snapshot.selection });
    }
  };
  return controller;
}
function boundedText(value, maximum) {
  return typeof value === "string" && value.trim() !== "" && value.length <= maximum;
}

// packages/studio/src/client/studio.js
var STUDIO_PAGES = Object.freeze([
  Object.freeze({ id: "evaluate", label: "Evaluate", routePrefix: "/evaluate" })
]);
var STUDIO_TRACE_VIEWS = Object.freeze([
  Object.freeze({ id: "waterfall", label: "Waterfall", renderer: "TraceWaterfall", note: "Exact span timing" }),
  Object.freeze({ id: "tree", label: "Tree", renderer: "TraceTree", note: "Deterministic geometry \xB7 depth \u2192 recorded start/end \u2192 Span ID" }),
  Object.freeze({ id: "statistics", label: "Statistics", renderer: "TraceStatistics", note: "Exact inventory \xB7 recorded-time aggregates \xB7 no inferred causality" })
]);
var ACCESSIBILITY = Object.freeze({
  routes: Object.freeze(STUDIO_PAGES.map((page) => page.label)),
  surface: "conversation-view",
  modal: false,
  landmarks: Object.freeze(["region", "navigation", "main"]),
  liveRegions: Object.freeze({ loading: "polite", error: "assertive" }),
  minimumTargetPixels: 44
});
function createStudioGatewayPort(ctx) {
  return Object.freeze({
    call(endpoint, payload, signal) {
      return ctx.connection.rpc.call("/wsr-studio", endpoint, payload, signal);
    }
  });
}
var viewStyle = {
  width: "100%",
  minHeight: "100%",
  overflow: "auto",
  color: "var(--dsw-alias-label-primary)",
  background: "var(--dsw-alias-bg-base)",
  padding: "clamp(11px, 2vw, 24px)",
  paddingBottom: "clamp(120px, 18vh, 180px)",
  boxSizing: "border-box"
};
var controlStyle = { minHeight: "44px", minWidth: "44px" };
var DEFAULT_LAYOUT = Object.freeze({
  schemaVersion: "wsr-dsh.studio-layout@1",
  columns: Object.freeze({ desktop: 12, tablet: 6, mobile: 1 }),
  panels: Object.freeze([
    ["operational-latency-ms", 3, 2, 3, 2, 1, 2],
    ["delivery-cycle-time-ms", 3, 2, 3, 2, 1, 2],
    ["operational-usage-availability", 3, 2, 3, 2, 1, 2],
    ["task-cohort-comparison-eligibility", 3, 2, 3, 2, 1, 2],
    ["role-template-rework-rate", 6, 3, 3, 3, 1, 3],
    ["role-model-task-outcome-rate", 6, 3, 3, 3, 1, 3],
    ["role-template-trajectory-partial-cost", 3, 2, 3, 2, 1, 2],
    ["trajectory-partial-cost", 3, 2, 3, 2, 1, 2],
    ["operational-attributable-cost", 3, 2, 3, 2, 1, 2],
    ["delivery-stage-reach", 12, 4, 6, 4, 1, 4],
    ["delivery-terminal-outcome-rate", 12, 4, 6, 4, 1, 4],
    ["operational-token-usage", 12, 4, 6, 4, 1, 4]
  ].map(([id2, dw, dh, tw, th, mw, mh]) => Object.freeze({
    id: id2,
    desktop: Object.freeze({ w: dw, h: dh }),
    tablet: Object.freeze({ w: tw, h: th }),
    mobile: Object.freeze({ w: mw, h: mh })
  })))
});
var DASHBOARD_STORAGE_KEY = "wsr.studio.dashboard-layout@1";
function createStudioTheme(mode) {
  if (mode !== "light" && mode !== "dark") throw new Error("UNKNOWN_STUDIO_THEME");
  return Object.freeze({
    mode,
    density: "compact",
    containerBorderStyle: "solid",
    surfaces: Object.freeze({
      section: "var(--dsw-alias-bg-layer-1)",
      panel: "var(--dsw-alias-bg-layer-1)",
      raised: "var(--dsw-alias-bg-layer-2)",
      inset: "var(--dsw-alias-bg-base)"
    }),
    traceIndentGuides: Object.freeze([
      "var(--dsw-alias-label-dimmed)",
      "oklch(75% 0.17 145)",
      "var(--dsw-alias-state-warning-primary)",
      "var(--dsw-alias-state-error-primary)"
    ])
  });
}
function createStudioDashboardState(panelIds) {
  if (!Array.isArray(panelIds) || new Set(panelIds).size !== panelIds.length || !panelIds.every((id2) => typeof id2 === "string" && id2.length > 0)) {
    throw new Error("INVALID_STUDIO_PANELS");
  }
  return Object.freeze({
    defaults: Object.freeze([...panelIds]),
    order: Object.freeze([...panelIds]),
    hidden: Object.freeze([]),
    sizes: Object.freeze({})
  });
}
function reduceStudioDashboardState(state, action) {
  if (action.type === "RESET" || action.type === "PRESET") {
    if (action.type === "PRESET" && action.preset !== "default") throw new Error("UNKNOWN_STUDIO_LAYOUT_PRESET");
    return createStudioDashboardState(state.defaults);
  }
  const known = state.order.includes(action.panelId);
  if (!known) throw new Error("UNKNOWN_STUDIO_PANEL");
  if (action.type === "REMOVE") return Object.freeze({
    ...state,
    hidden: Object.freeze([.../* @__PURE__ */ new Set([...state.hidden, action.panelId])])
  });
  if (action.type === "ADD") return Object.freeze({
    ...state,
    hidden: Object.freeze(state.hidden.filter((id2) => id2 !== action.panelId))
  });
  if (action.type === "RESIZE") {
    if (!["compact", "wide", "full"].includes(action.size)) throw new Error("UNKNOWN_STUDIO_PANEL_SIZE");
    return Object.freeze({ ...state, sizes: Object.freeze({ ...state.sizes, [action.panelId]: action.size }) });
  }
  if (action.type === "MOVE") {
    if (!state.order.includes(action.beforePanelId)) throw new Error("UNKNOWN_STUDIO_PANEL");
    const order = state.order.filter((id2) => id2 !== action.panelId);
    order.splice(order.indexOf(action.beforePanelId), 0, action.panelId);
    return Object.freeze({ ...state, order: Object.freeze(order) });
  }
  throw new Error("UNKNOWN_STUDIO_LAYOUT_ACTION");
}
function validDashboardState(value) {
  const uniqueStrings = (items) => Array.isArray(items) && items.every((item) => typeof item === "string" && item.length > 0) && new Set(items).size === items.length;
  return value !== null && typeof value === "object" && !Array.isArray(value) && uniqueStrings(value.defaults) && uniqueStrings(value.order) && uniqueStrings(value.hidden) && value.defaults.every((id2) => value.order.includes(id2)) && value.hidden.every((id2) => value.order.includes(id2)) && value.sizes !== null && typeof value.sizes === "object" && !Array.isArray(value.sizes) && Object.entries(value.sizes).every(([id2, size]) => value.order.includes(id2) && ["compact", "wide", "full"].includes(size));
}
function createStudioLayoutStore(storage) {
  return Object.freeze({
    load(fallback) {
      if (storage === void 0) return fallback;
      try {
        const encoded = storage.getItem(DASHBOARD_STORAGE_KEY);
        if (encoded === null) return fallback;
        const parsed = JSON.parse(encoded);
        if (!validDashboardState(parsed)) return fallback;
        return Object.freeze({
          defaults: Object.freeze([...parsed.defaults]),
          order: Object.freeze([...parsed.order]),
          hidden: Object.freeze([...parsed.hidden]),
          sizes: Object.freeze({ ...parsed.sizes })
        });
      } catch {
        return fallback;
      }
    },
    save(state) {
      if (!validDashboardState(state)) throw new Error("INVALID_STUDIO_LAYOUT_STATE");
      storage?.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(state));
    }
  });
}
var hostStyles = `
#wsr-studio-view { --wsr-surface-section:var(--dsw-alias-bg-layer-1); --wsr-surface-panel:var(--dsw-alias-bg-layer-1); --wsr-surface-raised:var(--dsw-alias-bg-layer-2); --wsr-surface-inset:var(--dsw-alias-bg-base); --wsr-shape-panel:10px; --wsr-shape-control:7px; --wsr-type-page-title:18px; --wsr-type-section-title:13px; --wsr-type-body:11px; --wsr-type-label:10px; --wsr-type-caption:9px; --wsr-type-code:9px; --wsr-type-micro:8px; }
#wsr-studio-view, #wsr-studio-view > *, #wsr-studio-view .studio-page-copy { min-width:0; max-width:100%; }
#wsr-studio-view [data-wsr-studio-region="header"] { overflow:hidden; }
#wsr-studio-view .studio-product-row, #wsr-studio-view .studio-page-row { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; padding:12px 14px; }
#wsr-studio-view .studio-product-row { min-height:47px; padding-block:0; border-bottom:1px solid var(--dsw-alias-border-l2); }
#wsr-studio-view .studio-breadcrumbs, #wsr-studio-view .studio-controls { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
#wsr-studio-view .studio-breadcrumbs { color:var(--dsw-alias-label-secondary); font-size:10px; }
#wsr-studio-view .studio-page-copy h1, #wsr-studio-view .studio-page-copy p, #wsr-studio-view .studio-selection-copy { margin:2px 0; }
#wsr-studio-view .studio-page-copy p { max-width:67ch; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
#wsr-studio-view .studio-eyebrow { display:block; }
#wsr-studio-view .studio-product-row .studio-controls { align-self:stretch; gap:3px; }
#wsr-studio-view .studio-view-link { min-height:47px; padding-inline:11px; border:0; border-bottom:2px solid transparent; border-radius:0; background:transparent; color:var(--dsw-alias-label-secondary); }
#wsr-studio-view .studio-view-link[aria-current="page"] { border-color:var(--dsw-alias-state-business-primary,#79a6ff); background:linear-gradient(transparent,color-mix(in srgb,var(--dsw-alias-state-business-primary,#79a6ff) 7%,transparent)); color:var(--dsw-alias-state-business-primary,#79a6ff); }
#wsr-studio-view .studio-trace-view-switcher { width:fit-content; }
#wsr-studio-view .studio-trace-view-navigation { display:flex; width:100%; min-width:0; align-items:center; justify-content:space-between; gap:12px; }
#wsr-studio-view .studio-trace-view-note { margin-inline-start:auto; text-align:end; }
#wsr-studio-view [data-wsr-studio-region="main"] { margin-top:12px; }
#wsr-studio-view .studio-selection-grid { display:grid; grid-template-columns:minmax(0,1.65fr) minmax(250px,.75fr); gap:12px; }
#wsr-studio-view .studio-selection-card { overflow:hidden; }
#wsr-studio-view .studio-selection-head { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; padding:12px 14px; border-bottom:1px solid var(--dsw-alias-border-l2); }
#wsr-studio-view .studio-selection-filter { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:8px; padding:8px; border-bottom:1px solid var(--dsw-alias-border-l2); }
#wsr-studio-view .studio-selection-filter .wsr-input { width:100%; }
#wsr-studio-view .studio-filter-options { display:flex; gap:5px; grid-column:1/-1; }
#wsr-studio-view .studio-filter-options button[aria-pressed="true"] { border-color:var(--dsw-alias-state-business-primary,#7199e7); color:var(--dsw-alias-state-business-primary,#7199e7); }
#wsr-studio-view .studio-task-list { display:grid; max-height:min(50vh,520px); margin:0; padding:5px 8px 9px; overflow:auto; list-style:none; }
#wsr-studio-view .studio-task-row { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; min-height:52px; gap:10px; padding:8px; border-bottom:1px solid var(--dsw-alias-border-l2); }
#wsr-studio-view .studio-task-row:last-child { border-bottom:0; }
#wsr-studio-view .studio-task-row label { display:flex; align-items:center; gap:9px; min-width:0; }
#wsr-studio-view .studio-task-row input[type="checkbox"] { width:17px; height:17px; margin:0; accent-color:var(--dsw-alias-state-business-primary,#7199e7); }
#wsr-studio-view .studio-task-id { display:block; overflow-wrap:anywhere; }
#wsr-studio-view .studio-selected-list { display:grid; gap:8px; padding:12px; }
#wsr-studio-view .studio-selected-item { padding:10px; border:1px solid var(--dsw-alias-border-l2); border-radius:8px; background:var(--studio-raised); }
#wsr-studio-view .studio-selected-item .wsr-typography { display:block; }
#wsr-studio-view [data-wsr-dashboard-layout] { display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); gap:12px; }
#wsr-studio-view [data-wsr-dashboard-panel] { grid-column:span var(--studio-panel-desktop-columns,3); min-width:0; }
#wsr-studio-view [data-wsr-studio-region="footer"] { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:12px; padding:12px 14px; }
@media (max-width:900px) { #wsr-studio-view [data-wsr-dashboard-layout] { grid-template-columns:repeat(6,minmax(0,1fr)); } #wsr-studio-view [data-wsr-dashboard-panel] { grid-column:span var(--studio-panel-tablet-columns,3); } }
@media (max-width:700px) {
  #wsr-studio-view .studio-selection-grid { grid-template-columns:1fr; }
  #wsr-studio-view .studio-product-row, #wsr-studio-view .studio-page-row { align-items:flex-start; flex-direction:column; }
  #wsr-studio-view .studio-product-row .studio-controls { width:100%; flex-wrap:nowrap; overflow:hidden; }
  #wsr-studio-view .studio-product-row .studio-controls > button { flex:1 1 0; min-width:0; }
  #wsr-studio-view .studio-view-link { min-height:36px; padding-inline:2px; font-size:8px; }
  #wsr-studio-view .studio-page-row { gap:8px; padding:10px 12px; }
  #wsr-studio-view .studio-page-copy p { overflow-wrap:anywhere; white-space:normal; }
  #wsr-studio-view .studio-page-actions { width:100%; flex-wrap:nowrap; gap:5px; }
  #wsr-studio-view .studio-page-actions > button { min-height:32px; padding-inline:8px; font-size:9px; }
  #wsr-studio-view .studio-page-actions > button:nth-child(2) { display:none; }
  #wsr-studio-view .studio-trace-view-note { display:none; }
}
@media (max-width:560px) { #wsr-studio-view [data-wsr-dashboard-layout] { grid-template-columns:1fr; } #wsr-studio-view [data-wsr-dashboard-panel] { grid-column:span 1 !important; } }
`;
function platformThemeMode(explicitMode) {
  if (explicitMode === "light" || explicitMode === "dark") return explicitMode;
  if (typeof document !== "undefined" && document.body?.hasAttribute("data-ds-dark-theme")) return "dark";
  if (typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}
function studioPanelPlacement(panelId, size) {
  if (size === "full") return { desktop: 12, tablet: 6, mobile: 1 };
  if (size === "wide") return { desktop: 6, tablet: 6, mobile: 1 };
  if (size === "compact") return { desktop: 3, tablet: 3, mobile: 1 };
  const configured = DEFAULT_LAYOUT.panels.find(({ id: id2 }) => id2 === panelId);
  return configured === void 0 ? { desktop: 3, tablet: 3, mobile: 1 } : { desktop: configured.desktop.w, tablet: configured.tablet.w, mobile: configured.mobile.w };
}
function sliceIdentity(sliceKey) {
  return JSON.stringify(Object.fromEntries(Object.entries(sliceKey ?? {}).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)));
}
function metricSlice(side2, coordinate, sliceKey) {
  if (side2?.tag !== "SIDE_RESULT") return void 0;
  const split = coordinate.lastIndexOf("@");
  const metric = side2.metric_results?.find((candidate) => candidate.metric_id === coordinate.slice(0, split) && candidate.metric_version === coordinate.slice(split + 1));
  const identity4 = sliceIdentity(sliceKey);
  return metric?.slices?.find((slice) => sliceIdentity(slice.slice_key) === identity4);
}
function factRow(fact) {
  if (typeof fact?.id !== "string" || typeof fact.kind !== "string" || typeof fact.provenance?.accepted_digest !== "string" || !Array.isArray(fact.compatibility?.dimensions) || typeof fact.truth?.availability !== "string") return void 0;
  const coordinates = Object.fromEntries(fact.compatibility.dimensions.map(({ field, value }) => [field, String(value)]));
  if (fact.compatibility.event_name !== null && fact.compatibility.event_name !== void 0) {
    coordinates.event_name = fact.compatibility.event_name;
  }
  if (fact.compatibility.family_schema !== null && fact.compatibility.family_schema !== void 0) {
    coordinates.family_schema = fact.compatibility.family_schema;
  }
  return {
    factId: fact.id,
    factClass: fact.kind,
    coordinates,
    provenance: fact.provenance.accepted_digest,
    truth: fact.truth,
    ...fact.source?.kind === "SPAN" ? {
      trace: { traceId: fact.source.trace_id, spanId: fact.source.span_id }
    } : {}
  };
}
function reduceSingleTaskSelection(_current, taskId, checked) {
  return checked ? Object.freeze({ mode: "single", taskIds: Object.freeze([taskId]) }) : void 0;
}
function StudioView(React2, Primitives2, Bi2, sharedStyles, controller, explicitThemeMode, layoutStorage) {
  const Button = Bi2.Button;
  const ButtonGroup = Bi2.ButtonGroup;
  const StatusBadge = Bi2.StatusBadge;
  const Surface = Bi2.Surface;
  const TextInput = Bi2.TextInput;
  const Typography = Bi2.Typography;
  const DisclosureRow = Primitives2.DisclosureRow;
  const JsonTree = Primitives2.JsonTree;
  return function StudioConversationView() {
    const [technicalDetailsOpen, setTechnicalDetailsOpen] = React2.useState(false);
    const [traceView, setTraceView] = React2.useState("waterfall");
    const [taskQuery, setTaskQuery] = React2.useState("");
    const [filtersOpen, setFiltersOpen] = React2.useState(false);
    const [taskFilter, setTaskFilter] = React2.useState("all");
    const [editingDashboard, setEditingDashboard] = React2.useState(false);
    const snapshot = React2.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    const [studioPage, setStudioPage] = React2.useState(() => snapshot.result !== void 0 || ["receipt", "facts", "trace"].includes(snapshot.route.page) ? "dashboard" : "selection");
    const [selectionRequested, setSelectionRequested] = React2.useState(false);
    React2.useEffect(() => {
      if (!selectionRequested && (snapshot.result !== void 0 || ["receipt", "facts", "trace"].includes(snapshot.route.page)) && studioPage !== "dashboard") {
        setStudioPage("dashboard");
      }
    }, [selectionRequested, snapshot.result, snapshot.route.page, studioPage]);
    React2.useEffect(() => {
      if (snapshot.drilldown.phase !== "idle") return;
      if (snapshot.route.page === "facts" && snapshot.result !== void 0) {
        void controller.loadMetricFacts(snapshot.route.metric, snapshot.route.scope);
      }
      if (snapshot.route.page === "trace") void controller.loadTrace({
        trace_id: snapshot.route.traceId,
        limit: 200
      });
    }, [snapshot.route.page, snapshot.result]);
    const presentation = projectStudioPresentation(snapshot);
    const deltaCoordinates = new Set(presentation.deltas.map((delta) => delta.metric_coordinate));
    const facts = presentation.facts.map(factRow);
    const factsCompatible = facts.every((row) => row !== void 0);
    let recorded;
    if (snapshot.route.page === "trace" && presentation.trace.length > 0) {
      try {
        recorded = Bi2.compileTraceView(presentation.trace);
      } catch {
        recorded = void 0;
      }
    }
    const theme = Bi2.createBiTheme(createStudioTheme(platformThemeMode(explicitThemeMode)));
    const json = (data, label) => JsonTree === void 0 ? React2.createElement("pre", { "aria-label": label }, JSON.stringify(data, null, 2)) : React2.createElement(JsonTree, { data, label, copyable: true, expandTopLevel: true });
    const taskItems = snapshot.taskList.items ?? [];
    const current = snapshot.selection?.mode === "single" ? snapshot.selection.taskIds : [];
    const before = snapshot.selection?.mode === "compare" ? snapshot.selection.leftTaskIds : [];
    const after = snapshot.selection?.mode === "compare" ? snapshot.selection.rightTaskIds : [];
    const selectedTaskIds = /* @__PURE__ */ new Set([...current, ...before, ...after]);
    const visibleTaskItems = taskItems.filter((task) => {
      const query = taskQuery.trim().toLocaleLowerCase();
      const matchesQuery = query === "" || task.task_id.toLocaleLowerCase().includes(query) || task.display_name?.toLocaleLowerCase().includes(query);
      const matchesFilter = taskFilter === "all" || taskFilter === "selected" === selectedTaskIds.has(task.task_id);
      return matchesQuery && matchesFilter;
    });
    const metricPanelIds = presentation.metrics.map((metric) => metric.coordinate.slice(0, metric.coordinate.lastIndexOf("@")));
    const layoutStore = createStudioLayoutStore(layoutStorage);
    const [dashboardState, setDashboardState] = React2.useState(() => layoutStore.load(createStudioDashboardState(DEFAULT_LAYOUT.panels.map(({ id: id2 }) => id2))));
    const [savedDashboardState, setSavedDashboardState] = React2.useState(dashboardState);
    const expandedDashboardState = dashboardState.order === void 0 ? dashboardState : {
      ...dashboardState,
      order: [...dashboardState.order, ...metricPanelIds.filter((id2) => !dashboardState.order.includes(id2))]
    };
    const dashboardMetrics = [...presentation.metrics].filter((metric) => !expandedDashboardState.hidden.includes(metric.coordinate.slice(0, metric.coordinate.lastIndexOf("@")))).sort((left, right) => expandedDashboardState.order.indexOf(left.coordinate.slice(0, left.coordinate.lastIndexOf("@"))) - expandedDashboardState.order.indexOf(right.coordinate.slice(0, right.coordinate.lastIndexOf("@"))));
    const updateDashboard = (action) => setDashboardState(
      reduceStudioDashboardState(expandedDashboardState, action)
    );
    const setTask = (id2, checked) => {
      const selection2 = reduceSingleTaskSelection(current, id2, checked);
      if (selection2 === void 0) controller.clearSelection();
      else controller.setSelection(selection2);
    };
    const setComparedTask = (side2, id2, checked) => {
      const selected = side2 === "left" ? before : after;
      const taskIds = checked ? [.../* @__PURE__ */ new Set([...selected, id2])] : selected.filter((value) => value !== id2);
      if (taskIds.length === 0) return;
      controller.setSelection({
        mode: "compare",
        leftTaskIds: side2 === "left" ? taskIds : before,
        rightTaskIds: side2 === "right" ? taskIds : after
      });
    };
    const chooseMode = (mode) => {
      if (mode === snapshot.selection?.mode) return;
      const seed = current[0] ?? before[0] ?? after[0] ?? taskItems[0]?.task_id;
      if (seed === void 0) return;
      controller.setSelection(mode === "single" ? { mode: "single", taskIds: [seed] } : { mode: "compare", leftTaskIds: [seed], rightTaskIds: [seed] });
    };
    const evaluateSelection = async () => {
      await controller.evaluate();
      if (controller.getSnapshot().result !== void 0) {
        setSelectionRequested(false);
        setStudioPage("dashboard");
      }
    };
    const pageIdentity = studioPage === "selection" ? { eyebrow: "New evaluation", title: "Select task population", detail: "Choose exact Task identities; display names are recognition only." } : snapshot.route.page === "trace" ? { eyebrow: "Recorded Evidence \xB7 exact identity", title: "Recorded Trace", detail: `${snapshot.route.traceId} \xB7 current evaluation \xB7 no inferred causality` } : snapshot.route.page === "facts" ? { eyebrow: "Evaluation Evidence", title: "Evidence", detail: "Exact recorded Facts and provenance for the current evaluation." } : snapshot.route.page === "receipt" ? { eyebrow: "Resolved evaluation context", title: "Evaluation receipt", detail: "Exact selection and resolved read-set identities." } : { eyebrow: `${snapshot.result?.mode === "COMPARE" ? "Compare" : "Single"} evaluation`, title: "Current evaluation", detail: "Current receipt \xB7 exact selection" };
    const traceViewDefinition = STUDIO_TRACE_VIEWS.find(({ id: id2 }) => id2 === traceView) ?? STUDIO_TRACE_VIEWS[0];
    const traceViewNavigation = React2.createElement(
      "nav",
      { className: "studio-trace-view-navigation", "aria-label": "Trace renderer navigation" },
      React2.createElement(
        ButtonGroup,
        { segmented: true, className: "studio-trace-view-switcher", "aria-label": "Trace renderer views" },
        ...STUDIO_TRACE_VIEWS.map((view) => React2.createElement(Button, { appearance: "segment", key: view.id, selected: traceView === view.id, type: "button", onClick: () => setTraceView(view.id) }, view.label))
      ),
      React2.createElement(Typography, { as: "span", className: "studio-trace-view-note", variant: "caption" }, traceViewDefinition.note)
    );
    return React2.createElement(Bi2.BiSurface, { className: "studio-theme-root", theme }, React2.createElement(
      "section",
      {
        id: "wsr-studio-view",
        role: "region",
        "aria-labelledby": "wsr-studio-title",
        "data-wsr-studio-view": "evaluate",
        style: viewStyle
      },
      React2.createElement("style", { "data-wsr-studio-host-styles": "wsr-dsh@1" }, hostStyles),
      sharedStyles === void 0 ? null : React2.createElement("style", { "data-wsr-bi-styles": "wsr-ui-core@0.1.0-rc.0" }, sharedStyles),
      React2.createElement(
        Surface,
        { as: "header", level: "section", "data-wsr-studio-region": "header" },
        React2.createElement(
          "div",
          { className: "studio-product-row" },
          React2.createElement(
            "div",
            { className: "studio-breadcrumbs" },
            React2.createElement(Typography, { as: "strong", variant: "label" }, "WSR Studio"),
            React2.createElement(Typography, { variant: "caption" }, "/"),
            React2.createElement(Typography, { variant: "caption" }, "Evaluation"),
            snapshot.route.page === "trace" ? React2.createElement(
              React2.Fragment,
              null,
              React2.createElement(Typography, { variant: "caption" }, "/"),
              React2.createElement(Typography, { variant: "caption" }, "Trace")
            ) : null
          ),
          React2.createElement(
            "nav",
            { className: "studio-controls", "aria-label": "Studio views" },
            React2.createElement(Button, { appearance: "ghost", className: "studio-view-link", type: "button", "aria-current": studioPage === "selection" ? "page" : void 0, onClick: () => {
              setSelectionRequested(true);
              setStudioPage("selection");
            } }, "Select"),
            React2.createElement(Button, { appearance: "ghost", className: "studio-view-link", type: "button", disabled: snapshot.result === void 0 && !["receipt", "facts", "trace"].includes(snapshot.route.page), "aria-current": studioPage === "dashboard" && snapshot.route.page === "results" ? "page" : void 0, onClick: () => {
              controller.backToResults();
              setSelectionRequested(false);
              setStudioPage("dashboard");
            } }, "Dashboard"),
            React2.createElement(Button, { appearance: "ghost", className: "studio-view-link", type: "button", disabled: snapshot.route.page !== "facts", "aria-current": snapshot.route.page === "facts" ? "page" : void 0 }, "Evidence"),
            React2.createElement(Button, { appearance: "ghost", className: "studio-view-link", type: "button", disabled: snapshot.route.page !== "trace", "aria-current": snapshot.route.page === "trace" ? "page" : void 0 }, "Recorded Trace")
          )
        ),
        React2.createElement(
          "div",
          { className: "studio-page-row" },
          React2.createElement(
            "div",
            { className: "studio-page-copy" },
            React2.createElement(Typography, { as: "span", className: "studio-eyebrow", variant: "eyebrow" }, pageIdentity.eyebrow),
            React2.createElement(Typography, { as: "h1", id: "wsr-studio-title", variant: "pageTitle" }, pageIdentity.title),
            React2.createElement(Typography, { as: "p", variant: snapshot.route.page === "trace" ? "code" : "caption" }, pageIdentity.detail)
          ),
          React2.createElement(
            ButtonGroup,
            { className: "studio-controls studio-page-actions", "aria-label": "Page actions" },
            studioPage === "selection" ? React2.createElement(
              React2.Fragment,
              null,
              React2.createElement(Button, { appearance: "ghost", type: "button", disabled: snapshot.recentSelection === void 0, onClick: () => controller.setSelection(snapshot.recentSelection) }, "Use recent selection"),
              React2.createElement(Button, { appearance: "outline", type: "button", disabled: snapshot.taskList.phase === "loading", onClick: () => controller.loadTasks() }, "Load tasks"),
              React2.createElement(Button, { appearance: "solid", tone: "primary", type: "button", disabled: snapshot.selection === void 0, onClick: evaluateSelection }, "Evaluate selection")
            ) : null,
            studioPage === "dashboard" && snapshot.route.page === "results" ? React2.createElement(
              React2.Fragment,
              null,
              snapshot.result === void 0 ? null : React2.createElement(Button, { type: "button", onClick: () => controller.openReceipt() }, "View receipt"),
              React2.createElement(Button, { type: "button", onClick: () => setDashboardState(reduceStudioDashboardState(expandedDashboardState, { type: "PRESET", preset: "default" })) }, "Default overview"),
              React2.createElement(Button, { type: "button", onClick: () => {
                setSelectionRequested(true);
                setStudioPage("selection");
              } }, "Change evaluation")
            ) : null,
            studioPage === "dashboard" && snapshot.route.page === "trace" ? React2.createElement(
              React2.Fragment,
              null,
              React2.createElement(Button, { appearance: "outline", type: "button", onClick: () => controller.backToResults() }, "Back to Dashboard"),
              presentation.metrics[0] === void 0 ? null : React2.createElement(Button, { appearance: "outline", type: "button", onClick: () => {
                controller.openFacts(presentation.metrics[0].coordinate);
                void controller.loadMetricFacts(presentation.metrics[0].coordinate);
              } }, "Open Evidence"),
              React2.createElement(Button, { appearance: "solid", tone: "primary", type: "button", onClick: () => navigator.clipboard?.writeText(snapshot.route.traceId) }, "Copy trace identity")
            ) : null,
            studioPage === "dashboard" && editingDashboard ? React2.createElement(
              React2.Fragment,
              null,
              React2.createElement(Button, { type: "button", onClick: () => setDashboardState(reduceStudioDashboardState(expandedDashboardState, { type: "RESET" })) }, "Reset layout"),
              React2.createElement(Button, { appearance: "solid", tone: "primary", type: "button", onClick: () => {
                layoutStore.save(expandedDashboardState);
                setSavedDashboardState(expandedDashboardState);
                setEditingDashboard(false);
              } }, "Save layout"),
              React2.createElement(Button, { appearance: "ghost", type: "button", onClick: () => {
                setDashboardState(savedDashboardState);
                setEditingDashboard(false);
              } }, "Cancel editing")
            ) : studioPage === "dashboard" && snapshot.route.page === "results" ? React2.createElement(Button, { appearance: "solid", tone: "primary", type: "button", onClick: () => {
              setSavedDashboardState(expandedDashboardState);
              setEditingDashboard(true);
            } }, "Edit dashboard") : null
          )
        ),
        studioPage === "dashboard" && editingDashboard && metricPanelIds.some((id2) => expandedDashboardState.hidden.includes(id2)) ? React2.createElement(
          "div",
          { className: "studio-controls", "aria-label": "Add dashboard panels" },
          ...metricPanelIds.filter((id2) => expandedDashboardState.hidden.includes(id2)).map((panelId) => React2.createElement(Button, { key: panelId, type: "button", onClick: () => updateDashboard({ type: "ADD", panelId }) }, `Add ${panelId}`))
        ) : null
      ),
      React2.createElement(
        "main",
        {
          tabIndex: -1,
          "data-wsr-studio-region": "main",
          "data-wsr-studio-page": studioPage
        },
        snapshot.phase === "loading" || snapshot.refreshing ? React2.createElement("p", { role: "status", "aria-live": "polite" }, snapshot.refreshing ? "Refreshing evaluation\u2026" : "Loading evaluation\u2026") : null,
        snapshot.error === void 0 ? null : React2.createElement(
          "section",
          { role: "alert", "aria-live": "assertive" },
          React2.createElement("h2", null, snapshot.result === void 0 ? "Evaluate unavailable" : "Showing the last result"),
          React2.createElement("p", null, snapshot.error.message),
          React2.createElement(Button, { type: "button", style: controlStyle, onClick: () => controller.refresh() }, "Retry")
        ),
        studioPage === "selection" ? React2.createElement(
          "section",
          {
            "aria-labelledby": "wsr-task-selection",
            className: "studio-selection-grid"
          },
          React2.createElement(
            Surface,
            { as: "section", level: "section", className: "studio-selection-card", "data-wsr-selection-browser": "task-population" },
            React2.createElement(
              "header",
              { className: "studio-selection-head" },
              React2.createElement(
                "div",
                null,
                React2.createElement(Typography, { as: "h2", id: "wsr-task-selection", variant: "sectionTitle" }, "Task population"),
                React2.createElement(Typography, { as: "p", className: "studio-selection-copy", variant: "caption" }, `${taskItems.length} Tasks \xB7 exact identities retained in the receipt`)
              ),
              React2.createElement(
                ButtonGroup,
                { segmented: true, className: "studio-mode", "aria-label": "Evaluation mode" },
                React2.createElement(Button, { appearance: "segment", selected: snapshot.selection?.mode !== "compare", type: "button", onClick: () => chooseMode("single") }, "Single"),
                React2.createElement(Button, { appearance: "segment", selected: snapshot.selection?.mode === "compare", type: "button", onClick: () => chooseMode("compare") }, "Compare")
              )
            ),
            React2.createElement(
              "div",
              { className: "studio-selection-filter" },
              React2.createElement(TextInput, { inputKind: "search", "aria-label": "Search Tasks", placeholder: "Search name or exact Task ID", value: taskQuery, onChange: (event) => setTaskQuery(event.target.value) }),
              React2.createElement(Button, { type: "button", "aria-expanded": filtersOpen, onClick: () => setFiltersOpen(!filtersOpen) }, "Filters"),
              filtersOpen ? React2.createElement(
                "div",
                { className: "studio-filter-options", role: "group", "aria-label": "Task filters" },
                ...[["all", "All"], ["selected", "Selected"], ["available", "Available"]].map(([value, label]) => React2.createElement(Button, { key: value, type: "button", "aria-pressed": taskFilter === value, onClick: () => setTaskFilter(value) }, label)),
                snapshot.taskList.page?.next_cursor ? React2.createElement(Button, { type: "button", onClick: () => controller.loadTasks(snapshot.taskList.page.next_cursor) }, "Load more tasks") : null
              ) : null
            ),
            snapshot.taskList.phase === "error" ? React2.createElement("p", { role: "alert" }, "Task list unavailable; the current selection remains usable.") : null,
            snapshot.selection?.mode === "compare" ? React2.createElement("div", { className: "studio-task-list" }, ...[["Before", "left", before], ["After", "right", after]].flatMap(([label, side2, selected]) => [
              React2.createElement(Typography, { as: "strong", key: `${side2}-label`, variant: "label" }, label),
              ...visibleTaskItems.map((task) => React2.createElement(
                "div",
                { className: "studio-task-row", "data-wsr-selection-side": side2, "data-wsr-task-id": task.task_id, key: `${side2}-${task.task_id}` },
                React2.createElement(
                  "label",
                  null,
                  React2.createElement("input", { type: "checkbox", checked: selected.includes(task.task_id), onChange: (event) => setComparedTask(side2, task.task_id, event.target.checked) }),
                  React2.createElement(
                    "span",
                    null,
                    React2.createElement(Typography, { as: "strong", variant: "label" }, task.display_name ?? task.task_id),
                    React2.createElement(Typography, { as: "small", className: "studio-task-id", variant: "code" }, task.task_id)
                  )
                ),
                React2.createElement(StatusBadge, { status: selected.includes(task.task_id) ? "selected" : "available" }, selected.includes(task.task_id) ? "Selected" : "Available")
              ))
            ])) : React2.createElement("div", { className: "studio-task-list", role: "list" }, ...visibleTaskItems.map((task) => React2.createElement(
              "div",
              { className: "studio-task-row", "data-wsr-task-id": task.task_id, key: task.task_id, role: "listitem" },
              React2.createElement(
                "label",
                null,
                React2.createElement("input", { type: "checkbox", checked: current.includes(task.task_id), onChange: (event) => setTask(task.task_id, event.target.checked) }),
                React2.createElement(
                  "span",
                  null,
                  React2.createElement(Typography, { as: "strong", variant: "label" }, task.display_name ?? task.task_id),
                  React2.createElement(Typography, { as: "small", className: "studio-task-id", variant: "code" }, task.task_id)
                )
              ),
              React2.createElement(StatusBadge, { status: current.includes(task.task_id) ? "selected" : "available" }, current.includes(task.task_id) ? "Selected" : "Available")
            ))),
            snapshot.taskList.phase === "ready" && taskItems.length === 0 ? React2.createElement("p", { role: "status" }, "No Tasks are available in Evidence.") : null
          ),
          React2.createElement(
            Surface,
            { as: "aside", level: "section", className: "studio-selection-card", "aria-label": "Current selection" },
            React2.createElement(
              "header",
              { className: "studio-selection-head" },
              React2.createElement(
                "div",
                null,
                React2.createElement(Typography, { as: "h2", variant: "sectionTitle" }, "Current selection"),
                React2.createElement(Typography, { as: "p", className: "studio-selection-copy", variant: "caption" }, snapshot.selection?.mode === "compare" ? `${before.length} Before \xB7 ${after.length} After` : `Single evaluation \xB7 ${current.length} ${current.length === 1 ? "Task" : "Tasks"}`)
              ),
              React2.createElement(Button, { appearance: "ghost", type: "button", disabled: snapshot.selection === void 0, onClick: () => controller.clearSelection() }, "Clear")
            ),
            React2.createElement(
              "div",
              { className: "studio-selected-list" },
              ...(snapshot.selection?.mode === "compare" ? [["Before", before], ["After", after]] : [["Selected", current]]).flatMap(([label, ids]) => [
                React2.createElement(Typography, { as: "strong", key: `${label}-heading`, variant: "label" }, label),
                ...ids.map((id2) => {
                  const task = taskItems.find((candidate) => candidate.task_id === id2);
                  return React2.createElement(
                    "div",
                    { className: "studio-selected-item", key: `${label}-${id2}` },
                    React2.createElement(Typography, { as: "strong", variant: "label" }, task?.display_name ?? id2),
                    React2.createElement(Typography, { as: "small", className: "studio-task-id", variant: "code" }, id2)
                  );
                })
              ]),
              React2.createElement(Typography, { as: "p", className: "studio-selection-copy", variant: "caption" }, "Evaluation resolves a current receipt. Layout and display names do not enter evaluation identity.")
            )
          )
        ) : null,
        studioPage !== "dashboard" || snapshot.route.page !== "results" ? null : snapshot.result === void 0 ? React2.createElement("p", null, "Choose one or more Tasks to evaluate.") : React2.createElement(
          "section",
          { "aria-label": snapshot.result.mode === "COMPARE" ? "Compared Metric Results" : "Metric Results" },
          snapshot.phase === "partial" ? React2.createElement("p", { role: "status" }, "Partial comparison: the available side remains visible.") : null,
          React2.createElement(
            Bi2.BiSurface,
            { theme },
            React2.createElement("div", {
              "data-wsr-dashboard-layout": DEFAULT_LAYOUT.schemaVersion
            }, ...dashboardMetrics.filter((metric) => snapshot.result.mode !== "COMPARE" || !deltaCoordinates.has(metric.coordinate)).map((metric) => {
              const panelId = metric.coordinate.slice(0, metric.coordinate.lastIndexOf("@"));
              const placement = studioPanelPlacement(panelId, expandedDashboardState.sizes[panelId]);
              return React2.createElement(
                "article",
                {
                  key: metric.coordinate,
                  "data-wsr-bi-metric": metric.coordinate,
                  "data-wsr-dashboard-panel": panelId,
                  style: {
                    "--studio-panel-desktop-columns": placement.desktop,
                    "--studio-panel-tablet-columns": placement.tablet,
                    "--studio-panel-mobile-columns": placement.mobile
                  }
                },
                editingDashboard ? React2.createElement(
                  "div",
                  { className: "studio-controls", "aria-label": `${panelId} layout controls` },
                  React2.createElement(Button, { type: "button", onClick: () => updateDashboard({ type: "RESIZE", panelId, size: placement.desktop >= 12 ? "compact" : placement.desktop >= 6 ? "full" : "wide" }) }, "Resize panel"),
                  React2.createElement(Button, { type: "button", onClick: () => {
                    const index = expandedDashboardState.order.indexOf(panelId);
                    if (index > 0) updateDashboard({ type: "MOVE", panelId, beforePanelId: expandedDashboardState.order[index - 1] });
                  } }, "Move earlier"),
                  React2.createElement(Button, { type: "button", onClick: () => updateDashboard({ type: "REMOVE", panelId }) }, "Remove panel")
                ) : null,
                snapshot.result.mode === "COMPARE" ? React2.createElement("h3", null, metric.coordinate) : null,
                ...metric.sides.map(({ side: side2, slices }) => {
                  const result = {
                    metric_id: metric.coordinate.slice(0, metric.coordinate.lastIndexOf("@")),
                    metric_version: metric.coordinate.slice(metric.coordinate.lastIndexOf("@") + 1),
                    slices
                  };
                  return React2.createElement(
                    "section",
                    { key: side2, "aria-label": `${side2} Metric Result` },
                    snapshot.result.mode === "COMPARE" ? React2.createElement("h4", null, `${side2} side`) : null,
                    React2.createElement(Bi2.DashboardMetricPanel, {
                      result,
                      size: placement.desktop >= 12 ? "WIDE" : placement.desktop >= 6 ? "MEDIUM" : "SMALL",
                      onEvidence: () => controller.openFacts(metric.coordinate)
                    })
                  );
                })
              );
            })),
            ...snapshot.result.mode === "COMPARE" ? presentation.deltas.map((delta) => {
              const before2 = metricSlice(snapshot.result.left, delta.metric_coordinate, delta.slice_key);
              const after2 = metricSlice(snapshot.result.right, delta.metric_coordinate, delta.slice_key);
              return React2.createElement(Bi2.CompareResultFrame, {
                key: `${delta.metric_coordinate}-${sliceIdentity(delta.slice_key)}`,
                coordinate: delta.metric_coordinate,
                before: before2,
                after: after2,
                beforeError: snapshot.result.left?.tag === "SIDE_ERROR" ? snapshot.result.left : void 0,
                afterError: snapshot.result.right?.tag === "SIDE_ERROR" ? snapshot.result.right : void 0,
                delta,
                onRetryFailedSide: () => controller.refresh(),
                onEvidence: (_side) => controller.openFacts(delta.metric_coordinate),
                visualizer: Bi2.selectDefaultVisualizer({
                  metric_id: delta.metric_coordinate.slice(0, delta.metric_coordinate.lastIndexOf("@")),
                  metric_version: delta.metric_coordinate.slice(delta.metric_coordinate.lastIndexOf("@") + 1),
                  slices: [before2 ?? after2].filter(Boolean)
                })
              });
            }) : []
          )
        ),
        studioPage === "dashboard" && snapshot.route.page === "receipt" ? React2.createElement(
          "section",
          { "aria-label": "Evaluation receipts" },
          React2.createElement("h2", null, "Receipts"),
          React2.createElement(Button, { type: "button", onClick: () => controller.backToResults() }, "Back to Metric Results"),
          React2.createElement(
            Bi2.BiSurface,
            { theme },
            ...presentation.receipts.map(({ side: side2, receipt }) => React2.createElement(Bi2.ReceiptView, {
              key: side2,
              receipt,
              side: side2
            }))
          ),
          React2.createElement(
            "details",
            { onToggle: (event) => setTechnicalDetailsOpen(event.currentTarget.open) },
            React2.createElement("summary", null, "Technical JSON details"),
            technicalDetailsOpen ? json(snapshot.result, "Evaluation receipt JSON") : null
          )
        ) : null,
        studioPage === "dashboard" && snapshot.route.page === "facts" ? React2.createElement(
          "section",
          { "aria-label": "Fact drill-down" },
          React2.createElement(Button, { type: "button", onClick: () => controller.backToResults() }, "Back to Metric Results"),
          React2.createElement(
            Bi2.BiSurface,
            { theme },
            React2.createElement(Bi2.EvidenceConsoleFoundation, {
              scope: snapshot.route.scope,
              state: presentation.drilldownError !== void 0 ? { tag: "ERROR", detail: presentation.drilldownError.message } : !factsCompatible ? { tag: "ERROR", detail: "Studio received an incompatible formal Fact shape" } : snapshot.drilldown.phase === "loading" ? { tag: "LOADING" } : facts.length === 0 ? { tag: "EMPTY" } : facts.every((row) => row.truth.expiry === "EXPIRED") ? { tag: "EXPIRED" } : { tag: "READY" },
              rows: facts.filter(Boolean),
              references: (snapshot.drilldown.references ?? []).map((reference) => ({
                kind: "PUBLISHED_PROVENANCE",
                identity: reference.identity,
                provenance: reference.identity,
                loadedAsFact: reference.loadedAsFact
              })),
              onScopeChange: (scope) => {
                controller.openFacts(snapshot.route.metric, scope);
                void controller.loadMetricFacts(snapshot.route.metric, scope);
              },
              onOpenTrace: (traceId, spanId) => {
                controller.openTrace(traceId, spanId);
                void controller.loadTrace({ trace_id: traceId, limit: 200 });
              }
            })
          )
        ) : null,
        studioPage === "dashboard" && snapshot.route.page === "trace" ? React2.createElement(
          "section",
          { "aria-label": "Recorded Trace drill-down" },
          presentation.drilldownError === void 0 ? null : React2.createElement("p", { role: "alert" }, presentation.drilldownError.message),
          recorded === void 0 ? React2.createElement(
            "p",
            { role: presentation.trace.length > 0 ? "alert" : "status" },
            presentation.trace.length > 0 ? "Studio received an incompatible formal Trace shape" : "No recorded Trace items"
          ) : React2.createElement(
            Bi2.BiSurface,
            { theme },
            recorded.status === "INVALID" ? React2.createElement("p", { role: "alert" }, recorded.errors.join("; ")) : null,
            React2.createElement(Bi2[STUDIO_TRACE_VIEWS.find(({ id: id2 }) => id2 === traceView)?.renderer ?? "TraceWaterfall"], {
              trace: recorded,
              viewNavigation: traceViewNavigation
            })
          )
        ) : null
      ),
      studioPage === "dashboard" && snapshot.route.page === "results" && snapshot.result !== void 0 ? React2.createElement(
        Surface,
        { as: "footer", border: "dashed", level: "raised", "data-wsr-studio-region": "footer" },
        React2.createElement(Typography, { as: "strong", variant: "label" }, presentation.trace.length > 0 ? "Recorded Trace is available" : "Recorded Trace availability follows current Evidence"),
        React2.createElement(Typography, { variant: "caption" }, " \xB7 exact recorded identities only; no inferred ordering")
      ) : null
    ));
  };
}
function createStudioClientPlugin({ React: React2, Primitives: Primitives2 = {}, Bi: Bi2, sharedStyles, initialContext, storage, themeMode } = {}) {
  if (React2 === void 0) throw new Error("STUDIO_REACT_REQUIRED");
  const component = (value) => {
    if (typeof value === "function" || typeof value === "string") return true;
    if (value === null || typeof value !== "object") return false;
    return value.$$typeof === Symbol.for("react.memo") || value.$$typeof === Symbol.for("react.forward_ref") || value.$$typeof === Symbol.for("react.lazy");
  };
  if (Bi2 === void 0 || !component(Bi2.BiSurface) || !component(Bi2.Button) || !component(Bi2.ButtonGroup) || !component(Bi2.DashboardMetricPanel) || !component(Bi2.StatusBadge) || !component(Bi2.Surface) || !component(Bi2.TextInput) || !component(Bi2.Typography) || !component(Bi2.MetricPanel) || !component(Bi2.CompareResultFrame) || !component(Bi2.ReceiptView) || !component(Bi2.ScopedError) || !component(Bi2.EvidenceConsoleFoundation) || !component(Bi2.TraceWaterfall) || !component(Bi2.TraceTree) || !component(Bi2.TraceStatistics) || typeof Bi2.compileTraceView !== "function" || typeof Bi2.selectDefaultVisualizer !== "function" || typeof Bi2.createBiTheme !== "function") {
    throw new Error("STUDIO_BI_REQUIRED");
  }
  return {
    name: "wsr-studio-client",
    inject: ["connection", "slots"],
    apply(ctx) {
      const resolvedStorage = storage ?? (typeof window === "undefined" ? void 0 : window.sessionStorage);
      const controller = createEvaluateController({
        catalogCoordinates: Bi2.CATALOG_COORDINATES,
        gateway: createStudioGatewayPort(ctx),
        initialContext,
        storage: resolvedStorage
      });
      let dispose = () => void 0;
      ctx.slots.inject("conversation.view", () => {
        dispose = ctx.slots.register({
          name: "conversation.view",
          id: "wsr-studio",
          order: 30,
          label: "WSR Studio"
        }, StudioView(React2, Primitives2, Bi2, sharedStyles, controller, themeMode, resolvedStorage));
      });
      return Object.assign(() => dispose?.(), { controller });
    }
  };
}

// packages/studio/src/client/browser-entry.js
var Bi = Object.freeze({
  BiSurface: C,
  Button: h,
  ButtonGroup: _,
  CATALOG_COORDINATES: ot,
  CompareResultFrame: Te,
  DashboardMetricPanel: xe,
  EvidenceConsoleFoundation: Ie,
  MetricPanel: Se,
  ReceiptView: je,
  ScopedError: B,
  StatusBadge: x,
  Surface: v,
  TextInput: b,
  TraceStatistics: ln,
  TraceTree: nn,
  TraceWaterfall: Kt,
  Typography: m,
  compileTraceView: gn,
  createBiTheme: D,
  selectDefaultVisualizer: ae
});
var plugin = createStudioClientPlugin({ React: import_react2.default, Primitives, Bi, sharedStyles: styles_default });
var name = plugin.name;
var inject = plugin.inject;
var apply = plugin.apply;

    return module.exports;
  },
});

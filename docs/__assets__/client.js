
// ../imba/src/imba/scheduler.imba
function iter$(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var sys$1 = Symbol.for("#init");
var sys$2 = Symbol.for("#schedule");
var sys$3 = Symbol.for("#frames");
var sys$4 = Symbol.for("#interval");
var sys$5 = Symbol.for("#stage");
var sys$6 = Symbol.for("#scheduled");
var sys$7 = Symbol.for("#fps");
var sys$8 = Symbol.for("#ticker");
var rAF = globalThis.requestAnimationFrame || function(blk) {
  return setTimeout1(blk, 1e3 / 60);
};
var FPS = 60;
var SPF = 1 / 60;
var parseCache = {};
function parseScheduleValue(input) {
  if (input === true || input === false || input === null) {
    return input;
  }
  ;
  let v = parseCache[input];
  if (v !== void 0) {
    return v;
  }
  ;
  let val = input;
  if (typeof val == "string") {
    if (val.match(/^\d+fps$/)) {
      val = 60 / parseInt(val);
    } else if (val.match(/^[\d\.]+s$/)) {
      val = parseFloat(val) / (1 / 60);
    } else if (val.match(/^[\d\.]+ms$/)) {
      val = parseFloat(val) / (1e3 / 60);
    }
    ;
  }
  ;
  return parseCache[input] = val;
}
var Scheduled = class {
  constructor($$ = null) {
    this[sys$1]($$);
  }
  [sys$1]($$ = null) {
    var $0$1;
    this.owner = $$ && ($0$1 = $$.owner) !== void 0 ? $0$1 : null;
    this.target = $$ && ($0$1 = $$.target) !== void 0 ? $0$1 : null;
    this.active = $$ && ($0$1 = $$.active) !== void 0 ? $0$1 : false;
    this.value = $$ && ($0$1 = $$.value) !== void 0 ? $0$1 : void 0;
    this.skip = $$ && ($0$1 = $$.skip) !== void 0 ? $0$1 : 0;
    this.last = $$ && ($0$1 = $$.last) !== void 0 ? $0$1 : 0;
  }
  tick(scheduler2) {
    this.last = this.owner[sys$3];
    return this.target.tick(this.owner);
  }
  update(o, isActivate) {
    let on = this.active;
    let val = parseScheduleValue(o.value);
    if (this.value != val) {
      this.deactivate();
      this.value = val;
    }
    ;
    console.log("update scheduled", this.value, val, o.value, typeof o.value);
    if (this.value || on || isActivate) {
      this.activate();
    }
    ;
    return this;
  }
  queue() {
    this.owner.add(this);
    return;
  }
  activate() {
    if (this.value === true) {
      this.owner.on("commit", this);
    } else if (this.value === false) {
      this.owner.on("commit", this);
    } else if (this.value <= 2 && this.value >= 0.1) {
      this.owner.on("raf", this);
    } else if (this.value > 2) {
      this[sys$4] = globalThis.setInterval(this.queue.bind(this), this.value * (1e3 / FPS));
    }
    ;
    this.active = true;
    return this;
  }
  deactivate() {
    if (this.value === true) {
      this.owner.un("commit", this);
    }
    ;
    this.owner.un("raf", this);
    globalThis.clearInterval(this[sys$4]);
    this.active = false;
    return this;
  }
};
var Scheduler = class {
  constructor() {
    var self = this;
    this.id = Symbol();
    this.queue = [];
    this.stage = -1;
    this[sys$5] = -1;
    this[sys$3] = 0;
    this[sys$6] = false;
    this.listeners = {};
    this.intervals = {};
    this.commit = function() {
      self.add("commit");
      return self;
    };
    this[sys$7] = 0;
    this.$promise = null;
    this.$resolve = null;
    this[sys$8] = function(e) {
      self[sys$6] = false;
      return self.tick(e);
    };
    this;
  }
  add(item, force) {
    if (force || this.queue.indexOf(item) == -1) {
      this.queue.push(item);
    }
    ;
    if (!this[sys$6]) {
      this[sys$2]();
    }
    ;
    return this;
  }
  listen(ns, item) {
    let set = this.listeners[ns];
    let first = !set;
    set || (set = this.listeners[ns] = new Set());
    set.add(item);
    if (ns == "raf" && first) {
      this.add("raf");
    }
    ;
    return this;
  }
  unlisten(ns, item) {
    var $0$2;
    let set = this.listeners[ns];
    set && set.delete(item);
    if (ns == "raf" && set && set.size == 0) {
      $0$2 = this.listeners.raf, delete this.listeners.raf, $0$2;
    }
    ;
    return this;
  }
  on(ns, item) {
    return this.listen(ns, item);
  }
  un(ns, item) {
    return this.unlisten(ns, item);
  }
  get promise() {
    var self = this;
    return this.$promise || (this.$promise = new Promise(function(resolve) {
      return self.$resolve = resolve;
    }));
  }
  tick(timestamp) {
    var self = this;
    let items = this.queue;
    let frame = this[sys$3]++;
    if (!this.ts) {
      this.ts = timestamp;
    }
    ;
    this.dt = timestamp - this.ts;
    this.ts = timestamp;
    this.queue = [];
    this[sys$5] = 1;
    if (items.length) {
      for (let i = 0, sys$9 = iter$(items), sys$10 = sys$9.length; i < sys$10; i++) {
        let item = sys$9[i];
        if (typeof item === "string" && this.listeners[item]) {
          this.listeners[item].forEach(function(item2) {
            if (item2.tick instanceof Function) {
              return item2.tick(self);
            } else if (item2 instanceof Function) {
              return item2(self);
            }
            ;
          });
        } else if (item instanceof Function) {
          item(this.dt, this);
        } else if (item.tick) {
          item.tick(this.dt, this);
        }
        ;
      }
      ;
    }
    ;
    this[sys$5] = this[sys$6] ? 0 : -1;
    if (this.$promise) {
      this.$resolve(this);
      this.$promise = this.$resolve = null;
    }
    ;
    if (this.listeners.raf && true) {
      this.add("raf");
    }
    ;
    return this;
  }
  [sys$2]() {
    if (!this[sys$6]) {
      this[sys$6] = true;
      if (this[sys$5] == -1) {
        this[sys$5] = 0;
      }
      ;
      rAF(this[sys$8]);
    }
    ;
    return this;
  }
  schedule(item, o) {
    var $0$3, $0$4;
    o || (o = item[$0$3 = this.id] || (item[$0$3] = {value: true}));
    let state = o[$0$4 = this.id] || (o[$0$4] = new Scheduled({owner: this, target: item}));
    return state.update(o, true);
  }
  unschedule(item, o = {}) {
    o || (o = item[this.id]);
    let state = o && o[this.id];
    if (state && state.active) {
      state.deactivate();
    }
    ;
    return this;
  }
};
var scheduler = new Scheduler();
var clearInterval = globalThis.clearInterval;
var clearTimeout = globalThis.clearTimeout;

// ../imba/src/imba/dom/flags.imba
var Flags = class {
  constructor(dom) {
    this.dom = dom;
    this.string = "";
  }
  contains(ref) {
    return this.dom.classList.contains(ref);
  }
  add(ref) {
    if (this.contains(ref)) {
      return this;
    }
    ;
    this.string += (this.string ? " " : "") + ref;
    this.dom.classList.add(ref);
    return this;
  }
  remove(ref) {
    if (!this.contains(ref)) {
      return this;
    }
    ;
    var regex = new RegExp("(^|\\s)*" + ref + "(\\s|$)*", "g");
    this.string = this.string.replace(regex, "");
    this.dom.classList.remove(ref);
    return this;
  }
  toggle(ref, bool) {
    if (bool === void 0) {
      bool = !this.contains(ref);
    }
    ;
    return bool ? this.add(ref) : this.remove(ref);
  }
  incr(ref) {
    let m = this.stacks || (this.stacks = {});
    let c = m[ref] || 0;
    if (c < 1) {
      this.add(ref);
    }
    ;
    m[ref] = Math.max(c, 0) + 1;
    return this;
  }
  decr(ref) {
    let m = this.stacks || (this.stacks = {});
    let c = m[ref] || 0;
    if (c == 1) {
      this.remove(ref);
    }
    ;
    m[ref] = Math.max(c, 1) - 1;
    return this;
  }
  valueOf() {
    return this.string;
  }
  toString() {
    return this.string;
  }
  sync() {
    return this.dom.flagSync$();
  }
};

// ../imba/src/imba/dom/core.web.imba
function extend$(target, ext) {
  var descriptors = Object.getOwnPropertyDescriptors(ext);
  Object.defineProperties(target.prototype, descriptors);
  return target;
}
function iter$2(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var sys$12 = Symbol.for("#parent");
var sys$22 = Symbol.for("#context");
var sys$32 = Symbol.for("#init");
var sys$42 = Symbol.for("##parent");
var sys$52 = Symbol.for("##up");
var sys$62 = Symbol.for("##context");
var sys$72 = Symbol.for("#src");
var sys$15 = Symbol.for("#htmlNodeName");
var sys$16 = Symbol.for("#ImbaElement");
var {
  Event,
  UIEvent,
  MouseEvent,
  PointerEvent,
  KeyboardEvent,
  CustomEvent,
  Node,
  Comment,
  Text,
  Element,
  HTMLElement,
  HTMLHtmlElement,
  HTMLSelectElement,
  HTMLInputElement,
  HTMLTextAreaElement,
  HTMLButtonElement,
  HTMLOptionElement,
  HTMLScriptElement,
  SVGElement,
  DocumentFragment,
  ShadowRoot,
  Document,
  Window,
  customElements
} = globalThis.window;
var CustomTagConstructors = {};
var CustomTagToElementNames = {};
var TYPES = {};
var CUSTOM_TYPES = {};
var contextHandler = {
  get(target, name) {
    let ctx = target;
    let val = void 0;
    while (ctx && val == void 0) {
      if (ctx = ctx[sys$12]) {
        val = ctx[name];
      }
      ;
    }
    ;
    return val;
  }
};
extend$(Node, {
  get [sys$12]() {
    return this[sys$42] || this.parentNode || this[sys$52];
  },
  get [sys$22]() {
    return this[sys$62] || (this[sys$62] = new Proxy(this, contextHandler));
  },
  [sys$32]() {
    return this;
  },
  replaceWith$(other) {
    if (!(other instanceof Node) && other.replace$) {
      other.replace$(this);
    } else {
      this.parentNode.replaceChild(other, this);
    }
    ;
    return other;
  },
  insertInto$(parent) {
    parent.appendChild$(this);
    return this;
  },
  insertBefore$(el, prev) {
    return this.insertBefore(el, prev);
  },
  insertBeforeBegin$(other) {
    return this.parentNode.insertBefore(other, this);
  },
  insertAfterEnd$(other) {
    if (this.nextSibling) {
      return this.nextSibling.insertBeforeBegin$(other);
    } else {
      return this.parentNode.appendChild(other);
    }
    ;
  },
  insertAfterBegin$(other) {
    if (this.childNodes[0]) {
      return this.childNodes[0].insertBeforeBegin$(other);
    } else {
      return this.appendChild(other);
    }
    ;
  }
});
extend$(Element, {
  log(...params) {
    console.log(...params);
    return this;
  },
  slot$(name, ctx) {
    return this;
  },
  text$(item) {
    this.textContent = item;
    return this;
  },
  insert$(item, f, prev) {
    let type = typeof item;
    if (type === "undefined" || item === null) {
      if (prev && prev instanceof Comment) {
        return prev;
      }
      ;
      let el = globalThis.document.createComment("");
      prev ? prev.replaceWith$(el) : el.insertInto$(this);
      return el;
    }
    ;
    if (item === prev) {
      return item;
    } else if (type !== "object") {
      let res;
      let txt = item;
      if (f & 128 && f & 256) {
        this.textContent = txt;
        return;
      }
      ;
      if (prev) {
        if (prev instanceof Text) {
          prev.textContent = txt;
          return prev;
        } else {
          res = globalThis.document.createTextNode(txt);
          prev.replaceWith$(res, this);
          return res;
        }
        ;
      } else {
        this.appendChild$(res = globalThis.document.createTextNode(txt));
        return res;
      }
      ;
    } else {
      prev ? prev.replaceWith$(item, this) : item.insertInto$(this);
      return item;
    }
    ;
    return;
  },
  open$() {
    return this;
  },
  close$() {
    return this;
  },
  end$() {
    if (this.render) {
      this.render();
    }
    ;
    return;
  },
  get flags() {
    if (!this.$flags) {
      this.$flags = new Flags(this);
      if (this.flag$ == Element.prototype.flag$) {
        this.flags$ext = this.className;
      }
      ;
      this.flagDeopt$();
    }
    ;
    return this.$flags;
  },
  flag$(str) {
    let ns = this.flags$ns;
    this.className = ns ? ns + (this.flags$ext = str) : this.flags$ext = str;
    return;
  },
  flagDeopt$() {
    var self = this;
    this.flag$ = this.flagExt$;
    this.flagSelf$ = function(str) {
      return self.flagSync$(self.flags$own = str);
    };
    return;
  },
  flagExt$(str) {
    return this.flagSync$(this.flags$ext = str);
  },
  flagSelf$(str) {
    this.flagDeopt$();
    return this.flagSelf$(str);
  },
  flagSync$() {
    return this.className = (this.flags$ns || "") + (this.flags$ext || "") + " " + (this.flags$own || "") + " " + (this.$flags || "");
  }
});
Element.prototype.appendChild$ = Element.prototype.appendChild;
Element.prototype.removeChild$ = Element.prototype.removeChild;
Element.prototype.insertBefore$ = Element.prototype.insertBefore;
Element.prototype.replaceChild$ = Element.prototype.replaceChild;
Element.prototype.set$ = Element.prototype.setAttribute;
Element.prototype.setns$ = Element.prototype.setAttributeNS;
var descriptorCache = {};
function getDescriptor(item, key, cache) {
  if (!item) {
    return cache[key] = null;
  }
  ;
  if (cache[key] !== void 0) {
    return cache[key];
  }
  ;
  let desc = Object.getOwnPropertyDescriptor(item, key);
  if (desc !== void 0 || item == SVGElement) {
    return cache[key] = desc || null;
  }
  ;
  return getDescriptor(Reflect.getPrototypeOf(item), key, cache);
}
extend$(SVGElement, {
  set$(key, value) {
    var $0$1;
    let cache = descriptorCache[$0$1 = this.nodeName] || (descriptorCache[$0$1] = {});
    let desc = getDescriptor(this, key, cache);
    if (!desc || !desc.set) {
      this.setAttribute(key, value);
    } else {
      this[key] = value;
    }
    ;
    return;
  },
  flag$(str) {
    let ns = this.flags$ns;
    this.className.baseVal = ns ? ns + (this.flags$ext = str) : this.flags$ext = str;
    return;
  },
  flagSelf$(str) {
    var self = this;
    this.flag$ = function(str2) {
      return self.flagSync$(self.flags$ext = str2);
    };
    this.flagSelf$ = function(str2) {
      return self.flagSync$(self.flags$own = str2);
    };
    return this.flagSelf$(str);
  },
  flagSync$() {
    return this.className.baseVal = (this.flags$ns || "") + (this.flags$ext || "") + " " + (this.flags$own || "") + " " + (this.$flags || "");
  }
});
extend$(SVGSVGElement, {
  set src(value) {
    if (this[sys$72] != value ? (this[sys$72] = value, true) : false) {
      if (value?.adoptNode) {
        value.adoptNode(this);
      } else if (value?.content) {
        for (let sys$10 = value.attributes, sys$82 = 0, sys$9 = Object.keys(sys$10), sys$11 = sys$9.length, k, v; sys$82 < sys$11; sys$82++) {
          k = sys$9[sys$82];
          v = sys$10[k];
          this.setAttribute(k, v);
        }
        ;
        this.innerHTML = value.content;
      }
      ;
    }
    ;
    return;
  }
});
function createComment(text) {
  return globalThis.document.createComment(text);
}
function createFragment() {
  return globalThis.document.createDocumentFragment();
}
var vendor = globalThis.navigator?.vendor || "";
var ua = globalThis.navigator?.userAgent || "";
var isSafari = vendor.indexOf("Apple") > -1 || ua.indexOf("CriOS") >= 0 || ua.indexOf("FxiOS") >= 0;
var supportsCustomizedBuiltInElements = !isSafari;
var CustomDescriptorCache = new Map();
var CustomHook = class extends HTMLElement {
  connectedCallback() {
    if (supportsCustomizedBuiltInElements) {
      return this.parentNode.removeChild(this);
    } else {
      return this.parentNode.connectedCallback();
    }
    ;
  }
  disconnectedCallback() {
    if (!supportsCustomizedBuiltInElements) {
      return this.parentNode.disconnectedCallback();
    }
    ;
  }
};
window.customElements.define("i-hook", CustomHook);
function getCustomDescriptors(el, klass) {
  let props = CustomDescriptorCache.get(klass);
  if (!props) {
    props = {};
    let proto = klass.prototype;
    let protos = [proto];
    while (proto = proto && Object.getPrototypeOf(proto)) {
      if (proto.constructor == el.constructor) {
        break;
      }
      ;
      protos.unshift(proto);
    }
    ;
    for (let sys$122 = 0, sys$132 = iter$2(protos), sys$142 = sys$132.length; sys$122 < sys$142; sys$122++) {
      let item = sys$132[sys$122];
      let desc = Object.getOwnPropertyDescriptors(item);
      Object.assign(props, desc);
    }
    ;
    CustomDescriptorCache.set(klass, props);
  }
  ;
  return props;
}
function createComponent(name, parent, flags, text, ctx) {
  let el;
  if (typeof name != "string") {
    if (name && name.nodeName) {
      name = name.nodeName;
    }
    ;
  }
  ;
  let cmpname = CustomTagToElementNames[name] || name;
  if (CustomTagConstructors[name]) {
    let cls = CustomTagConstructors[name];
    let typ = cls.prototype[sys$15];
    if (typ && supportsCustomizedBuiltInElements) {
      el = globalThis.document.createElement(typ, {is: name});
    } else if (cls.create$ && typ) {
      el = globalThis.document.createElement(typ);
      el.setAttribute("is", cmpname);
      let props = getCustomDescriptors(el, cls);
      Object.defineProperties(el, props);
      el.__slots = {};
      el.appendChild(globalThis.document.createElement("i-hook"));
    } else if (cls.create$) {
      el = cls.create$(el);
      el.__slots = {};
    } else {
      console.warn("could not create tag " + name);
    }
    ;
  } else {
    el = globalThis.document.createElement(CustomTagToElementNames[name] || name);
  }
  ;
  el[sys$42] = parent;
  el[sys$32]();
  if (text !== null) {
    el.slot$("__").text$(text);
  }
  ;
  if (flags || el.flags$ns) {
    el.flag$(flags || "");
  }
  ;
  return el;
}
function defineTag(name, klass, options = {}) {
  TYPES[name] = CUSTOM_TYPES[name] = klass;
  klass.nodeName = name;
  let componentName = name;
  let proto = klass.prototype;
  if (name.indexOf("-") == -1) {
    componentName = "" + name + "-tag";
    CustomTagToElementNames[name] = componentName;
  }
  ;
  let basens = proto._ns_;
  if (options.ns) {
    let ns = options.ns;
    let flags = ns + " " + ns + "_ ";
    if (basens) {
      flags += proto.flags$ns;
      ns += " " + basens;
    }
    ;
    proto._ns_ = ns;
    proto.flags$ns = flags;
  }
  ;
  if (proto[sys$15]) {
    options.extends = proto[sys$15];
  }
  ;
  if (options.extends) {
    proto[sys$15] = options.extends;
    CustomTagConstructors[name] = klass;
    if (supportsCustomizedBuiltInElements) {
      window.customElements.define(componentName, klass, {extends: options.extends});
    }
    ;
  } else {
    window.customElements.define(componentName, klass);
  }
  ;
  return klass;
}

// ../imba/src/imba/dom/fragment.imba
function extend$2(target, ext) {
  var descriptors = Object.getOwnPropertyDescriptors(ext);
  Object.defineProperties(target.prototype, descriptors);
  return target;
}
var sys$13 = Symbol.for("#parent");
var sys$23 = Symbol.for("##up");
var sys$33 = Symbol.for("##parent");
extend$2(DocumentFragment, {
  get [sys$13]() {
    return this[sys$23] || this[sys$33];
  },
  setup$(flags, options) {
    this.$start = createComment("start");
    this.$end = createComment("end");
    this.$end.replaceWith$ = function(other) {
      this.parentNode.insertBefore(other, this);
      return other;
    };
    this.appendChild(this.$start);
    return this.appendChild(this.$end);
  },
  text$(item) {
    if (!this.$text) {
      this.$text = this.insert$(item);
    } else {
      this.$text.textContent = item;
    }
    ;
    return;
  },
  insert$(item, options, toReplace) {
    if (this[sys$33]) {
      return this[sys$33].insert$(item, options, toReplace || this.$end);
    } else {
      return Element.prototype.insert$.call(this, item, options, toReplace || this.$end);
    }
    ;
  },
  insertInto$(parent, before) {
    if (!this[sys$33]) {
      this[sys$33] = parent;
      parent.appendChild$(this);
    }
    ;
    return this;
  },
  replaceWith$(other, parent) {
    this.$start.insertBeforeBegin$(other);
    var el = this.$start;
    while (el) {
      let next = el.nextSibling;
      this.appendChild(el);
      if (el == this.$end) {
        break;
      }
      ;
      el = next;
    }
    ;
    return other;
  },
  appendChild$(child) {
    this.$end ? this.$end.insertBeforeBegin$(child) : this.appendChild(child);
    return child;
  },
  removeChild$(child) {
    child.parentNode && child.parentNode.removeChild(child);
    return this;
  },
  isEmpty$() {
    let el = this.$start;
    let end = this.$end;
    while (el = el.nextSibling) {
      if (el == end) {
        break;
      }
      ;
      if (el instanceof Element || el instanceof Text) {
        return false;
      }
      ;
    }
    ;
    return true;
  }
});
function createLiveFragment(bitflags, options, par) {
  const el = createFragment();
  el.setup$(bitflags, options);
  if (par) {
    el[sys$23] = par;
  }
  ;
  return el;
}

// ../imba/src/imba/dom/component.imba
function iter$3(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var sys$14 = Symbol.for("#init");
var sys$43 = Symbol.for("#count");
var sys$63 = Symbol.for("#autorender");
var hydrator = new class {
  constructor($$ = null) {
    this[sys$14]($$);
  }
  [sys$14]($$ = null) {
    var $0$1;
    this.items = $$ && ($0$1 = $$.items) !== void 0 ? $0$1 : [];
    this.current = $$ && ($0$1 = $$.current) !== void 0 ? $0$1 : null;
    this.lastQueued = $$ && ($0$1 = $$.lastQueued) !== void 0 ? $0$1 : null;
    this.tests = $$ && ($0$1 = $$.tests) !== void 0 ? $0$1 : 0;
  }
  flush() {
    let item = null;
    if (false) {
    }
    ;
    while (item = this.items.shift()) {
      if (!item.parentNode || item.isHydrated) {
        continue;
      }
      ;
      let prev = this.current;
      this.current = item;
      item.__F |= 1024;
      item.connectedCallback();
      this.current = prev;
    }
    ;
    return;
  }
  queue(item) {
    var self = this;
    let len = this.items.length;
    let idx = 0;
    let prev = this.lastQueued;
    this.lastQueued = item;
    let BEFORE = Node.DOCUMENT_POSITION_PRECEDING;
    let AFTER = Node.DOCUMENT_POSITION_FOLLOWING;
    if (len) {
      let prevIndex = this.items.indexOf(prev);
      let index = prevIndex;
      let compare = function(a, b) {
        self.tests++;
        return a.compareDocumentPosition(b);
      };
      if (prevIndex == -1 || prev.nodeName != item.nodeName) {
        index = prevIndex = 0;
      }
      ;
      let curr = this.items[index];
      while (curr && compare(curr, item) & AFTER) {
        curr = this.items[++index];
      }
      ;
      if (index != prevIndex) {
        curr ? this.items.splice(index, 0, item) : this.items.push(item);
      } else {
        while (curr && compare(curr, item) & BEFORE) {
          curr = this.items[--index];
        }
        ;
        if (index != prevIndex) {
          curr ? this.items.splice(index + 1, 0, item) : this.items.unshift(item);
        }
        ;
      }
      ;
    } else {
      this.items.push(item);
      if (!this.current) {
        globalThis.queueMicrotask(this.flush.bind(this));
      }
      ;
    }
    ;
    return;
  }
  run(item) {
    var $0$3, $0$2;
    if (this.active) {
      return;
    }
    ;
    this.active = true;
    let all = globalThis.document.querySelectorAll(".__ssr");
    console.log("running hydrator", item, all.length, Array.from(all));
    for (let sys$24 = 0, sys$34 = iter$3(all), sys$53 = sys$34.length; sys$24 < sys$53; sys$24++) {
      let item2 = sys$34[sys$24];
      item2[sys$43] || (item2[sys$43] = 1);
      item2[sys$43]++;
      let name = item2.nodeName;
      let typ = ($0$2 = this.map)[name] || ($0$2[name] = globalThis.window.customElements.get(name.toLowerCase()) || HTMLElement);
      console.log("item type", name, typ, !!CUSTOM_TYPES[name.toLowerCase()]);
      if (!item2.connectedCallback || !item2.parentNode || item2.isHydrated) {
        continue;
      }
      ;
      console.log("hydrate", item2);
    }
    ;
    return this.active = false;
  }
}();
var ImbaElement = class extends HTMLElement {
  constructor() {
    super();
    if (this.flags$ns) {
      this.flag$ = this.flagExt$;
    }
    ;
    this.setup$();
    this.build();
  }
  setup$() {
    this.__slots = {};
    return this.__F = 0;
  }
  [sys$14]() {
    this.__F |= 1 | 2;
    return this;
  }
  flag$(str) {
    this.className = this.flags$ext = str;
    return;
  }
  slot$(name, ctx) {
    var $0$4;
    if (name == "__" && !this.render) {
      return this;
    }
    ;
    return ($0$4 = this.__slots)[name] || ($0$4[name] = createLiveFragment(0, null, this));
  }
  build() {
    return this;
  }
  awaken() {
    return this;
  }
  mount() {
    return this;
  }
  unmount() {
    return this;
  }
  rendered() {
    return this;
  }
  dehydrate() {
    return this;
  }
  hydrate() {
    this.autoschedule = true;
    return this;
  }
  tick() {
    return this.commit();
  }
  visit() {
    return this.commit();
  }
  commit() {
    if (!this.isRender) {
      return this;
    }
    ;
    this.__F |= 256;
    this.render && this.render();
    this.rendered();
    return this.__F = (this.__F | 512) & ~256;
  }
  get autoschedule() {
    return (this.__F & 64) != 0;
  }
  set autoschedule(value) {
    value ? this.__F |= 64 : this.__F &= ~64;
  }
  set autorender(value) {
    let o = this[sys$63] || (this[sys$63] = {});
    o.value = value;
    if (this.isMounted) {
      scheduler.schedule(this, o);
    }
    ;
    return;
  }
  get isRender() {
    return true;
  }
  get isMounting() {
    return (this.__F & 16) != 0;
  }
  get isMounted() {
    return (this.__F & 32) != 0;
  }
  get isAwakened() {
    return (this.__F & 8) != 0;
  }
  get isRendered() {
    return (this.__F & 512) != 0;
  }
  get isRendering() {
    return (this.__F & 256) != 0;
  }
  get isScheduled() {
    return (this.__F & 128) != 0;
  }
  get isHydrated() {
    return (this.__F & 2) != 0;
  }
  get isSsr() {
    return (this.__F & 1024) != 0;
  }
  schedule() {
    scheduler.on("commit", this);
    this.__F |= 128;
    return this;
  }
  unschedule() {
    scheduler.un("commit", this);
    this.__F &= ~128;
    return this;
  }
  end$() {
    return this.visit();
  }
  open$() {
    if (this.__F & 1024) {
      this.__F = this.__F & ~1024;
      this.classList.remove("_ssr_");
      if (this.flags$ext && this.flags$ext.indexOf("_ssr_") == 0) {
        this.flags$ext = this.flags$ext.slice(5);
      }
      ;
      this.innerHTML = "";
    }
    ;
    return this;
  }
  connectedCallback() {
    let flags = this.__F;
    let inited = flags & 1;
    let awakened = flags & 8;
    if (!inited && !(flags & 1024)) {
      hydrator.queue(this);
      return;
    }
    ;
    if (flags & (16 | 32)) {
      return;
    }
    ;
    this.__F |= 16;
    if (!inited) {
      this[sys$14]();
    }
    ;
    if (!(flags & 2)) {
      this.flags$ext = this.className;
      this.__F |= 2;
      this.hydrate();
      this.commit();
    }
    ;
    if (!awakened) {
      this.awaken();
      this.__F |= 8;
    }
    ;
    let res = this.mount();
    if (res && res.then instanceof Function) {
      res.then(scheduler.commit);
    }
    ;
    flags = this.__F = (this.__F | 32) & ~16;
    if (flags & 64) {
      this.schedule();
    }
    ;
    if (this[sys$63]) {
      scheduler.schedule(this, this[sys$63]);
    }
    ;
    return this;
  }
  disconnectedCallback() {
    this.__F = this.__F & (~32 & ~16);
    if (this.__F & 128) {
      this.unschedule();
    }
    ;
    this.unmount();
    if (this[sys$63]) {
      return scheduler.unschedule(this, this[sys$63]);
    }
    ;
  }
};

// ../imba/src/imba/dom/context.imba
var renderContext = {
  context: null
};

// ../imba/src/imba/dom/mount.imba
function mount(mountable, into) {
  let parent = into || globalThis.document.body;
  let element = mountable;
  if (mountable instanceof Function) {
    let ctx = {_: parent};
    let tick = function() {
      renderContext.context = ctx;
      return mountable(ctx);
    };
    element = tick();
    scheduler.listen("commit", tick);
  } else {
    element.__F |= 64;
  }
  ;
  return parent.appendChild(element);
}

// client.imba
var sys$17 = Symbol();
var AppT$1;
var AppB$1;
var AppD$1;
var App = class extends ImbaElement {
  render() {
    var cmpT$1, cmpB$1, cmpD$1;
    cmpT$1 = this;
    cmpT$1.open$();
    (cmpB$1 = cmpD$1 = 1, cmpT$1[sys$17] === 1) || (cmpB$1 = cmpD$1 = 0, cmpT$1[sys$17] = 1);
    (!cmpB$1 || cmpD$1 & 2) && cmpT$1.flagSelf$("lv-c");
    cmpB$1 || cmpT$1.text$("Hello world");
    cmpT$1.close$(cmpD$1);
    return cmpT$1;
  }
};
defineTag("app-gen-lv", App, {ns: "lv_b"});
mount((AppT$1 = createComponent(App, null, "lv-d", null), AppB$1 || !AppT$1.setup || AppT$1.setup(AppD$1), AppT$1.end$(AppD$1), AppT$1));
//# sourceMappingURL=client.js.map

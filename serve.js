//__HEAD__
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __exportStar = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};

// ../imba/src/imba/manifest.imba
var import_events = __toModule(require("events"));
var import_fs = __toModule(require("fs"));
var import_path = __toModule(require("path"));
var sys$1 = Symbol.for("#refresh");
var sys$2 = Symbol.for("#manifest");
var sys$3 = Symbol.for("#absPath");
var sys$4 = Symbol.for("#raw");
var sys$5 = Symbol.for("#watch");
var LazyProxy = class {
  static for(getter) {
    return new Proxy({}, new this(getter));
  }
  constructor(getter) {
    this.getter = getter;
  }
  get target() {
    return this.getter();
  }
  get(_, key) {
    return this.target[key];
  }
  set(_, key, value) {
    this.target[key] = value;
    return true;
  }
};
var manifest = LazyProxy.for(function() {
  return globalThis[sys$2];
});

// ../imba/src/imba/process.imba
var import_cluster = __toModule(require("cluster"));
var import_fs2 = __toModule(require("fs"));
var import_path2 = __toModule(require("path"));
var import_events2 = __toModule(require("events"));

// ../imba/src/utils/logger.imba
var import_perf_hooks = __toModule(require("perf_hooks"));
var sys$12 = Symbol.for("#spinner");
var sys$22 = Symbol.for("#ctime");
var sys$32 = Symbol.for("#IMBA_OPTIONS");
var ansiMap = {
  reset: [0, 0],
  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],
  redBright: [91, 39],
  greenBright: [92, 39],
  yellowBright: [93, 39],
  blueBright: [94, 39],
  magentaBright: [95, 39],
  cyanBright: [96, 39],
  whiteBright: [97, 39]
};
var ansi = {
  bold: function(text) {
    return "[1m" + text + "[22m";
  },
  red: function(text) {
    return "[31m" + text + "[39m";
  },
  green: function(text) {
    return "[32m" + text + "[39m";
  },
  yellow: function(text) {
    return "[33m" + text + "[39m";
  },
  blue: function(text) {
    return "[94m" + text + "[39m";
  },
  gray: function(text) {
    return "[90m" + text + "[39m";
  },
  white: function(text) {
    return "[37m" + text + "[39m";
  },
  f: function(name, text) {
    let pair = ansiMap[name];
    return "[" + pair[0] + "m" + text + "[" + pair[1] + "m";
  }
};
ansi.warn = ansi.yellow;
ansi.error = ansi.red;
var notWin = process.platform !== "win32" || process.env.CI || process.env.TERM === "xterm-256color";
var logSymbols = {
  info: ansi.f("yellowBright", notWin ? "\u2139" : "i"),
  success: ansi.green(notWin ? "\u2714" : "\u221A"),
  warning: ansi.yellow(notWin ? "\u26A0" : "!!"),
  error: ansi.red(notWin ? "\xD7" : "\u2716"),
  debug: ansi.blue(notWin ? "\u2139" : "i")
};
var logLevels = ["debug", "info", "success", "warning", "error", "silent"];
var addressTypeName = {
  "-1": "socket",
  "4": "ip4",
  "6": "ip6"
};
function formatMarkdown(str) {
  let fmt = ansi.f;
  str = str.replace(/https?\:[^\s\n\)\]]+/g, function(m) {
    return fmt("blueBright", m);
  });
  str = str.replace(/^[\t\s]*\>[^\n]+/gm, function(m) {
    return fmt("bold", m);
  });
  str = str.replace(/\t/g, "  ");
  str = str.replace(/^/gm, "  ");
  return str;
}
function format(str, ...rest) {
  let fmt = ansi.f;
  str = str.replace(/\%([\w\.]+)/g, function(m, f) {
    let part = rest.shift();
    if (f == "markdown") {
      return formatMarkdown(part);
    } else if (f == "kb") {
      return fmt("dim", (part / 1e3).toFixed(1) + "kb");
    } else if (f == "path" || f == "bold") {
      return fmt("bold", part);
    } else if (f == "dim") {
      return fmt("dim", part);
    } else if (f == "address") {
      let typ = addressTypeName[part.addressType];
      if (part.port) {
        return fmt("blueBright", [part.address || "http://127.0.0.1", part.port].join(":"));
      } else {
        return fmt("blueBright", typ);
      }
      ;
    } else if (f == "ms") {
      return fmt("yellow", Math.round(part) + "ms");
    } else if (f == "d") {
      return fmt("blueBright", part);
    } else if (f == "red") {
      return fmt("redBright", part);
    } else if (f == "green") {
      return fmt("greenBright", part);
    } else if (f == "yellow") {
      return fmt("yellowBright", part);
    } else if (f == "ref") {
      return fmt("yellowBright", "#" + (part.id || part));
    } else if (f == "elapsed") {
      if (part != void 0) {
        rest.unshift(part);
      }
      ;
      let elapsed = import_perf_hooks.performance.now();
      return fmt("yellow", Math.round(elapsed) + "ms");
    } else if (f == "heap") {
      if (part != void 0) {
        rest.unshift(part);
      }
      ;
      let used = process.memoryUsage().heapUsed / 1024 / 1024;
      return fmt("yellow", used.toFixed(2) + "mb");
    } else {
      return part;
    }
    ;
  });
  return [str, ...rest];
}
var Spinner = null;
var Instance = null;
var Logger = class {
  static get main() {
    return Instance || (Instance = new this());
  }
  constructor({prefix = null, loglevel} = {}) {
    this[sys$22] = Date.now();
    this.prefix = prefix ? format(...prefix)[0] : "";
    this.loglevel = loglevel || process.env.IMBA_LOGLEVEL || globalThis[sys$32] && globalThis[sys$32].loglevel || "info";
  }
  write(kind, ...parts) {
    if (logLevels.indexOf(kind) < logLevels.indexOf(this.loglevel)) {
      return this;
    }
    ;
    let sym = logSymbols[kind] || kind;
    let [str, ...rest] = format(...parts);
    if (this.prefix) {
      str = this.prefix + str;
    }
    ;
    if (this[sys$12] && this[sys$12].isSpinning) {
      if (kind == "success") {
        this[sys$12].clear();
        console.log(sym + " " + str, ...rest);
        this[sys$12].frame();
      }
      ;
      return this[sys$12].text = str;
    } else {
      return console.log(sym + " " + str, ...rest);
    }
    ;
  }
  debug(...pars) {
    return this.write("debug", ...pars);
  }
  log(...pars) {
    return this.write("info", ...pars);
  }
  info(...pars) {
    return this.write("info", ...pars);
  }
  warn(...pars) {
    return this.write("warn", ...pars);
  }
  error(...pars) {
    return this.write("error", ...pars);
  }
  success(...pars) {
    return this.write("success", ...pars);
  }
  ts(...pars) {
    return this.write("debug", ...pars, import_perf_hooks.performance.now());
  }
  spinner() {
    return;
    return Spinner = this.ora("Loading").start();
  }
  get [sys$12]() {
    return Spinner;
  }
  get proxy() {
    var self = this;
    let fn = function(...pars) {
      return self.info(...pars);
    };
    fn.info = this.info.bind(this);
    fn.warn = this.warn.bind(this);
    fn.error = this.error.bind(this);
    fn.debug = this.debug.bind(this);
    fn.success = this.success.bind(this);
    fn.ts = this.ts.bind(this);
    fn.logger = this;
    return fn;
  }
  async time(label, cb) {
    let t = Date.now();
    if (cb) {
      let res = await cb();
      this.info("" + label + " %ms", Date.now() - t);
      return res;
    }
    ;
  }
};
var logger_default = new Logger().proxy;

// ../imba/src/imba/process.imba
var import_module = __toModule(require("module"));
var import_http = __toModule(require("http"));
var import_https = __toModule(require("https"));
var import_http2 = __toModule(require("http2"));
function iter$(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : [];
}
var sys$13 = Symbol.for("#setup");
var sys$7 = Symbol.for("#setup?");
var sys$10 = Symbol.for("#watch");
var sys$15 = Symbol.for("#dom");
var sys$16 = Symbol.for("#server");
var sys$17 = Symbol.for("#raw");
var defaultHeaders = {
  html: {"Content-Type": "text/html"},
  js: {"Content-Type": "text/javascript"},
  mjs: {"Content-Type": "text/javascript"},
  json: {"Content-Type": "application/json"},
  css: {"Content-Type": "text/css"},
  otf: {"Content-Type": "font/otf"},
  ttf: {"Content-Type": "font/ttf"},
  woff: {"Content-Type": "font/woff"},
  woff2: {"Content-Type": "font/woff2"},
  svg: {"Content-Type": "image/svg+xml"},
  avif: {"Content-Type": "image/avif"},
  gif: {"Content-Type": "image/gif"},
  png: {"Content-Type": "image/png"},
  apng: {"Content-Type": "image/apng"},
  webp: {"Content-Type": "image/webp"},
  jpg: {"Content-Type": "image/jpeg"},
  jpeg: {"Content-Type": "image/jpeg"}
};
var proc = globalThis.process;
var Servers = class extends Set {
  call(name, ...params) {
    var sys$23;
    sys$23 = [];
    for (let server2 of iter$(this)) {
      sys$23.push(server2[name](...params));
    }
    ;
    return sys$23;
  }
  close(o = {}) {
    var sys$33;
    sys$33 = [];
    for (let server2 of iter$(this)) {
      sys$33.push(server2.close(o));
    }
    ;
    return sys$33;
  }
  reload(o = {}) {
    var sys$42;
    sys$42 = [];
    for (let server2 of iter$(this)) {
      sys$42.push(server2.reload(o));
    }
    ;
    return sys$42;
  }
  broadcast(msg, ...rest) {
    var sys$52;
    sys$52 = [];
    for (let server2 of iter$(this)) {
      sys$52.push(server2.broadcast(msg, ...rest));
    }
    ;
    return sys$52;
  }
  emit(event, data) {
    var sys$62;
    sys$62 = [];
    for (let server2 of iter$(this)) {
      sys$62.push(server2.emit(event, data));
    }
    ;
    return sys$62;
  }
};
var servers = new Servers();
var process2 = new class Process extends import_events2.EventEmitter {
  constructor() {
    var self;
    super(...arguments);
    self = this;
    this.autoreload = false;
    this.state = {};
    if (import_cluster.default.isWorker) {
      proc.on("message", function(msg) {
        self.emit("message", msg);
        if (msg[0] == "emit") {
          return self.emit(...msg.slice(1));
        }
        ;
      });
    }
    ;
    this;
  }
  [sys$13]() {
    var self = this;
    if (!(this[sys$7] != true ? (this[sys$7] = true, true) : false)) {
      return;
    }
    ;
    this.on("reloading", function(e) {
      var sys$8;
      console.log("is reloading - from outside");
      self.state.reloading = true;
      sys$8 = [];
      for (let server2 of iter$(servers)) {
        sys$8.push(server2.pause());
      }
      ;
      return sys$8;
    });
    this.on("reloaded", async function(e) {
      var sys$9;
      self.state.reloaded = true;
      console.log("is reloaded - from outside");
      sys$9 = [];
      for (let server2 of iter$(servers)) {
        sys$9.push(server2.close());
      }
      ;
      let promises = sys$9;
      await Promise.all(promises);
      return proc.exit(0);
    });
    this.on("manifest:change", function(e) {
      if (proc.env.IMBA_HMR) {
        return manifest.update(e);
      }
      ;
    });
    this.on("manifest:error", function(e) {
      if (proc.env.IMBA_HMR) {
        manifest.errors = e;
        return servers.broadcast("errors", manifest.errors);
      }
      ;
    });
    return true;
  }
  send(msg) {
    if (proc.send instanceof Function) {
      return proc.send(msg);
    }
    ;
  }
  on(name, cb) {
    if (name == "change") {
      this.watch();
    }
    ;
    return super.on(...arguments);
  }
  watch() {
    var self = this;
    if (this[sys$10] != true ? (this[sys$10] = true, true) : false) {
      return manifest.on("change:main", function() {
        return self.emit("change", manifest);
      });
    }
    ;
  }
  reload() {
    if (!(this.isReloading != true ? (this.isReloading = true, true) : false)) {
      return this;
    }
    ;
    this.state.reloading = true;
    if (!proc.env.IMBA_SERVE) {
      console.warn("not possible to gracefully reload servers not started via imba start");
      return;
    }
    ;
    this.send("reload");
    return;
    for (let server2 of iter$(servers)) {
      server2.pause();
    }
    ;
    this.on("reloaded", async function(e) {
      var sys$11;
      sys$11 = [];
      for (let server2 of iter$(servers)) {
        sys$11.push(server2.close());
      }
      ;
      let promises = sys$11;
      await Promise.all(promises);
      return proc.exit(0);
    });
    return this.send("reload");
  }
}();
var AssetResponder = class {
  constructor(url, params = {}) {
    this.url = url;
    [this.path, this.query] = url.split("?");
    this.ext = import_path2.default.extname(this.path);
    this.headers = {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
      "cache-control": "public"
    };
    Object.assign(this.headers, defaultHeaders[this.ext.slice(1)] || {});
  }
  respond(req, res) {
    let asset2 = manifest.urls[this.url];
    let headers = this.headers;
    let path = asset2 ? manifest.resolve(asset2) : manifest.resolveAssetPath("public" + this.path);
    if (!path) {
      console.log("found no path for", asset2, this.url);
      res.writeHead(404, {});
      return res.end();
    }
    ;
    if (asset2) {
      if (asset2.ttl > 0) {
        headers["cache-control"] = "max-age=" + asset2.ttl;
      }
      ;
      if (asset2.imports) {
        let link = [];
        for (let sys$122 = 0, sys$132 = iter$(asset2.imports), sys$142 = sys$132.length; sys$122 < sys$142; sys$122++) {
          let item = sys$132[sys$122];
          link.push("<" + item.url + ">; rel=modulepreload; as=script");
        }
        ;
        headers.Link = link.join(", ");
      }
      ;
    }
    ;
    return import_fs2.default.access(path, import_fs2.default.constants.R_OK, function(err) {
      if (err) {
        console.log("could not find path", path);
        res.writeHead(404, {});
        return res.end();
      }
      ;
      try {
        let stream = import_fs2.default.createReadStream(path);
        res.writeHead(200, headers);
        return stream.pipe(res);
      } catch (e) {
        res.writeHead(503, {});
        return res.end();
      }
      ;
    });
  }
  createReadStream() {
    return import_fs2.default.createReadStream(this.path);
  }
  pipe(response) {
    return this.createReadStream().pipe(response);
  }
};
var Server = class {
  static wrap(server2) {
    return new this(server2);
  }
  constructor(srv) {
    var self = this;
    servers.add(this);
    this.id = Math.random();
    this.closed = false;
    this.paused = false;
    this.server = srv;
    this.clients = new Set();
    this.stalledResponses = [];
    this.assetResponders = {};
    if (proc.env.IMBA_PATH) {
      this.devtoolsPath = import_path2.default.resolve(proc.env.IMBA_PATH, "devtools.imba.web.js");
    }
    ;
    this.scheme = srv instanceof import_http.default.Server ? "http" : "https";
    let originalHandler = this.server._events.request;
    let dom = globalThis[sys$15];
    srv.off("request", originalHandler);
    originalHandler[sys$16] = this;
    srv.on("listening", function() {
      let adr = self.server.address();
      let host = adr.address;
      if (host == "::" || host == "0.0.0.0") {
        host = "localhost";
      }
      ;
      let url = "" + self.scheme + "://" + host + ":" + adr.port + "/";
      return logger_default.info("listening on %bold", url);
    });
    manifest.on("change", function(changes, m) {
      return self.broadcast("manifest", m.data[sys$17]);
    });
    this.handler = function(req, res) {
      var $0$1;
      let ishttp2 = req instanceof import_http2.Http2ServerRequest;
      let url = req.url;
      let assetPrefix = "/__assets__/";
      if (self.paused || self.closed) {
        res.statusCode = 302;
        res.setHeader("Location", req.url);
        if (!ishttp2) {
          res.setHeader("Connection", "close");
        }
        ;
        if (self.closed) {
          if (ishttp2) {
            req.stream.session.close();
          }
          ;
          return res.end();
        } else {
          return self.stalledResponses.push(res);
        }
        ;
      }
      ;
      if (url == "/__hmr__.js" && self.devtoolsPath) {
        let stream = import_fs2.default.createReadStream(self.devtoolsPath);
        res.writeHead(200, defaultHeaders.js);
        return stream.pipe(res);
      }
      ;
      if (url == "/__hmr__") {
        let headers2 = {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache"
        };
        if (!ishttp2) {
          headers2.Connection = "keep-alive";
        }
        ;
        res.writeHead(200, headers2);
        self.clients.add(res);
        self.broadcast("init", manifest.serializeForBrowser(), [res]);
        req.on("close", function() {
          return self.clients.delete(res);
        });
        return true;
      }
      ;
      if (url.indexOf(assetPrefix) == 0 || manifest.urls[url]) {
        let responder = ($0$1 = self.assetResponders)[url] || ($0$1[url] = new AssetResponder(url, self));
        return responder.respond(req, res);
      }
      ;
      let headers = req.headers;
      let base;
      if (ishttp2) {
        base = headers[":scheme"] + "://" + headers[":authority"];
      } else {
        let scheme = req.connection.encrypted ? "https" : "http";
        base = scheme + "://" + headers.host;
      }
      ;
      if (dom) {
        let loc = new dom.Location(req.url, base);
        return dom.Document.create({location: loc}, function() {
          return originalHandler(req, res);
        });
      } else {
        return originalHandler(req, res);
      }
      ;
    };
    srv.on("request", this.handler);
    srv.on("close", function() {
      return console.log("server is closing!!!");
    });
    if (import_cluster.default.isWorker) {
      process2[sys$13]();
      process2.send("serve");
    }
    ;
  }
  broadcast(event, data = {}, clients = this.clients) {
    data = JSON.stringify(data);
    let msg = "data: " + data + "\n\n\n";
    for (let client of iter$(clients)) {
      client.write("event: " + event + "\n");
      client.write("id: imba\n");
      client.write(msg);
    }
    ;
    return this;
  }
  pause() {
    if (this.paused != true ? (this.paused = true, true) : false) {
      this.broadcast("paused");
    }
    ;
    return this;
  }
  resume() {
    if (this.paused != false ? (this.paused = false, true) : false) {
      this.broadcast("resumed");
      return this.flushStalledResponses();
    }
    ;
  }
  flushStalledResponses() {
    for (let sys$18 = 0, sys$19 = iter$(this.stalledResponses), sys$20 = sys$19.length; sys$18 < sys$20; sys$18++) {
      let res = sys$19[sys$18];
      res.end();
    }
    ;
    return this.stalledResponses = [];
  }
  close() {
    var self = this;
    this.pause();
    return new Promise(function(resolve) {
      self.closed = true;
      self.server.close(resolve);
      return self.flushStalledResponses();
    });
  }
};
function serve(srv, ...params) {
  return Server.wrap(srv, ...params);
}

// ../imba/src/imba/asset.imba
var sys$14 = Symbol.for("#init");
var sys$6 = Symbol.for("#asset");
var AssetProxy = class {
  static wrap(meta) {
    let handler = new AssetProxy(meta);
    return new Proxy(handler, handler);
  }
  constructor(meta) {
    this.meta = meta;
  }
  get input() {
    return manifest.inputs[this.meta.input];
  }
  get asset() {
    return globalThis._MF_ ? this.meta : this.input.asset;
  }
  set(target, key, value) {
    return true;
  }
  get(target, key) {
    if (this.meta.meta && this.meta.meta[key] != void 0) {
      return this.meta.meta[key];
    }
    ;
    if (key == "absPath" && !this.asset.absPath) {
      return this.asset.url;
    }
    ;
    return this.asset[key];
  }
};
var SVGAsset = class {
  constructor($$ = null) {
    this[sys$14]($$);
  }
  [sys$14]($$ = null) {
    this.url = $$ ? $$.url : void 0;
    this.meta = $$ ? $$.meta : void 0;
  }
  adoptNode(node) {
    var _a;
    if ((_a = this.meta) == null ? void 0 : _a.content) {
      for (let sys$42 = this.meta.attributes, sys$23 = 0, sys$33 = Object.keys(sys$42), sys$52 = sys$33.length, k, v; sys$23 < sys$52; sys$23++) {
        k = sys$33[sys$23];
        v = sys$42[k];
        node.setAttribute(k, v);
      }
      ;
      node.innerHTML = this.meta.content;
    }
    ;
    return this;
  }
  toString() {
    return this.url;
  }
  toStyleString() {
    return "url(" + this.url + ")";
  }
};
function asset(data) {
  var $0$1, $0$2;
  if (data[sys$6]) {
    return data[sys$6];
  }
  ;
  if (data.type == "svg") {
    return data[sys$6] || (data[sys$6] = new SVGAsset(data));
  }
  ;
  if (data.input) {
    let extra = globalThis._MF_ && globalThis._MF_[data.input];
    if (extra) {
      Object.assign(data, extra);
      data.toString = function() {
        return this.absPath;
      };
    }
    ;
    return data[sys$6] || (data[sys$6] = AssetProxy.wrap(data));
  }
  ;
  return data;
}

// serve.imba
var import_http3 = __toModule(require("http"));

// entry:app/index.html
var app_default = asset({input: "entry:app/index.html"});

// serve.imba
var server = import_http3.default.createServer(function(req, res) {
  let body = app_default.body;
  if (process.env.IMBA_HMR || globalThis.IMBA_HMR) {
    body = "<script src='/__hmr__.js'></script>" + body;
  }
  ;
  return res.end(body);
});
serve(server.listen(process.env.PORT || 3e3));
//__FOOT__
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vaW1iYS9zcmMvaW1iYS9tYW5pZmVzdC5pbWJhIiwgIi4uL2ltYmEvc3JjL2ltYmEvcHJvY2Vzcy5pbWJhIiwgIi4uL2ltYmEvc3JjL3V0aWxzL2xvZ2dlci5pbWJhIiwgIi4uL2ltYmEvc3JjL2ltYmEvYXNzZXQuaW1iYSIsICJzZXJ2ZS1odG1sLmltYmEiLCAiZW50cnk6YXBwL2luZGV4Lmh0bWwiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnXG5pbXBvcnQgbmZzIGZyb20gJ2ZzJ1xuaW1wb3J0IG5wIGZyb20gJ3BhdGgnXG5pbXBvcnQge2Rlc2VyaWFsaXplRGF0YSxwYXRjaE1hbmlmZXN0LHNlcmlhbGl6ZURhdGF9IGZyb20gJy4vdXRpbHMnXG5cbmNsYXNzIEFzc2V0XG5cdGRlZiBjb25zdHJ1Y3RvciBtYW5pZmVzdFxuXHRcdCNtYW5pZmVzdCA9IG1hbmlmZXN0XG5cblx0Z2V0IGFic1BhdGhcblx0XHQjYWJzUGF0aCB8fD0gI21hbmlmZXN0LnJlc29sdmUoc2VsZilcblx0XG5cdGdldCBuYW1lXG5cdFx0bnAuYmFzZW5hbWUocGF0aClcblxuXHRnZXQgYm9keVxuXHRcdHJlYWRTeW5jIVxuXG5cdGRlZiByZWFkU3luY1xuXHRcdG5mcy5yZWFkRmlsZVN5bmMoYWJzUGF0aCwndXRmLTgnKVxuXG5cdGRlZiBwaXBlIHJlc1xuXHRcdGxldCBzdHJlYW0gPSBuZnMuY3JlYXRlUmVhZFN0cmVhbShhYnNQYXRoKVxuXHRcdHJldHVybiBzdHJlYW0ucGlwZShyZXMpXG5cblx0ZGVmIHRvU3RyaW5nXG5cdFx0dXJsIG9yIGFic1BhdGhcblxuZXhwb3J0IGNsYXNzIE1hbmlmZXN0IDwgRXZlbnRFbWl0dGVyXG5cdGRlZiBjb25zdHJ1Y3RvciBvcHRpb25zID0ge31cblx0XHRzdXBlcigpXG5cdFx0b3B0aW9ucyA9IG9wdGlvbnNcblx0XHRkYXRhID0ge31cblx0XHRwYXRoID0gb3B0aW9ucy5wYXRoXG5cdFx0cmVmcyA9IHt9XG5cdFx0cmV2aXZlciA9IGRvKGtleSkgbmV3IEFzc2V0KHNlbGYpXG5cdFx0aW5pdChvcHRpb25zLmRhdGEpXG5cdFxuXHRnZXQgc3JjZGlyIGRvIG5wLnJlc29sdmUobnAuZGlybmFtZShwYXRoKSxkYXRhLnNyY2Rpcilcblx0Z2V0IG91dGRpciBkbyBucC5yZXNvbHZlKG5wLmRpcm5hbWUocGF0aCksZGF0YS5vdXRkaXIpXG5cdGdldCBjaGFuZ2VzIGRvIGRhdGEuY2hhbmdlcyBvciB7fVxuXHRnZXQgaW5wdXRzIGRvIGRhdGEuaW5wdXRzXG5cdGdldCBvdXRwdXRzIGRvIGRhdGEub3V0cHV0c1xuXHRnZXQgYXNzZXRzIGRvIGRhdGEuYXNzZXRzXG5cblx0Z2V0IHVybHMgZG8gZGF0YS51cmxzIG9yIHt9XG5cdGdldCBtYWluIGRvIGRhdGEubWFpblxuXHRnZXQgY3dkIGRvIHByb2Nlc3MuY3dkIVxuXG5cdGdldCByYXdcblx0XHRkYXRhLiNyYXdcblx0XG5cdGRlZiByZXNvbHZlIHBhdGhcblx0XHRpZiBwYXRoLl8gPT0gJ2lucHV0J1xuXHRcdFx0cmV0dXJuIG5wLnJlc29sdmUoc3JjZGlyIG9yIGN3ZCxwYXRoLnBhdGgpXG5cdFx0ZWxpZiBwYXRoLl8gPT0gJ291dHB1dCdcblx0XHRcdHJldHVybiBucC5yZXNvbHZlKG91dGRpcixwYXRoLnBhdGgpXG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIG5wLnJlc29sdmUoY3dkLHBhdGgucGF0aCBvciBwYXRoKVxuXHRcdFx0XG5cdGRlZiByZXNvbHZlQXNzZXRQYXRoIHBhdGhcblx0XHRyZXR1cm4gbnAucmVzb2x2ZShvdXRkaXIscGF0aClcblx0XG5cdGRlZiByZWFkIHBhdGhcblx0XHRuZnMucmVhZEZpbGVTeW5jKHJlc29sdmUocGF0aCksJ3V0Zi04JylcblxuXHRkZWYgbG9hZEZyb21GaWxlIHBhdGhcblx0XHRuZnMuZXhpc3RzU3luYyhwYXRoKSA/IG5mcy5yZWFkRmlsZVN5bmMocGF0aCwndXRmLTgnKSA6ICd7fSdcblxuXHRkZWYgaW5pdCBkYXRhID0gbnVsbFxuXHRcdGlmIGRhdGEgb3IgcGF0aFxuXHRcdFx0dXBkYXRlKGRhdGEpXG5cdFx0c2VsZlxuXG5cdGRlZiB1cGRhdGUgcmF3IFxuXHRcdGlmIHJhdyA9PSBudWxsXG5cdFx0XHRpZiBwYXRoXG5cdFx0XHRcdHJhdyA9IGxvYWRGcm9tRmlsZShwYXRoKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRjb25zb2xlLndhcm4gXCJjYW5ub3QgdXBkYXRlIG1hbmlmZXN0IHdpdGhvdXQgcGF0aFwiXG5cblx0XHRpZiB0eXBlb2YgcmF3ID09ICdzdHJpbmcnXG5cdFx0XHRsZXQgc3RyID0gcmF3XG5cdFx0XHRyYXcgPSBkZXNlcmlhbGl6ZURhdGEocmF3LHJldml2ZXIpICMgcGFzcyBpbiB0aGUgb2JqZWN0cyB3ZSB3YW50IHRvIHdyYXAgdGhlbSB3aXRoP1xuXHRcdFx0cmF3LiNyYXcgPSBzdHJcblxuXHRcdGRhdGEgPSBwYXRjaE1hbmlmZXN0KGRhdGEgb3Ige30scmF3KVxuXHRcdFxuXHRcdGlmIGRhdGEuY2hhbmdlcy5hbGwubGVuZ3RoXG5cdFx0XHRlbWl0KCdjaGFuZ2UnLGRpZmYsc2VsZilcblx0XHRpZiBkYXRhLmNoYW5nZXMubWFpblxuXHRcdFx0ZW1pdCgnY2hhbmdlOm1haW4nLGRhdGEubWFpbixzZWxmKVxuXHRcdHJldHVybiBkYXRhLmNoYW5nZXNcblxuXHRkZWYgc2VyaWFsaXplRm9yQnJvd3NlclxuXHRcdHJldHVybiBkYXRhLiNyYXdcblxuXHRkZWYgI3JlZnJlc2ggZGF0YVxuXHRcdHllc1xuXG5cdGRlZiB3YXRjaFxuXHRcdGlmICN3YXRjaCA9PyB5ZXNcblx0XHRcdCMgZG9uJ3Qgd2FudCBmaWxlc3lzdGVtIGlmIHdlIGFyZSB1c2luZyBobXJcblx0XHRcdHBhdGggYW5kICFwcm9jZXNzLmVudi5JTUJBX0hNUiBhbmQgbmZzLndhdGNoKHBhdGgpIGRvKGV2LG5hbWUpXG5cdFx0XHRcdGxldCBleGlzdHMgPSBuZnMuZXhpc3RzU3luYyhwYXRoKVxuXHRcdFx0XHRsZXQgc3RhdCA9IGV4aXN0cyBhbmQgbmZzLnN0YXRTeW5jKHBhdGgpXG5cdFx0XHRcdHVwZGF0ZSEgaWYgZXhpc3RzXG5cdFx0XHRcdHJldHVyblxuXG5cdCMgbGlzdGVuIHRvIHVwZGF0ZXMgZXRjXG5cdGRlZiBvbiBldmVudCwgY2Jcblx0XHR3YXRjaCFcblx0XHRzdXBlclxuXG4jIGxldCBwYXRoID0gcmVxdWlyZS5tYWluLmZpbGVuYW1lICsgJy5tYW5pZmVzdCdcbiMgbmV3IE1hbmlmZXN0KHBhdGg6IHByb2Nlc3MuZW52LklNQkFfTUFOSUZFU1RfUEFUSCBvciBwYXRoKVxuY2xhc3MgTGF6eVByb3h5XG5cdHN0YXRpYyBkZWYgZm9yIGdldHRlclxuXHRcdG5ldyBQcm94eSh7fSwgbmV3IHNlbGYoZ2V0dGVyKSlcblxuXHRkZWYgY29uc3RydWN0b3IgZ2V0dGVyXG5cdFx0Z2V0dGVyID0gZ2V0dGVyXG5cdFxuXHRnZXQgdGFyZ2V0XG5cdFx0Z2V0dGVyIVxuXG5cdGRlZiBnZXQgXywga2V5XG5cdFx0dGFyZ2V0W2tleV1cblx0XG5cdGRlZiBzZXQgXywga2V5LCB2YWx1ZVxuXHRcdHRhcmdldFtrZXldID0gdmFsdWVcblx0XHRyZXR1cm4gdHJ1ZVxuXG5leHBvcnQgY29uc3QgbWFuaWZlc3QgPSBMYXp5UHJveHkuZm9yIGRvIGdsb2JhbC4jbWFuaWZlc3QiLCAiIyBpbWJhJGltYmFQYXRoPWdsb2JhbFxuaW1wb3J0IGNsdXN0ZXIgZnJvbSAnY2x1c3RlcidcbmltcG9ydCBuZnMgZnJvbSAnZnMnXG5pbXBvcnQgbnAgZnJvbSAncGF0aCdcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnXG5pbXBvcnQge21hbmlmZXN0fSBmcm9tICcuL21hbmlmZXN0J1xuIyBpbXBvcnQge0RvY3VtZW50LExvY2F0aW9ufSBmcm9tICcuL2RvbS9jb3JlJ1xuaW1wb3J0IGxvZyBmcm9tICcuLi91dGlscy9sb2dnZXInXG5cbmltcG9ydCB7TW9kdWxlfSBmcm9tICdtb2R1bGUnXG5pbXBvcnQgaHR0cCBmcm9tICdodHRwJ1xuaW1wb3J0IGh0dHBzIGZyb20gJ2h0dHBzJ1xuaW1wb3J0IHtIdHRwMlNlcnZlclJlcXVlc3R9IGZyb20gJ2h0dHAyJ1xuXG5jb25zdCBkZWZhdWx0SGVhZGVycyA9IHtcblx0aHRtbDogeydDb250ZW50LVR5cGUnOiAndGV4dC9odG1sJ31cblx0anM6IHsnQ29udGVudC1UeXBlJzogJ3RleHQvamF2YXNjcmlwdCd9XG5cdG1qczogeydDb250ZW50LVR5cGUnOiAndGV4dC9qYXZhc2NyaXB0J31cblx0anNvbjogeydDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbid9XG5cdGNzczogeydDb250ZW50LVR5cGUnOiAndGV4dC9jc3MnfVxuXHRcdFxuXHRvdGY6IHsnQ29udGVudC1UeXBlJzogJ2ZvbnQvb3RmJ31cblx0dHRmOiB7J0NvbnRlbnQtVHlwZSc6ICdmb250L3R0Zid9XG5cdHdvZmY6IHsnQ29udGVudC1UeXBlJzogJ2ZvbnQvd29mZid9XG5cdHdvZmYyOiB7J0NvbnRlbnQtVHlwZSc6ICdmb250L3dvZmYyJ31cblx0XG5cdHN2ZzogeydDb250ZW50LVR5cGUnOiAnaW1hZ2Uvc3ZnK3htbCd9XG5cdGF2aWY6IHsnQ29udGVudC1UeXBlJzogJ2ltYWdlL2F2aWYnfVxuXHRnaWY6IHsnQ29udGVudC1UeXBlJzogJ2ltYWdlL2dpZid9XG5cdHBuZzogeydDb250ZW50LVR5cGUnOiAnaW1hZ2UvcG5nJ31cblx0YXBuZzogeydDb250ZW50LVR5cGUnOiAnaW1hZ2UvYXBuZyd9XHRcblx0d2VicDogeydDb250ZW50LVR5cGUnOiAnaW1hZ2Uvd2VicCd9XG5cdGpwZzogeydDb250ZW50LVR5cGUnOiAnaW1hZ2UvanBlZyd9XG5cdGpwZWc6IHsnQ29udGVudC1UeXBlJzogJ2ltYWdlL2pwZWcnfVxufVxuXG5jb25zdCBwcm9jID0gZ2xvYmFsLnByb2Nlc3NcblxuY2xhc3MgU2VydmVycyA8IFNldFxuXG5cdGRlZiBjYWxsIG5hbWUsLi4ucGFyYW1zXG5cdFx0Zm9yIHNlcnZlciBvZiBzZWxmXG5cdFx0XHRzZXJ2ZXJbbmFtZV0oLi4ucGFyYW1zKVxuXG5cdGRlZiBjbG9zZSBvID0ge31cdFxuXHRcdGZvciBzZXJ2ZXIgb2Ygc2VsZlxuXHRcdFx0c2VydmVyLmNsb3NlKG8pXG5cblx0ZGVmIHJlbG9hZCBvID0ge31cdFxuXHRcdGZvciBzZXJ2ZXIgb2Ygc2VsZlxuXHRcdFx0c2VydmVyLnJlbG9hZChvKVxuXHRcblx0ZGVmIGJyb2FkY2FzdCBtc2csIC4uLnJlc3Rcblx0XHRmb3Igc2VydmVyIG9mIHNlbGZcblx0XHRcdHNlcnZlci5icm9hZGNhc3QobXNnLC4uLnJlc3QpXG5cblx0ZGVmIGVtaXQgZXZlbnQsIGRhdGFcblx0XHRmb3Igc2VydmVyIG9mIHNlbGZcblx0XHRcdHNlcnZlci5lbWl0KGV2ZW50LGRhdGEpXG5cbmV4cG9ydCBjb25zdCBzZXJ2ZXJzID0gbmV3IFNlcnZlcnNcblxuZXhwb3J0IGNvbnN0IHByb2Nlc3MgPSBuZXcgY2xhc3MgUHJvY2VzcyA8IEV2ZW50RW1pdHRlclxuXG5cdGRlZiBjb25zdHJ1Y3RvclxuXHRcdHN1cGVyXG5cdFx0YXV0b3JlbG9hZCA9IG5vXG5cdFx0c3RhdGUgPSB7fSAjIHByb3h5IGZvciBsaXN0ZW5pbmc/XG5cdFx0IyBwcm9jZXNzIGlzIFxuXHRcdGlmIGNsdXN0ZXIuaXNXb3JrZXJcblx0XHRcdCMgY29uc29sZS5sb2cgJ2NyZWF0ZWQgZm9yIHdvcmtlciEhISdcblx0XHRcdCMgZG9lcyB0aGlzIG1ha2UgdXMgdW5hYmxlIHRvIGF1dG9tYXRpY2FsbHkgc3RvcCBhIHByb2Nlc3M/XG5cdFx0XHRwcm9jLm9uKCdtZXNzYWdlJykgZG8obXNnKVxuXHRcdFx0XHRlbWl0KCdtZXNzYWdlJyxtc2cpXG5cdFx0XHRcdGVtaXQoLi4ubXNnLnNsaWNlKDEpKSBpZiBtc2dbMF0gPT0gJ2VtaXQnXG5cdFx0XHRcdCMgcmVsb2FkISBpZiBtc2cgPT0gJ3JlbG9hZCdcblx0XHRzZWxmXG5cblx0ZGVmICNzZXR1cFxuXHRcdHJldHVybiB1bmxlc3MgI3NldHVwPyA9PyB5ZXNcblxuXHRcdG9uKCdyZWxvYWRpbmcnKSBkbyhlKVxuXHRcdFx0Y29uc29sZS5sb2cgJ2lzIHJlbG9hZGluZyAtIGZyb20gb3V0c2lkZSdcblx0XHRcdHN0YXRlLnJlbG9hZGluZyA9IHllc1xuXHRcdFx0Zm9yIHNlcnZlciBvZiBzZXJ2ZXJzXG5cdFx0XHRcdHNlcnZlci5wYXVzZSFcblxuXHRcdG9uKCdyZWxvYWRlZCcpIGRvKGUpXG5cdFx0XHRzdGF0ZS5yZWxvYWRlZCA9IHllc1xuXHRcdFx0Y29uc29sZS5sb2cgJ2lzIHJlbG9hZGVkIC0gZnJvbSBvdXRzaWRlJ1xuXG5cdFx0XHRsZXQgcHJvbWlzZXMgPSBmb3Igc2VydmVyIG9mIHNlcnZlcnNcblx0XHRcdFx0c2VydmVyLmNsb3NlIVxuXHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG5cdFx0XHQjIGNvbnNvbGUubG9nICdhY3R1YWxseSBjbG9zZWQhISdcblx0XHRcdHByb2MuZXhpdCgwKVxuXG5cdFx0b24oJ21hbmlmZXN0OmNoYW5nZScpIGRvKGUpXG5cdFx0XHRpZiBwcm9jLmVudi5JTUJBX0hNUlxuXHRcdFx0XHQjIGNvbnNvbGUubG9nICdtYW5pZmVzdCBjaGFuZ2VkIGZyb20gbWFzdGVyJ1xuXHRcdFx0XHRtYW5pZmVzdC51cGRhdGUoZSlcblx0XHRcblx0XHRvbignbWFuaWZlc3Q6ZXJyb3InKSBkbyhlKVxuXHRcdFx0aWYgcHJvYy5lbnYuSU1CQV9ITVJcblx0XHRcdFx0bWFuaWZlc3QuZXJyb3JzID0gZVxuXHRcdFx0XHRzZXJ2ZXJzLmJyb2FkY2FzdCgnZXJyb3JzJyxtYW5pZmVzdC5lcnJvcnMpXG5cdFx0eWVzXG5cblx0ZGVmIHNlbmQgbXNnXG5cdFx0aWYgcHJvYy5zZW5kIGlzYSBGdW5jdGlvblxuXHRcdFx0cHJvYy5zZW5kKG1zZylcblxuXHRkZWYgb24gbmFtZSwgY2Jcblx0XHR3YXRjaCEgaWYgbmFtZSA9PSAnY2hhbmdlJ1xuXHRcdHN1cGVyXG5cblx0ZGVmIHdhdGNoXG5cdFx0aWYgI3dhdGNoID0/IHllc1xuXHRcdFx0bWFuaWZlc3Qub24oJ2NoYW5nZTptYWluJykgZG9cblx0XHRcdFx0ZW1pdCgnY2hhbmdlJyxtYW5pZmVzdClcblxuXHRkZWYgcmVsb2FkXG5cdFx0IyBvbmx5IGFsbG93IHJlbG9hZGluZyBvbmNlXG5cdFx0cmV0dXJuIHNlbGYgdW5sZXNzIGlzUmVsb2FkaW5nID0/IHllc1xuXHRcdHN0YXRlLnJlbG9hZGluZyA9IHllc1xuXG5cdFx0dW5sZXNzIHByb2MuZW52LklNQkFfU0VSVkVcblx0XHRcdGNvbnNvbGUud2FybiBcIm5vdCBwb3NzaWJsZSB0byBncmFjZWZ1bGx5IHJlbG9hZCBzZXJ2ZXJzIG5vdCBzdGFydGVkIHZpYSBpbWJhIHN0YXJ0XCJcblx0XHRcdHJldHVyblxuXG5cdFx0c2VuZCgncmVsb2FkJylcblx0XHRyZXR1cm5cblxuXHRcdCMgc3RhbGwgYWxsIGN1cnJlbnQgc2VydmVyc1xuXHRcdGZvciBzZXJ2ZXIgb2Ygc2VydmVyc1xuXHRcdFx0c2VydmVyLnBhdXNlIVxuXHRcblx0XHRvbigncmVsb2FkZWQnKSBkbyhlKVxuXHRcdFx0IyBjb25zb2xlLmxvZyAnY2xvc2luZyBzZXJ2ZXJzJ1xuXHRcdFx0bGV0IHByb21pc2VzID0gZm9yIHNlcnZlciBvZiBzZXJ2ZXJzXG5cdFx0XHRcdHNlcnZlci5jbG9zZSFcblx0XHRcdGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKVxuXHRcdFx0IyBjb25zb2xlLmxvZyAnYWN0dWFsbHkgY2xvc2VkISEnXG5cdFx0XHRwcm9jLmV4aXQoMClcblxuXHRcdHNlbmQoJ3JlbG9hZCcpXG5cblxuY2xhc3MgQXNzZXRSZXNwb25kZXJcblx0ZGVmIGNvbnN0cnVjdG9yIHVybCwgcGFyYW1zID0ge31cblx0XHR1cmwgPSB1cmxcblx0XHRbcGF0aCxxdWVyeV0gPSB1cmwuc3BsaXQoJz8nKVxuXHRcdGV4dCA9IG5wLmV4dG5hbWUocGF0aClcblxuXHRcdGhlYWRlcnMgPSB7XG5cdFx0XHQnQ29udGVudC1UeXBlJzogJ3RleHQvcGxhaW4nXG5cdFx0XHQnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonXG5cdFx0XHQnY2FjaGUtY29udHJvbCc6ICdwdWJsaWMnXG5cdFx0fVxuXHRcdE9iamVjdC5hc3NpZ24oaGVhZGVycyxkZWZhdWx0SGVhZGVyc1tleHQuc2xpY2UoMSldIG9yIHt9KVxuXG5cdGRlZiByZXNwb25kIHJlcSwgcmVzXG5cdFx0bGV0IGFzc2V0ID0gbWFuaWZlc3QudXJsc1t1cmxdXG5cdFx0bGV0IGhlYWRlcnMgPSBoZWFkZXJzXG5cdFx0bGV0IHBhdGggPSBhc3NldCA/IG1hbmlmZXN0LnJlc29sdmUoYXNzZXQpIDogbWFuaWZlc3QucmVzb2x2ZUFzc2V0UGF0aCgncHVibGljJyArIHNlbGYucGF0aClcblxuXHRcdCMgIG5wLnJlc29sdmUocHJvYy5jd2QhLGFzc2V0LnBhdGgpXG5cdFx0dW5sZXNzIHBhdGhcblx0XHRcdGNvbnNvbGUubG9nICdmb3VuZCBubyBwYXRoIGZvcicsYXNzZXQsdXJsXG5cdFx0XHRyZXMud3JpdGVIZWFkKDQwNCwge30pXG5cdFx0XHRyZXR1cm4gcmVzLmVuZCFcblxuXHRcdGlmIGFzc2V0IFxuXHRcdFx0aWYgYXNzZXQudHRsID4gMFxuXHRcdFx0XHRoZWFkZXJzWydjYWNoZS1jb250cm9sJ10gPSBcIm1heC1hZ2U9e2Fzc2V0LnR0bH1cIlxuXHRcdFxuXHRcdFx0aWYgYXNzZXQuaW1wb3J0c1xuXHRcdFx0XHRsZXQgbGluayA9IFtdXG5cdFx0XHRcdGZvciBpdGVtIGluIGFzc2V0LmltcG9ydHNcblx0XHRcdFx0XHRsaW5rLnB1c2goXCI8e2l0ZW0udXJsfT47IHJlbD1tb2R1bGVwcmVsb2FkOyBhcz1zY3JpcHRcIilcblx0XHRcdFx0aGVhZGVyc1snTGluayddID0gbGluay5qb2luKCcsICcpXG5cdFx0IyBpbmNsdWRlIFxuXHRcdFxuXHRcdG5mcy5hY2Nlc3MocGF0aCxuZnMuY29uc3RhbnRzLlJfT0spIGRvKGVycilcblx0XHRcdGlmIGVyclxuXHRcdFx0XHRjb25zb2xlLmxvZyAnY291bGQgbm90IGZpbmQgcGF0aCcscGF0aFxuXHRcdFx0XHRyZXMud3JpdGVIZWFkKDQwNCx7fSlcblx0XHRcdFx0cmV0dXJuIHJlcy5lbmQhXG5cdFx0XHRcblx0XHRcdHRyeVxuXHRcdFx0XHRsZXQgc3RyZWFtID0gbmZzLmNyZWF0ZVJlYWRTdHJlYW0ocGF0aClcblx0XHRcdFx0cmVzLndyaXRlSGVhZCgyMDAsIGhlYWRlcnMpXG5cdFx0XHRcdHJldHVybiBzdHJlYW0ucGlwZShyZXMpXG5cdFx0XHRjYXRjaCBlXG5cdFx0XHRcdHJlcy53cml0ZUhlYWQoNTAzLHt9KVxuXHRcdFx0XHRyZXR1cm4gcmVzLmVuZCFcblxuXHRkZWYgY3JlYXRlUmVhZFN0cmVhbVxuXHRcdG5mcy5jcmVhdGVSZWFkU3RyZWFtKHBhdGgpXG5cblx0ZGVmIHBpcGUgcmVzcG9uc2Vcblx0XHRjcmVhdGVSZWFkU3RyZWFtIS5waXBlKHJlc3BvbnNlKVxuXG5jbGFzcyBTZXJ2ZXJcblxuXHRzdGF0aWMgZGVmIHdyYXAgc2VydmVyXG5cdFx0bmV3IHNlbGYoc2VydmVyKVxuXG5cdGRlZiBjb25zdHJ1Y3RvciBzcnZcblx0XHRzZXJ2ZXJzLmFkZChzZWxmKVxuXHRcdGlkID0gTWF0aC5yYW5kb20hXG5cdFx0Y2xvc2VkID0gbm9cblx0XHRwYXVzZWQgPSBub1xuXHRcdHNlcnZlciA9IHNydlxuXHRcdGNsaWVudHMgPSBuZXcgU2V0XG5cdFx0c3RhbGxlZFJlc3BvbnNlcyA9IFtdXG5cdFx0YXNzZXRSZXNwb25kZXJzID0ge31cblx0XHRpZiBwcm9jLmVudi5JTUJBX1BBVEhcblx0XHRcdGRldnRvb2xzUGF0aCA9IG5wLnJlc29sdmUocHJvYy5lbnYuSU1CQV9QQVRILCdkZXZ0b29scy5pbWJhLndlYi5qcycpXG5cblx0XHRzY2hlbWUgPSBzcnYgaXNhIGh0dHAuU2VydmVyID8gJ2h0dHAnIDogJ2h0dHBzJ1xuXG5cdFx0IyBmZXRjaCBhbmQgcmVtb3ZlIHRoZSBvcmlnaW5hbCByZXF1ZXN0IGxpc3RlbmVyXG5cdFx0bGV0IG9yaWdpbmFsSGFuZGxlciA9IHNlcnZlci5fZXZlbnRzLnJlcXVlc3Rcblx0XHRsZXQgZG9tID0gZ2xvYmFsLiNkb21cblx0XHRzcnYub2ZmKCdyZXF1ZXN0JyxvcmlnaW5hbEhhbmRsZXIpXG5cblx0XHQjIGNoZWNrIGlmIHRoaXMgaXMgYW4gZXhwcmVzcyBhcHA/XG5cdFx0b3JpZ2luYWxIYW5kbGVyLiNzZXJ2ZXIgPSBzZWxmXG5cblx0XHRzcnYub24oJ2xpc3RlbmluZycpIGRvXG5cdFx0XHQjIGlmIG5vdCBzaWxlbnQ/XG5cdFx0XHRsZXQgYWRyID0gc2VydmVyLmFkZHJlc3MhXG5cdFx0XHRsZXQgaG9zdCA9IGFkci5hZGRyZXNzXG5cdFx0XHRpZiBob3N0ID09ICc6Oicgb3IgaG9zdCA9PSAnMC4wLjAuMCdcblx0XHRcdFx0aG9zdCA9ICdsb2NhbGhvc3QnXG5cdFx0XHRsZXQgdXJsID0gXCJ7c2NoZW1lfTovL3tob3N0fTp7YWRyLnBvcnR9L1wiXG5cdFx0XHRsb2cuaW5mbyAnbGlzdGVuaW5nIG9uICVib2xkJyx1cmxcblx0XHRcdCMgTG9nZ2VyLm1haW4ud2FybiAnbGlzdGVuaW5nIG9uICVib2xkJyx1cmxcblxuXHRcdCMgaWYgd2UgYXJlIGluIGRldi1tb2RlLCBicm9hZGNhc3QgdXBkYXRlZCBtYW5pZmVzdCB0byB0aGUgY2xpZW50c1xuXHRcdFxuXHRcdG1hbmlmZXN0Lm9uKCdjaGFuZ2UnKSBkbyhjaGFuZ2VzLG0pXG5cdFx0XHRicm9hZGNhc3QoJ21hbmlmZXN0JyxtLmRhdGEuI3Jhdylcblx0XHRcblx0XHRoYW5kbGVyID0gZG8ocmVxLHJlcylcblx0XHRcdGxldCBpc2h0dHAyID0gcmVxIGlzYSBIdHRwMlNlcnZlclJlcXVlc3Rcblx0XHRcdGxldCB1cmwgPSByZXEudXJsXG5cdFx0XHRsZXQgYXNzZXRQcmVmaXggPSAnL19fYXNzZXRzX18vJ1xuXG5cdFx0XHRpZiBwYXVzZWQgb3IgY2xvc2VkXG5cdFx0XHRcdHJlcy5zdGF0dXNDb2RlPTMwMlxuXHRcdFx0XHRyZXMuc2V0SGVhZGVyKCdMb2NhdGlvbicscmVxLnVybClcblxuXHRcdFx0XHR1bmxlc3MgaXNodHRwMlxuXHRcdFx0XHRcdHJlcy5zZXRIZWFkZXIoJ0Nvbm5lY3Rpb24nLCdjbG9zZScpXG5cblx0XHRcdFx0aWYgY2xvc2VkXG5cdFx0XHRcdFx0aWYgaXNodHRwMlxuXHRcdFx0XHRcdFx0cmVxLnN0cmVhbS5zZXNzaW9uLmNsb3NlIVxuXHRcdFx0XHRcdHJldHVybiByZXMuZW5kIVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0cmV0dXJuIHN0YWxsZWRSZXNwb25zZXMucHVzaChyZXMpXG5cblx0XHRcdGlmIHVybCA9PSAnL19faG1yX18uanMnIGFuZCBkZXZ0b29sc1BhdGhcblx0XHRcdFx0IyBhbmQgaWYgaG1yP1xuXHRcdFx0XHRsZXQgc3RyZWFtID0gbmZzLmNyZWF0ZVJlYWRTdHJlYW0oZGV2dG9vbHNQYXRoKVxuXHRcdFx0XHRyZXMud3JpdGVIZWFkKDIwMCwgZGVmYXVsdEhlYWRlcnMuanMpXG5cdFx0XHRcdHJldHVybiBzdHJlYW0ucGlwZShyZXMpXG5cdFx0XHRcblx0XHRcdGlmIHVybCA9PSAnL19faG1yX18nXG5cdFx0XHRcdGxldCBoZWFkZXJzID0ge1xuXHRcdFx0XHRcdCdDb250ZW50LVR5cGUnOiAndGV4dC9ldmVudC1zdHJlYW0nXG5cdFx0XHRcdFx0J0NhY2hlLUNvbnRyb2wnOiAnbm8tY2FjaGUnXG5cdFx0XHRcdH1cblx0XHRcdFx0dW5sZXNzIGlzaHR0cDJcblx0XHRcdFx0XHRoZWFkZXJzWydDb25uZWN0aW9uJ10gPSAna2VlcC1hbGl2ZSdcblxuXHRcdFx0XHRyZXMud3JpdGVIZWFkKDIwMCxoZWFkZXJzKVxuXHRcdFx0XHRjbGllbnRzLmFkZChyZXMpXG5cdFx0XHRcdGJyb2FkY2FzdCgnaW5pdCcsbWFuaWZlc3Quc2VyaWFsaXplRm9yQnJvd3NlciEsW3Jlc10pXG5cdFx0XHRcdHJlcS5vbignY2xvc2UnKSBkbyBjbGllbnRzLmRlbGV0ZShyZXMpXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcblx0XHRcdCMgZm91bmQgYSBoaXQgZm9yIHRoZSB1cmw/XG5cdFx0XHRpZiB1cmwuaW5kZXhPZihhc3NldFByZWZpeCkgPT0gMCBvciBtYW5pZmVzdC51cmxzW3VybF1cblx0XHRcdFx0IyBsZXQgYXNzZXQgPSBtYW5pZmVzdC51cmxzW3VybF1cblx0XHRcdFx0bGV0IHJlc3BvbmRlciA9IGFzc2V0UmVzcG9uZGVyc1t1cmxdIHx8PSBuZXcgQXNzZXRSZXNwb25kZXIodXJsLHNlbGYpXG5cdFx0XHRcdHJldHVybiByZXNwb25kZXIucmVzcG9uZChyZXEscmVzKVxuXG5cdFx0XHQjIGNyZWF0ZSBmdWxsIHVybFxuXHRcdFx0bGV0IGhlYWRlcnMgPSByZXEuaGVhZGVyc1xuXHRcdFx0bGV0IGJhc2Vcblx0XHRcdGlmIGlzaHR0cDJcblx0XHRcdFx0YmFzZSA9IGhlYWRlcnNbJzpzY2hlbWUnXSArICc6Ly8nICsgaGVhZGVyc1snOmF1dGhvcml0eSddXG5cdFx0XHRlbHNlXG5cdFx0XHRcdGxldCBzY2hlbWUgPSByZXEuY29ubmVjdGlvbi5lbmNyeXB0ZWQgPyAnaHR0cHMnIDogJ2h0dHAnXG5cdFx0XHRcdGJhc2UgPSBzY2hlbWUgKyAnOi8vJyArIGhlYWRlcnMuaG9zdFxuXG5cdFx0XHQjIGNvbnNvbGUubG9nIFwiZ2V0IGhlYWRlcnNcIixiYXNlLHJlcS51cmwsaGVhZGVycyxyZXEucHJvdG9jb2xcblx0XHRcdFxuXHRcdFx0aWYgZG9tXG5cdFx0XHRcdGxldCBsb2MgPSBuZXcgZG9tLkxvY2F0aW9uKHJlcS51cmwsYmFzZSlcblx0XHRcdFx0IyBjcmVhdGUgYSBjb250ZXh0IC0gbm90IGEgZG9jdW1lbnQ/XG5cdFx0XHRcdGRvbS5Eb2N1bWVudC5jcmVhdGUobG9jYXRpb246IGxvYykgZG9cblx0XHRcdFx0XHRyZXR1cm4gb3JpZ2luYWxIYW5kbGVyKHJlcSxyZXMpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHJldHVybiBvcmlnaW5hbEhhbmRsZXIocmVxLHJlcylcblxuXHRcdHNydi5vbigncmVxdWVzdCcsaGFuZGxlcilcblxuXHRcdHNydi5vbignY2xvc2UnKSBkb1xuXHRcdFx0Y29uc29sZS5sb2cgXCJzZXJ2ZXIgaXMgY2xvc2luZyEhIVwiXG5cblx0XHRpZiBjbHVzdGVyLmlzV29ya2VyXG5cdFx0XHRwcm9jZXNzLiNzZXR1cCFcblx0XHRcdHByb2Nlc3Muc2VuZCgnc2VydmUnKVxuXG5cdGRlZiBicm9hZGNhc3QgZXZlbnQsIGRhdGEgPSB7fSwgY2xpZW50cyA9IGNsaWVudHNcblx0XHRkYXRhID0gSlNPTi5zdHJpbmdpZnkoZGF0YSlcblx0XHRsZXQgbXNnID0gXCJkYXRhOiB7ZGF0YX1cXG5cXG5cXG5cIlxuXHRcdGZvciBjbGllbnQgb2YgY2xpZW50c1xuXHRcdFx0Y2xpZW50LndyaXRlKFwiZXZlbnQ6IHtldmVudH1cXG5cIilcblx0XHRcdGNsaWVudC53cml0ZShcImlkOiBpbWJhXFxuXCIpXG5cdFx0XHRjbGllbnQud3JpdGUobXNnKVxuXHRcdHJldHVybiBzZWxmXG5cblx0ZGVmIHBhdXNlXG5cdFx0aWYgcGF1c2VkID0/IHllc1xuXHRcdFx0YnJvYWRjYXN0KCdwYXVzZWQnKVxuXHRcdFx0IyBjb25zb2xlLmxvZyAncGF1c2VkIHNlcnZlcidcblx0XHRzZWxmXG5cblx0ZGVmIHJlc3VtZVxuXHRcdGlmIHBhdXNlZCA9PyBub1xuXHRcdFx0IyBjb25zb2xlLmxvZyAncmVzdW1lZCBzZXJ2ZXInXG5cdFx0XHRicm9hZGNhc3QoJ3Jlc3VtZWQnKVxuXHRcdFx0Zmx1c2hTdGFsbGVkUmVzcG9uc2VzIVxuXG5cdGRlZiBmbHVzaFN0YWxsZWRSZXNwb25zZXNcblx0XHRmb3IgcmVzIGluIHN0YWxsZWRSZXNwb25zZXNcblx0XHRcdHJlcy5lbmQhXG5cdFx0c3RhbGxlZFJlc3BvbnNlcyA9IFtdXG5cdFxuXHRkZWYgY2xvc2Vcblx0XHRwYXVzZSFcblxuXHRcdG5ldyBQcm9taXNlIGRvKHJlc29sdmUpXG5cdFx0XHRjbG9zZWQgPSB5ZXNcblx0XHRcdHNlcnZlci5jbG9zZShyZXNvbHZlKVxuXHRcdFx0Zmx1c2hTdGFsbGVkUmVzcG9uc2VzIVxuXG5leHBvcnQgZGVmIHNlcnZlIHNydiwuLi5wYXJhbXNcblx0cmV0dXJuIFNlcnZlci53cmFwKHNydiwuLi5wYXJhbXMpXG5cbmV4cG9ydCBkZWYgX2ZpbGVuYW1lXyBwYXRoXG5cdG5wLnJlc29sdmUocHJvYy5jd2QhLHBhdGgpXG5cbmV4cG9ydCBkZWYgX2Rpcm5hbWVfIHBhdGhcblx0bnAuZGlybmFtZShfZmlsZW5hbWVfKHBhdGgpKVxuXG5leHBvcnQgZGVmIF9ydW5fIG1vZHVsZSwgZmlsZVxuXHR0cnlcblx0XHRsZXQgc3JjZGlyID0gbWFuaWZlc3Quc3JjZGlyXG5cdFx0bGV0IHNyYyA9IHNyY2RpciArICcvc2VydmVyLmltYmEnXG5cdFx0bGV0IHBhdGhzID0gcmVxdWlyZS5yZXNvbHZlLnBhdGhzKHNyY2RpciArICcvc2VydmVyLmltYmEnKVxuXHRcdHJlcXVpcmUubWFpbi5wYXRocy51bnNoaWZ0KC4uLk1vZHVsZS5fbm9kZU1vZHVsZVBhdGhzKG1hbmlmZXN0LnNyY2RpcikpIiwgImltcG9ydCB7cGVyZm9ybWFuY2V9IGZyb20gJ3BlcmZfaG9va3MnXG5cbmNvbnN0IGFuc2lNYXAgPVxuXHRyZXNldDogWzAsIDBdLFxuXHRib2xkOiBbMSwgMjJdLFxuXHRkaW06IFsyLCAyMl0sXG5cdGl0YWxpYzogWzMsIDIzXSxcblx0dW5kZXJsaW5lOiBbNCwgMjRdLFxuXHRpbnZlcnNlOiBbNywgMjddLFxuXHRoaWRkZW46IFs4LCAyOF0sXG5cdHN0cmlrZXRocm91Z2g6IFs5LCAyOV1cblx0XG5cdGJsYWNrOiBbMzAsIDM5XSxcblx0cmVkOiBbMzEsIDM5XSxcblx0Z3JlZW46IFszMiwgMzldLFxuXHR5ZWxsb3c6IFszMywgMzldLFxuXHRibHVlOiBbMzQsIDM5XSxcblx0bWFnZW50YTogWzM1LCAzOV0sXG5cdGN5YW46IFszNiwgMzldLFxuXHR3aGl0ZTogWzM3LCAzOV0sXG5cdGdyYXk6IFs5MCwgMzldLFxuXHRcblx0cmVkQnJpZ2h0OiBbOTEsIDM5XSxcblx0Z3JlZW5CcmlnaHQ6IFs5MiwgMzldLFxuXHR5ZWxsb3dCcmlnaHQ6IFs5MywgMzldLFxuXHRibHVlQnJpZ2h0OiBbOTQsIDM5XSxcblx0bWFnZW50YUJyaWdodDogWzk1LCAzOV0sXG5cdGN5YW5CcmlnaHQ6IFs5NiwgMzldLFxuXHR3aGl0ZUJyaWdodDogWzk3LCAzOV1cblxuY29uc3QgYW5zaSA9XG5cdGJvbGQ6IGRvKHRleHQpICdcXHUwMDFiWzFtJyArIHRleHQgKyAnXFx1MDAxYlsyMm0nXG5cdHJlZDogZG8odGV4dCkgJ1xcdTAwMWJbMzFtJyArIHRleHQgKyAnXFx1MDAxYlszOW0nXG5cdGdyZWVuOiBkbyh0ZXh0KSAnXFx1MDAxYlszMm0nICsgdGV4dCArICdcXHUwMDFiWzM5bSdcblx0eWVsbG93OiBkbyh0ZXh0KSAnXFx1MDAxYlszM20nICsgdGV4dCArICdcXHUwMDFiWzM5bSdcblx0Ymx1ZTogZG8odGV4dCkgJ1xcdTAwMWJbOTRtJyArIHRleHQgKyAnXFx1MDAxYlszOW0nXG5cdGdyYXk6IGRvKHRleHQpICdcXHUwMDFiWzkwbScgKyB0ZXh0ICsgJ1xcdTAwMWJbMzltJ1xuXHR3aGl0ZTogZG8odGV4dCkgJ1xcdTAwMWJbMzdtJyArIHRleHQgKyAnXFx1MDAxYlszOW0nXG5cdGY6IGRvKG5hbWUsdGV4dClcblx0XHRsZXQgcGFpciA9IGFuc2lNYXBbbmFtZV1cblx0XHRyZXR1cm4gJ1xcdTAwMWJbJytwYWlyWzBdKydtJyArIHRleHQgKyAnXFx1MDAxYlsnK3BhaXJbMV0rJ20nXG5cbmFuc2kud2FybiA9IGFuc2kueWVsbG93XG5hbnNpLmVycm9yID0gYW5zaS5yZWRcblxuY29uc3Qgbm90V2luID0gcHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ3dpbjMyJyB8fCBwcm9jZXNzLmVudi5DSSB8fCBwcm9jZXNzLmVudi5URVJNID09PSAneHRlcm0tMjU2Y29sb3InXG5cbiMgaW1wb3J0IG9yYSBmcm9tICdvcmEnXG5cbmNvbnN0IGxvZ1N5bWJvbHMgPSB7XG5cdGluZm86IGFuc2kuZigneWVsbG93QnJpZ2h0Jyxub3RXaW4gPyAnXHUyMTM5JyA6ICdpJylcblx0c3VjY2VzczogYW5zaS5ncmVlbihub3RXaW4gPyAnXHUyNzE0JyA6ICdcdTIyMUEnKVxuXHR3YXJuaW5nOiBhbnNpLnllbGxvdyhub3RXaW4gPyAnXHUyNkEwJyA6ICchIScpXG5cdGVycm9yOiBhbnNpLnJlZChub3RXaW4gPyAnXHUwMEQ3JyA6ICdcdTI3MTYnKVxuXHRkZWJ1ZzogYW5zaS5ibHVlKG5vdFdpbiA/ICdcdTIxMzknIDogJ2knKVxufVxuXG5jb25zdCBsb2dMZXZlbHMgPSBbJ2RlYnVnJywnaW5mbycsJ3N1Y2Nlc3MnLCd3YXJuaW5nJywnZXJyb3InLCdzaWxlbnQnXVxuXG5jb25zdCBhZGRyZXNzVHlwZU5hbWUgPSB7XG5cdFwiLTFcIjogXCJzb2NrZXRcIlxuXHRcIjRcIjogXCJpcDRcIlxuXHRcIjZcIjogXCJpcDZcIlxufVxuXG5leHBvcnQgZGVmIGZvcm1hdE1hcmtkb3duIHN0clxuXHRsZXQgZm10ID0gYW5zaS5mXG5cdFxuXHRzdHIgPSBzdHIucmVwbGFjZSgvaHR0cHM/XFw6W15cXHNcXG5cXClcXF1dKy9nKSBkbyhtKVxuXHRcdCMgZm10KCdpdGFsaWMnLGZtdCgnYmx1ZUJyaWdodCcsbSkpXG5cdFx0Zm10KCdibHVlQnJpZ2h0JyxtKVxuXHRzdHIgPSBzdHIucmVwbGFjZSgvXltcXHRcXHNdKlxcPlteXFxuXSsvZ20pIGRvKG0pXG5cdFx0IyBmbXQoJ2l0YWxpYycsZm10KCdibHVlQnJpZ2h0JyxtKSlcblx0XHRmbXQoJ2JvbGQnLG0pXG5cdFxuXHRzdHIgPSBzdHIucmVwbGFjZSgvXFx0L2csJyAgJylcblx0c3RyID0gc3RyLnJlcGxhY2UoL14vZ20sJyAgJylcblx0c3RyXG5cbmV4cG9ydCBkZWYgZm9ybWF0IHN0ciwuLi5yZXN0XG5cdCMgY29sb3IgbWFya2Rvd24/XG5cblx0bGV0IGZtdCA9IGFuc2kuZlxuXHRzdHIgPSBzdHIucmVwbGFjZSgvXFwlKFtcXHdcXC5dKykvZykgZG8obSxmKVxuXHRcdGxldCBwYXJ0ID0gcmVzdC5zaGlmdCFcblx0XHRpZiBmID09ICdtYXJrZG93bidcblx0XHRcdGZvcm1hdE1hcmtkb3duKHBhcnQpXG5cdFxuXHRcdGVsaWYgZiA9PSAna2InXG5cdFx0XHRmbXQgJ2RpbScsIChwYXJ0IC8gMTAwMCkudG9GaXhlZCgxKSArICdrYidcblx0XHRlbGlmIGYgPT0gJ3BhdGgnIG9yIGYgPT0gJ2JvbGQnXG5cdFx0XHRmbXQoJ2JvbGQnLHBhcnQpXG5cdFx0ZWxpZiBmID09ICdkaW0nXG5cdFx0XHRmbXQoJ2RpbScscGFydClcblx0XHRlbGlmIGYgPT0gJ2FkZHJlc3MnXG5cdFx0XHRsZXQgdHlwID0gYWRkcmVzc1R5cGVOYW1lW3BhcnQuYWRkcmVzc1R5cGVdXG5cdFx0XHRpZiBwYXJ0LnBvcnRcblx0XHRcdFx0IyB3aGF0IGFib3V0IHRoZSBwcm90b2NvbD9cblx0XHRcdFx0Zm10KCdibHVlQnJpZ2h0JyxbcGFydC5hZGRyZXNzIG9yIFwiaHR0cDovLzEyNy4wLjAuMVwiLHBhcnQucG9ydF0uam9pbignOicpKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRmbXQoJ2JsdWVCcmlnaHQnLHR5cClcblx0XHRlbGlmIGYgPT0gJ21zJ1xuXHRcdFx0Zm10KCd5ZWxsb3cnLE1hdGgucm91bmQocGFydCkgKyAnbXMnKVxuXHRcdGVsaWYgZiA9PSAnZCdcblx0XHRcdGZtdCgnYmx1ZUJyaWdodCcscGFydClcblx0XHRlbGlmIGYgPT0gJ3JlZCdcblx0XHRcdGZtdCgncmVkQnJpZ2h0JyxwYXJ0KVxuXHRcdGVsaWYgZiA9PSAnZ3JlZW4nXG5cdFx0XHRmbXQoJ2dyZWVuQnJpZ2h0JyxwYXJ0KVxuXHRcdGVsaWYgZiA9PSAneWVsbG93J1xuXHRcdFx0Zm10KCd5ZWxsb3dCcmlnaHQnLHBhcnQpXG5cdFx0ZWxpZiBmID09ICdyZWYnXG5cdFx0XHRmbXQoJ3llbGxvd0JyaWdodCcsJyMnICsgKHBhcnQuaWQgb3IgcGFydCkpXG5cdFx0ZWxpZiBmID09ICdlbGFwc2VkJ1xuXHRcdFx0cmVzdC51bnNoaWZ0KHBhcnQpIGlmIHBhcnQgIT0gdW5kZWZpbmVkXG5cdFx0XHRsZXQgZWxhcHNlZCA9IHBlcmZvcm1hbmNlLm5vdyEgIyBEYXRlLm5vdyEgLSAjY3RpbWVcblx0XHRcdGZtdCgneWVsbG93JyxNYXRoLnJvdW5kKGVsYXBzZWQpICsgJ21zJylcblx0XHRlbGlmIGYgPT0gJ2hlYXAnXG5cdFx0XHRyZXN0LnVuc2hpZnQocGFydCkgaWYgcGFydCAhPSB1bmRlZmluZWRcblx0XHRcdGxldCB1c2VkID0gcHJvY2Vzcy5tZW1vcnlVc2FnZSEuaGVhcFVzZWQgLyAxMDI0IC8gMTAyNFxuXHRcdFx0Zm10KCd5ZWxsb3cnLHVzZWQudG9GaXhlZCgyKSArICdtYicpXG5cdFx0ZWxzZVxuXHRcdFx0cGFydFxuXG5cdHJldHVybiBbc3RyLC4uLnJlc3RdXG5cbmxldCBTcGlubmVyID0gbnVsbFxubGV0IEluc3RhbmNlID0gbnVsbFxuXG5leHBvcnQgY2xhc3MgTG9nZ2VyXG5cblx0c3RhdGljIGdldCBtYWluXG5cdFx0SW5zdGFuY2UgfHw9IG5ldyBzZWxmXG5cblx0ZGVmIGNvbnN0cnVjdG9yIHtwcmVmaXggPSBudWxsLGxvZ2xldmVsfSA9IHt9XG5cdFx0I2N0aW1lID0gRGF0ZS5ub3chXG5cdFx0c2VsZi5wcmVmaXggPSBwcmVmaXggPyBmb3JtYXQoLi4ucHJlZml4KVswXSA6ICcnXG5cdFx0c2VsZi5sb2dsZXZlbCA9IGxvZ2xldmVsIG9yIHByb2Nlc3MuZW52LklNQkFfTE9HTEVWRUwgb3IgKGdsb2JhbC4jSU1CQV9PUFRJT05TIGFuZCBnbG9iYWwuI0lNQkFfT1BUSU9OUy5sb2dsZXZlbCkgb3IgJ2luZm8nXG5cblx0ZGVmIHdyaXRlIGtpbmQsLi4ucGFydHNcblx0XHRpZiBsb2dMZXZlbHMuaW5kZXhPZihraW5kKSA8IGxvZ0xldmVscy5pbmRleE9mKHNlbGYubG9nbGV2ZWwpXG5cdFx0XHRyZXR1cm4gc2VsZlxuXG5cdFx0bGV0IHN5bSA9IGxvZ1N5bWJvbHNba2luZF0gb3Iga2luZFxuXHRcdGxldCBbc3RyLC4uLnJlc3RdID0gZm9ybWF0KC4uLnBhcnRzKVxuXHRcdHN0ciA9IHByZWZpeCArIHN0ciBpZiBwcmVmaXhcblxuXHRcdGlmICNzcGlubmVyIGFuZCAjc3Bpbm5lci5pc1NwaW5uaW5nXG5cdFx0XHQjIGNvbnNvbGUubG9nICdzZXQgdGV4dCBvbiBzcGlubmVyISEhJ1xuXHRcdFx0aWYga2luZCA9PSAnc3VjY2Vzcydcblx0XHRcdFx0I3NwaW5uZXIuY2xlYXIhXG5cdFx0XHRcdGNvbnNvbGUubG9nKHN5bSArICcgJyArIHN0ciwuLi5yZXN0KVxuXHRcdFx0XHQjc3Bpbm5lci5mcmFtZSFcblxuXHRcdFx0I3NwaW5uZXIudGV4dCA9IHN0clxuXHRcdGVsc2Vcblx0XHRcdGNvbnNvbGUubG9nKHN5bSArICcgJyArIHN0ciwuLi5yZXN0KVxuXHRcblx0ZGVmIGRlYnVnIC4uLnBhcnMgZG8gd3JpdGUoJ2RlYnVnJywuLi5wYXJzKVxuXHRkZWYgbG9nIC4uLnBhcnMgZG8gd3JpdGUoJ2luZm8nLC4uLnBhcnMpXG5cdGRlZiBpbmZvIC4uLnBhcnMgZG8gd3JpdGUoJ2luZm8nLC4uLnBhcnMpXG5cdGRlZiB3YXJuIC4uLnBhcnMgZG8gd3JpdGUoJ3dhcm4nLC4uLnBhcnMpXG5cdGRlZiBlcnJvciAuLi5wYXJzIGRvIHdyaXRlKCdlcnJvcicsLi4ucGFycylcblx0ZGVmIHN1Y2Nlc3MgLi4ucGFycyBkbyB3cml0ZSgnc3VjY2VzcycsLi4ucGFycylcblxuXHRkZWYgdHMgLi4ucGFycyBkbyB3cml0ZSgnZGVidWcnLC4uLnBhcnMscGVyZm9ybWFuY2Uubm93ISlcblxuXHRkZWYgc3Bpbm5lclxuXHRcdHJldHVyblxuXHRcdFNwaW5uZXIgPSBvcmEoJ0xvYWRpbmcnKS5zdGFydCFcblxuXHRnZXQgI3NwaW5uZXJcblx0XHRTcGlubmVyXG5cblx0Z2V0IHByb3h5XG5cdFx0bGV0IGZuID0gZG8oLi4ucGFycykgaW5mbyguLi5wYXJzKVxuXHRcdGZuLmluZm8gPSBpbmZvLmJpbmQoc2VsZilcblx0XHRmbi53YXJuID0gd2Fybi5iaW5kKHNlbGYpXG5cdFx0Zm4uZXJyb3IgPSBlcnJvci5iaW5kKHNlbGYpXG5cdFx0Zm4uZGVidWcgPSBkZWJ1Zy5iaW5kKHNlbGYpXG5cdFx0Zm4uc3VjY2VzcyA9IHN1Y2Nlc3MuYmluZChzZWxmKVxuXHRcdGZuLnRzID0gdHMuYmluZChzZWxmKVxuXHRcdGZuLmxvZ2dlciA9IHNlbGZcblx0XHRyZXR1cm4gZm5cblxuXHRkZWYgdGltZSBsYWJlbCwgY2Jcblx0XHRsZXQgdCA9IERhdGUubm93IVxuXHRcdGlmIGNiXG5cdFx0XHRsZXQgcmVzID0gYXdhaXQgY2IoKVxuXHRcdFx0aW5mbyBcIntsYWJlbH0gJW1zXCIsRGF0ZS5ub3chIC0gdFxuXHRcdFx0cmV0dXJuIHJlc1xuXG5leHBvcnQgZGVmYXVsdCAobmV3IExvZ2dlcikucHJveHkiLCAiIyBjcmVhdGUgcHJveHlcblxuaW1wb3J0IHttYW5pZmVzdH0gZnJvbSAnLi9tYW5pZmVzdCdcblxuY2xhc3MgQXNzZXRQcm94eVxuXHRzdGF0aWMgZGVmIHdyYXAgbWV0YVxuXHRcdGxldCBoYW5kbGVyID0gbmV3IEFzc2V0UHJveHkobWV0YSlcblx0XHRuZXcgUHJveHkoaGFuZGxlcixoYW5kbGVyKVxuXG5cdGRlZiBjb25zdHJ1Y3RvciBtZXRhXG5cdFx0bWV0YSA9IG1ldGFcblxuXHRnZXQgaW5wdXRcblx0XHRtYW5pZmVzdC5pbnB1dHNbbWV0YS5pbnB1dF1cblxuXHRnZXQgYXNzZXRcblx0XHRnbG9iYWxUaGlzLl9NRl8gPyBtZXRhIDogaW5wdXQuYXNzZXRcblx0XG5cdGRlZiBzZXQgdGFyZ2V0LCBrZXksIHZhbHVlXG5cdFx0cmV0dXJuIHRydWVcblxuXHRkZWYgZ2V0IHRhcmdldCwga2V5XG5cdFx0aWYgbWV0YS5tZXRhIGFuZCBtZXRhLm1ldGFba2V5XSAhPSB1bmRlZmluZWRcblx0XHRcdHJldHVybiBtZXRhLm1ldGFba2V5XVxuXHRcdFx0XG5cdFx0aWYga2V5ID09ICdhYnNQYXRoJyBhbmQgIWFzc2V0LmFic1BhdGhcblx0XHRcdHJldHVybiBhc3NldC51cmxcdFxuXG5cdFx0YXNzZXRba2V5XVxuXG5jbGFzcyBTVkdBc3NldFxuXHRwcm9wIHVybFxuXHRwcm9wIG1ldGFcblxuXHRkZWYgYWRvcHROb2RlIG5vZGVcblx0XHRpZiBtZXRhLi5jb250ZW50XG5cdFx0XHRmb3Igb3duIGssdiBvZiBtZXRhLmF0dHJpYnV0ZXNcblx0XHRcdFx0bm9kZS5zZXRBdHRyaWJ1dGUoayx2KVxuXHRcdFx0bm9kZS5pbm5lckhUTUwgPSBtZXRhLmNvbnRlbnRcblx0XHRzZWxmXG5cdFxuXHRkZWYgdG9TdHJpbmdcblx0XHR1cmxcblx0XG5cdGRlZiB0b1N0eWxlU3RyaW5nXG5cdFx0XCJ1cmwoe3VybH0pXCJcblxuXG5leHBvcnQgZGVmIGFzc2V0IGRhdGFcblx0aWYgZGF0YS4jYXNzZXRcblx0XHRyZXR1cm4gZGF0YS4jYXNzZXRcblxuXHRpZiBkYXRhLnR5cGUgPT0gJ3N2Zydcblx0XHRyZXR1cm4gZGF0YS4jYXNzZXQgfHw9IG5ldyBTVkdBc3NldChkYXRhKVxuXHRcblx0aWYgZGF0YS5pbnB1dFxuXHRcdGxldCBleHRyYSA9IGdsb2JhbFRoaXMuX01GXyBhbmQgZ2xvYmFsVGhpcy5fTUZfW2RhdGEuaW5wdXRdXG5cdFx0aWYgZXh0cmFcblx0XHRcdE9iamVjdC5hc3NpZ24oZGF0YSxleHRyYSlcblx0XHRcdGRhdGEudG9TdHJpbmcgPSBkbyB0aGlzLmFic1BhdGhcblx0XHRcdCMgZGF0YS4jYXNzZXQgPSBkYXRhXG5cdFx0cmV0dXJuIGRhdGEuI2Fzc2V0IHx8PSBBc3NldFByb3h5LndyYXAoZGF0YSlcblx0XG5cdHJldHVybiBkYXRhIiwgImltcG9ydCBodHRwIGZyb20gJ2h0dHAnXG5pbXBvcnQgaW5kZXggZnJvbSAnX19FTlRSWVBPSU5UX18nXG5cbmNvbnN0IHNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyIGRvKHJlcSxyZXMpXG5cdGxldCBib2R5ID0gaW5kZXguYm9keVxuXHQjIHBvdGVudGlhbGx5IGluamVjdCBobXIgc2NyaXB0XG5cdGlmIHByb2Nlc3MuZW52LklNQkFfSE1SIG9yIGdsb2JhbC5JTUJBX0hNUlxuXHRcdGJvZHkgPSBcIjxzY3JpcHQgc3JjPScvX19obXJfXy5qcyc+PC9zY3JpcHQ+XCIgKyBib2R5XG5cblx0cmVzLmVuZCBib2R5XG5cbmltYmEuc2VydmUgc2VydmVyLmxpc3Rlbihwcm9jZXNzLmVudi5QT1JUIHx8IDMwMDApIiwgImltcG9ydCB7YXNzZXR9IGZyb20gJ2ltYmEnO1xuZXhwb3J0IGRlZmF1bHQgYXNzZXQoe1wiaW5wdXRcIjpcImVudHJ5OmFwcC9pbmRleC5odG1sXCJ9KSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG9CQUEyQjtBQUMzQixnQkFBZ0I7QUFDaEIsa0JBQWU7Ozs7OztBQWtIZixzQkFBZTtTQUNILElBQUksUUFBTTtBQUNoQixXQUFBLElBQUEsTUFBTSxJQUFRLElBQUEsS0FBSzs7RUFFcEIsWUFBWSxRQUFNO1NBQ3JCLFNBQVM7O01BRU4sU0FBTTtXQUNULEtBQUE7O0VBRUcsSUFBSSxHQUFHLEtBQUc7QUFDYixXQUFBLEtBQUEsT0FBTzs7RUFFSixJQUFJLEdBQUcsS0FBSyxPQUFLO0FBQ3BCLFNBQUEsT0FBTyxPQUFPO0FBQ2QsV0FBTzs7O0FBRUksSUFBQSxXQUFXLFVBQVUsSUFBSSxXQUFFO0FBQUMsU0FBQSxXQUFNOzs7O0FDcEkvQyxxQkFBb0I7QUFDcEIsaUJBQWdCO0FBQ2hCLG1CQUFlO0FBQ2YscUJBQTJCOzs7QUNKM0Isd0JBQTBCOzs7O0FBRXBCLElBQUEsVUFBTztFQUNaLE9BQU8sQ0FBQyxHQUFHO0VBQ1gsTUFBTSxDQUFDLEdBQUc7RUFDVixLQUFLLENBQUMsR0FBRztFQUNULFFBQVEsQ0FBQyxHQUFHO0VBQ1osV0FBVyxDQUFDLEdBQUc7RUFDZixTQUFTLENBQUMsR0FBRztFQUNiLFFBQVEsQ0FB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

module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 658:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.run = void 0;
const promise_fs_1 = __importDefault(__webpack_require__(244));
const path_1 = __importDefault(__webpack_require__(622));
const os_1 = __importDefault(__webpack_require__(87));
function run(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const homeEnv = process.platform === "win32" ? "USERPROFILE" : "HOME";
        const home = process.env[homeEnv];
        if (home === undefined) {
            return new Error(`${homeEnv} is not defined`);
        }
        const dir = path_1.default.resolve(home, "ssh");
        try {
            if (!promise_fs_1.default.existsSync(dir)) {
                // Create ssh directory
                yield promise_fs_1.default.mkdir(dir, { recursive: true, mode: 0o700 });
            }
            // Prepare files to store under .ssh directory
            const files = prepareFiles(event.parameters);
            // Save files.
            for (const file of files) {
                const filepath = path_1.default.join(dir, file.name);
                console.log(`Writing file ${filepath}`);
                yield promise_fs_1.default.writeFile(filepath, file.contents, file.options);
            }
        }
        catch (err) {
            throw new Error(err);
        }
    });
}
exports.run = run;
// prepareFiles build an array of files to be stored in .ssh
// directory.
const prepareFiles = (params) => ([
    params.key ? {
        name: 'default',
        contents: params.key,
        options: {
            mode: 0o400,
            flag: 'ax',
        }
    } : undefined,
    ...(params.keys ? [
        // Prepare ssh keys.
        ...params.keys.map(key => (Object.assign(Object.assign({}, key), { options: {
                mode: 0o400,
                flag: 'ax',
            } }))),
    ] : []),
    // Prepare .ssh/known_hosts
    // Known hosts can be string or array of strings.
    params.known_hosts ? {
        name: "known_hosts",
        contents: Array.isArray(params.known_hosts)
            ? params.known_hosts.join(os_1.default.EOL)
            : params.known_hosts,
        options: {
            mode: 0o644,
            flag: "a",
        },
    } : undefined,
    // Prepare .ssh/config
    params.config ? {
        name: "config",
        contents: params.config,
        options: {
            mode: 0o644,
            flag: "a",
        },
    } : undefined,
].filter(Boolean));


/***/ }),

/***/ 454:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const {isString, getType, isPlainObject, isArrayOf, map} = __webpack_require__(684)

const isArray = Array.isArray

const filter = name => !(/.+(Sync|Stream|Promise)$/.test(name))

/**
 * Promisify Node.js callback-style function
 *
 * @param {function} target – a callback-style function
 * @param {any} [ctx = null]
 *
 * @return {function} - promised function
 *
 * @example
 *
 * import fs from "fs"
 *
 * const readFile = promisify(fs.readFile)
 *
 * const onFulfilled = content => console.log(String(content))
 *
 * const onRejected = err => console.error(err)
 *
 * readFile(__filename).then(onFulfilled, onRejected)
 */
function promisify(target, ctx = null) {
  if (typeof target !== "function") {
    throw TypeError(
      `Expected target function. Received ${getType(target)}`
    )
  }

  return function(...args) {
    ctx || (ctx = this)

    return new Promise((resolve, reject) => {
      const fulfill = (err, res) => err ? reject(err) : resolve(res)

      target.call(ctx, ...args, fulfill)
    })
  }
}

/**
 * Promisify all given methods
 *
 * @param {object} targets - object with the pairs of name => target
 * @param {any} [ctx = null]
 *
 * @return {object}
 */
function all(targets, ctx) {
  if (!isPlainObject(targets)) {
    throw new TypeError(
      `Expected a plain object as targets. Received ${getType(targets)}`
    )
  }

  return map(targets, (fn, name) => filter(name) ? promisify(fn, ctx) : fn)
}

/**
 * @param {object} targets
 * @param {string[]} list
 * @param {any} [ctx = null]
 *
 * @return {object}
 */
function some(targets, list, ctx) {
  if (!isPlainObject(targets)) {
    throw new TypeError(
      `Expected a plain object as targets. Received ${getType(targets)}`
    )
  }

  if (!isArray(list)) {
    throw new TypeError(`Expected list as an array. Received ${getType(list)}`)
  }

  if (!isArrayOf(list, isString)) {
    throw new TypeError("Each element in the list should be a string.")
  }

  return map(
    targets, (fn, name) => (
      filter(name) && list.includes(name) ? promisify(fn, ctx) : fn
    )
  )
}

/**
 * @param {object} targets
 * @param {string[]} list
 * @param {any} [ctx = null]
 *
 * @return {object}
 */
function except(targets, list, ctx) {
  if (!isPlainObject(targets)) {
    throw new TypeError(
      `Expected a plain object as targets. Received ${getType(targets)}`
    )
  }

  if (!isArray(list)) {
    throw new TypeError(`Expected list as an array. Received ${getType(list)}`)
  }

  if (!isArrayOf(list, isString)) {
    throw new TypeError("Each element in the list should be a string.")
  }

  return map(
    targets, (fn, name) => (
      filter(name) && !(list.includes(name)) ? promisify(fn, ctx) : fn
    )
  )
}

module.exports = promisify
module.exports.default = promisify
module.exports.all = all
module.exports.some = some
module.exports.except = except


/***/ }),

/***/ 684:
/***/ ((module) => {

const keys = Object.keys

const toString = val => Object.prototype.toString.call(val)

const getType = val => toString(val).slice(8, -1).toLowerCase()

const isString = val => typeof val === "string" || getType(val) === "string"

// Based ob lodash/isPlainObject
function isPlainObject(val) {
  if (getType(val) !== "object") {
    return false
  }

  const pp = Object.getPrototypeOf(val)

  if (pp === null || pp === void 0) {
    return true
  }

  const Ctor = pp.constructor && pp.constructor.toString()

  return Ctor === Object.toString()
}

function isArrayOf(arr, predicate, ctx = null) {
  for (const [key, val] of arr.entries()) {
    if (predicate.call(ctx, val, key, arr) === false) {
      return false
    }
  }

  return true
}

function map(obj, fn) {
  const res = {}

  for (const key of keys(obj)) {
    const val = obj[key]

    res[key] = fn(val, key, obj)
  }

  return res
}

module.exports = {isArrayOf, getType, isString, isPlainObject, map}


/***/ }),

/***/ 244:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const fs = __webpack_require__(747)

const promisify = __webpack_require__(454)

const isFunction = value => typeof value === "function"

const names = [
  "access",
  "readFile",
  "writeFile",
  "copyFile",
  "close",
  "open",
  "read",
  "write",
  "rename",
  "rmdir",
  "mkdir",
  "readdir",
  "stat",
  "lstat",
  "fstat",
  "appendFile",
  "realpath",
  "link",
  "unlink",
  "readlink",
  "chmod",
  "fchmod",
  "chown",
  "fchown",
  "lchown",
  "fsync",
  "utimes",
  "futimes",
  "ftruncate"
]

const pfs = promisify.some(fs, names.filter(name => isFunction(fs[name])))

module.exports = pfs
module.exports.default = pfs


/***/ }),

/***/ 747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 87:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__webpack_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(658);
/******/ })()
;
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("lodash"));
	else if(typeof define === 'function' && define.amd)
		define(["lodash"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("lodash")) : factory(root["_"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_lodash__) {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/DefaultParsers.js":
/*!*******************************!*\
  !*** ./lib/DefaultParsers.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ \"lodash\");\n/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({\n  // Parse an author line (e.g. '@author Matt Carter <m@ttcarter.com>`) as {name: String, email: String}\n  author(line) {\n    var match;\n\n    if (match = /^(?<name>.+) <(?<email>)>/.exec(line)?.groups) {\n      // Name + Email\n      return match.groups;\n    } else {\n      // Assume just name\n      return line;\n    }\n  },\n\n  // Factory param handler to only accept values of an enum\n  enum(...values) {\n    return function (line) {\n      if (!values.contains(line)) throw new Error(`Invalid enum value \"${line}\" can only accept ${values.join('|')}`);\n      return line;\n    };\n  },\n\n  // Return a simple `true` boolean (e.g. '@function', '@global'\n  flag(line) {\n    return true;\n  },\n\n  // Parse `description` lines as {description: String}\n  description(line) {\n    return {\n      description: line\n    };\n  },\n\n  // Parse `name` lines as {name: String}\n  name(line) {\n    return {\n      name: line\n    };\n  },\n\n  // Parse pointers to functions (@event, @fires) as {class?: String, event: String, eventName?:String}\n  pointer(line) {\n    var parsed = /((?<class>.+?)#)?(?<event>.+)(:(?<eventname>.+?))?$/.exec(line)?.groups;\n    if (!parsed) throw new Error(`Failed to parse \"${line}\" as pointer`);\n    return parsed;\n  },\n\n  // Parse `{type}` as {type: String}\n  type(line) {\n    return {\n      type: line\n    };\n  },\n\n  // Parse `{type} description` as {type: String, description: String}\n  typeDescription(line) {\n    var parsed = /(\\{(?<type>.+?)\\})?\\s*(?<description>.*)$/.exec(line)?.groups;\n    if (!parsed) throw new Error(`Failed to parse \"${line}\" as type?+description`);\n    return parsed;\n  },\n\n  // Parse `{type} name` as {type: String, name: String}\n  typeName(line) {\n    var parsed = /(\\{(?<type>.+?)\\})?\\s*(?<name>.*)$/.exec(line)?.groups;\n    if (!parsed) throw new Error(`Failed to parse \"${line}\" as type?+name`);\n    return parsed;\n  },\n\n  // Parse @param style `{type} [name] description` as {type: String, name: String, description: String}\n  typeNameDescription(line) {\n    var parsed = /(\\{(?<type>.+?)\\})?\\s*(?<name>.+?)\\s+(?<description>.*)$/.exec(line)?.groups;\n    if (!parsed) throw new Error(`Failed to parse \"${line}\" as type+name?+description`);\n    parsed.isRequired = !/^\\[.+\\]$/.test(parsed.name); // Optional type (e.g. `[req.query.q]`)\n\n    parsed.name = lodash__WEBPACK_IMPORTED_MODULE_0___default().trim(parsed.name, '[]'); // Strip enclosing braces\n\n    return parsed;\n  },\n\n  // Parse @route style `GET /api/widgets` as {method: String, path: String}\n  rest(line) {\n    var parsed = /^(?<method>[A-Z]+)?\\s*(?<path>.+)$/.exec(line)?.groups;\n    if (!parsed) throw new Error(`Failed to parse \"${line}\" as ReST URL`);\n    parsed.method = parsed.method ? parsed.method.toLowerCase() : 'get';\n    return parsed;\n  },\n\n  // Factory function which simply assigns values into named paramers\n  split(...fields) {\n    return function (line) {\n      return lodash__WEBPACK_IMPORTED_MODULE_0___default().chain(line).split(/\\s+/).mapKeys((v, i) => fields[i]).mapValues().value();\n    };\n  },\n\n  // Parse `{value}` as {value: String}\n  value(line) {\n    return {\n      value: line\n    };\n  }\n\n});\n\n//# sourceURL=webpack://@momsfriendlydevco/docgen/./lib/DefaultParsers.js?");

/***/ }),

/***/ "lodash":
/*!*************************************************************************************!*\
  !*** external {"commonjs":"lodash","commonjs2":"lodash","amd":"lodash","root":"_"} ***!
  \*************************************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_lodash__;

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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./lib/DefaultParsers.js");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
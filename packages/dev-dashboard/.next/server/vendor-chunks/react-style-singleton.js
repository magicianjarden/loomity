"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/react-style-singleton";
exports.ids = ["vendor-chunks/react-style-singleton"];
exports.modules = {

/***/ "(ssr)/../../node_modules/react-style-singleton/dist/es2015/component.js":
/*!*************************************************************************!*\
  !*** ../../node_modules/react-style-singleton/dist/es2015/component.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   styleSingleton: () => (/* binding */ styleSingleton)\n/* harmony export */ });\n/* harmony import */ var _hook__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./hook */ \"(ssr)/../../node_modules/react-style-singleton/dist/es2015/hook.js\");\n\n/**\n * create a Component to add styles on demand\n * - styles are added when first instance is mounted\n * - styles are removed when the last instance is unmounted\n * - changing styles in runtime does nothing unless dynamic is set. But with multiple components that can lead to the undefined behavior\n */ var styleSingleton = function() {\n    var useStyle = (0,_hook__WEBPACK_IMPORTED_MODULE_0__.styleHookSingleton)();\n    var Sheet = function(_a) {\n        var styles = _a.styles, dynamic = _a.dynamic;\n        useStyle(styles, dynamic);\n        return null;\n    };\n    return Sheet;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vbm9kZV9tb2R1bGVzL3JlYWN0LXN0eWxlLXNpbmdsZXRvbi9kaXN0L2VzMjAxNS9jb21wb25lbnQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBNEM7QUFDNUM7Ozs7O0NBS0MsR0FDTSxJQUFJQyxpQkFBaUI7SUFDeEIsSUFBSUMsV0FBV0YseURBQWtCQTtJQUNqQyxJQUFJRyxRQUFRLFNBQVVDLEVBQUU7UUFDcEIsSUFBSUMsU0FBU0QsR0FBR0MsTUFBTSxFQUFFQyxVQUFVRixHQUFHRSxPQUFPO1FBQzVDSixTQUFTRyxRQUFRQztRQUNqQixPQUFPO0lBQ1g7SUFDQSxPQUFPSDtBQUNYLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AbG9vbWl0eS9kZXYtZGFzaGJvYXJkLy4uLy4uL25vZGVfbW9kdWxlcy9yZWFjdC1zdHlsZS1zaW5nbGV0b24vZGlzdC9lczIwMTUvY29tcG9uZW50LmpzPzY0NmIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc3R5bGVIb29rU2luZ2xldG9uIH0gZnJvbSAnLi9ob29rJztcbi8qKlxuICogY3JlYXRlIGEgQ29tcG9uZW50IHRvIGFkZCBzdHlsZXMgb24gZGVtYW5kXG4gKiAtIHN0eWxlcyBhcmUgYWRkZWQgd2hlbiBmaXJzdCBpbnN0YW5jZSBpcyBtb3VudGVkXG4gKiAtIHN0eWxlcyBhcmUgcmVtb3ZlZCB3aGVuIHRoZSBsYXN0IGluc3RhbmNlIGlzIHVubW91bnRlZFxuICogLSBjaGFuZ2luZyBzdHlsZXMgaW4gcnVudGltZSBkb2VzIG5vdGhpbmcgdW5sZXNzIGR5bmFtaWMgaXMgc2V0LiBCdXQgd2l0aCBtdWx0aXBsZSBjb21wb25lbnRzIHRoYXQgY2FuIGxlYWQgdG8gdGhlIHVuZGVmaW5lZCBiZWhhdmlvclxuICovXG5leHBvcnQgdmFyIHN0eWxlU2luZ2xldG9uID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB1c2VTdHlsZSA9IHN0eWxlSG9va1NpbmdsZXRvbigpO1xuICAgIHZhciBTaGVldCA9IGZ1bmN0aW9uIChfYSkge1xuICAgICAgICB2YXIgc3R5bGVzID0gX2Euc3R5bGVzLCBkeW5hbWljID0gX2EuZHluYW1pYztcbiAgICAgICAgdXNlU3R5bGUoc3R5bGVzLCBkeW5hbWljKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcbiAgICByZXR1cm4gU2hlZXQ7XG59O1xuIl0sIm5hbWVzIjpbInN0eWxlSG9va1NpbmdsZXRvbiIsInN0eWxlU2luZ2xldG9uIiwidXNlU3R5bGUiLCJTaGVldCIsIl9hIiwic3R5bGVzIiwiZHluYW1pYyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/../../node_modules/react-style-singleton/dist/es2015/component.js\n");

/***/ }),

/***/ "(ssr)/../../node_modules/react-style-singleton/dist/es2015/hook.js":
/*!********************************************************************!*\
  !*** ../../node_modules/react-style-singleton/dist/es2015/hook.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   styleHookSingleton: () => (/* binding */ styleHookSingleton)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _singleton__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./singleton */ \"(ssr)/../../node_modules/react-style-singleton/dist/es2015/singleton.js\");\n\n\n/**\n * creates a hook to control style singleton\n * @see {@link styleSingleton} for a safer component version\n * @example\n * ```tsx\n * const useStyle = styleHookSingleton();\n * ///\n * useStyle('body { overflow: hidden}');\n */ var styleHookSingleton = function() {\n    var sheet = (0,_singleton__WEBPACK_IMPORTED_MODULE_1__.stylesheetSingleton)();\n    return function(styles, isDynamic) {\n        react__WEBPACK_IMPORTED_MODULE_0__.useEffect(function() {\n            sheet.add(styles);\n            return function() {\n                sheet.remove();\n            };\n        }, [\n            styles && isDynamic\n        ]);\n    };\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vbm9kZV9tb2R1bGVzL3JlYWN0LXN0eWxlLXNpbmdsZXRvbi9kaXN0L2VzMjAxNS9ob29rLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBK0I7QUFDbUI7QUFDbEQ7Ozs7Ozs7O0NBUUMsR0FDTSxJQUFJRSxxQkFBcUI7SUFDNUIsSUFBSUMsUUFBUUYsK0RBQW1CQTtJQUMvQixPQUFPLFNBQVVHLE1BQU0sRUFBRUMsU0FBUztRQUM5QkwsNENBQWUsQ0FBQztZQUNaRyxNQUFNSSxHQUFHLENBQUNIO1lBQ1YsT0FBTztnQkFDSEQsTUFBTUssTUFBTTtZQUNoQjtRQUNKLEdBQUc7WUFBQ0osVUFBVUM7U0FBVTtJQUM1QjtBQUNKLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AbG9vbWl0eS9kZXYtZGFzaGJvYXJkLy4uLy4uL25vZGVfbW9kdWxlcy9yZWFjdC1zdHlsZS1zaW5nbGV0b24vZGlzdC9lczIwMTUvaG9vay5qcz8zZjk1Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHN0eWxlc2hlZXRTaW5nbGV0b24gfSBmcm9tICcuL3NpbmdsZXRvbic7XG4vKipcbiAqIGNyZWF0ZXMgYSBob29rIHRvIGNvbnRyb2wgc3R5bGUgc2luZ2xldG9uXG4gKiBAc2VlIHtAbGluayBzdHlsZVNpbmdsZXRvbn0gZm9yIGEgc2FmZXIgY29tcG9uZW50IHZlcnNpb25cbiAqIEBleGFtcGxlXG4gKiBgYGB0c3hcbiAqIGNvbnN0IHVzZVN0eWxlID0gc3R5bGVIb29rU2luZ2xldG9uKCk7XG4gKiAvLy9cbiAqIHVzZVN0eWxlKCdib2R5IHsgb3ZlcmZsb3c6IGhpZGRlbn0nKTtcbiAqL1xuZXhwb3J0IHZhciBzdHlsZUhvb2tTaW5nbGV0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNoZWV0ID0gc3R5bGVzaGVldFNpbmdsZXRvbigpO1xuICAgIHJldHVybiBmdW5jdGlvbiAoc3R5bGVzLCBpc0R5bmFtaWMpIHtcbiAgICAgICAgUmVhY3QudXNlRWZmZWN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNoZWV0LmFkZChzdHlsZXMpO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzaGVldC5yZW1vdmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sIFtzdHlsZXMgJiYgaXNEeW5hbWljXSk7XG4gICAgfTtcbn07XG4iXSwibmFtZXMiOlsiUmVhY3QiLCJzdHlsZXNoZWV0U2luZ2xldG9uIiwic3R5bGVIb29rU2luZ2xldG9uIiwic2hlZXQiLCJzdHlsZXMiLCJpc0R5bmFtaWMiLCJ1c2VFZmZlY3QiLCJhZGQiLCJyZW1vdmUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/../../node_modules/react-style-singleton/dist/es2015/hook.js\n");

/***/ }),

/***/ "(ssr)/../../node_modules/react-style-singleton/dist/es2015/index.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/react-style-singleton/dist/es2015/index.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   styleHookSingleton: () => (/* reexport safe */ _hook__WEBPACK_IMPORTED_MODULE_2__.styleHookSingleton),\n/* harmony export */   styleSingleton: () => (/* reexport safe */ _component__WEBPACK_IMPORTED_MODULE_0__.styleSingleton),\n/* harmony export */   stylesheetSingleton: () => (/* reexport safe */ _singleton__WEBPACK_IMPORTED_MODULE_1__.stylesheetSingleton)\n/* harmony export */ });\n/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./component */ \"(ssr)/../../node_modules/react-style-singleton/dist/es2015/component.js\");\n/* harmony import */ var _singleton__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./singleton */ \"(ssr)/../../node_modules/react-style-singleton/dist/es2015/singleton.js\");\n/* harmony import */ var _hook__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./hook */ \"(ssr)/../../node_modules/react-style-singleton/dist/es2015/hook.js\");\n\n\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vbm9kZV9tb2R1bGVzL3JlYWN0LXN0eWxlLXNpbmdsZXRvbi9kaXN0L2VzMjAxNS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBNkM7QUFDSztBQUNOIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGxvb21pdHkvZGV2LWRhc2hib2FyZC8uLi8uLi9ub2RlX21vZHVsZXMvcmVhY3Qtc3R5bGUtc2luZ2xldG9uL2Rpc3QvZXMyMDE1L2luZGV4LmpzPzRjYTEiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHsgc3R5bGVTaW5nbGV0b24gfSBmcm9tICcuL2NvbXBvbmVudCc7XG5leHBvcnQgeyBzdHlsZXNoZWV0U2luZ2xldG9uIH0gZnJvbSAnLi9zaW5nbGV0b24nO1xuZXhwb3J0IHsgc3R5bGVIb29rU2luZ2xldG9uIH0gZnJvbSAnLi9ob29rJztcbiJdLCJuYW1lcyI6WyJzdHlsZVNpbmdsZXRvbiIsInN0eWxlc2hlZXRTaW5nbGV0b24iLCJzdHlsZUhvb2tTaW5nbGV0b24iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/../../node_modules/react-style-singleton/dist/es2015/index.js\n");

/***/ }),

/***/ "(ssr)/../../node_modules/react-style-singleton/dist/es2015/singleton.js":
/*!*************************************************************************!*\
  !*** ../../node_modules/react-style-singleton/dist/es2015/singleton.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   stylesheetSingleton: () => (/* binding */ stylesheetSingleton)\n/* harmony export */ });\n/* harmony import */ var get_nonce__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! get-nonce */ \"(ssr)/../../node_modules/get-nonce/dist/es2015/index.js\");\n\nfunction makeStyleTag() {\n    if (!document) return null;\n    var tag = document.createElement(\"style\");\n    tag.type = \"text/css\";\n    var nonce = (0,get_nonce__WEBPACK_IMPORTED_MODULE_0__.getNonce)();\n    if (nonce) {\n        tag.setAttribute(\"nonce\", nonce);\n    }\n    return tag;\n}\nfunction injectStyles(tag, css) {\n    // @ts-ignore\n    if (tag.styleSheet) {\n        // @ts-ignore\n        tag.styleSheet.cssText = css;\n    } else {\n        tag.appendChild(document.createTextNode(css));\n    }\n}\nfunction insertStyleTag(tag) {\n    var head = document.head || document.getElementsByTagName(\"head\")[0];\n    head.appendChild(tag);\n}\nvar stylesheetSingleton = function() {\n    var counter = 0;\n    var stylesheet = null;\n    return {\n        add: function(style) {\n            if (counter == 0) {\n                if (stylesheet = makeStyleTag()) {\n                    injectStyles(stylesheet, style);\n                    insertStyleTag(stylesheet);\n                }\n            }\n            counter++;\n        },\n        remove: function() {\n            counter--;\n            if (!counter && stylesheet) {\n                stylesheet.parentNode && stylesheet.parentNode.removeChild(stylesheet);\n                stylesheet = null;\n            }\n        }\n    };\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vbm9kZV9tb2R1bGVzL3JlYWN0LXN0eWxlLXNpbmdsZXRvbi9kaXN0L2VzMjAxNS9zaW5nbGV0b24uanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBcUM7QUFDckMsU0FBU0M7SUFDTCxJQUFJLENBQUNDLFVBQ0QsT0FBTztJQUNYLElBQUlDLE1BQU1ELFNBQVNFLGFBQWEsQ0FBQztJQUNqQ0QsSUFBSUUsSUFBSSxHQUFHO0lBQ1gsSUFBSUMsUUFBUU4sbURBQVFBO0lBQ3BCLElBQUlNLE9BQU87UUFDUEgsSUFBSUksWUFBWSxDQUFDLFNBQVNEO0lBQzlCO0lBQ0EsT0FBT0g7QUFDWDtBQUNBLFNBQVNLLGFBQWFMLEdBQUcsRUFBRU0sR0FBRztJQUMxQixhQUFhO0lBQ2IsSUFBSU4sSUFBSU8sVUFBVSxFQUFFO1FBQ2hCLGFBQWE7UUFDYlAsSUFBSU8sVUFBVSxDQUFDQyxPQUFPLEdBQUdGO0lBQzdCLE9BQ0s7UUFDRE4sSUFBSVMsV0FBVyxDQUFDVixTQUFTVyxjQUFjLENBQUNKO0lBQzVDO0FBQ0o7QUFDQSxTQUFTSyxlQUFlWCxHQUFHO0lBQ3ZCLElBQUlZLE9BQU9iLFNBQVNhLElBQUksSUFBSWIsU0FBU2Msb0JBQW9CLENBQUMsT0FBTyxDQUFDLEVBQUU7SUFDcEVELEtBQUtILFdBQVcsQ0FBQ1Q7QUFDckI7QUFDTyxJQUFJYyxzQkFBc0I7SUFDN0IsSUFBSUMsVUFBVTtJQUNkLElBQUlDLGFBQWE7SUFDakIsT0FBTztRQUNIQyxLQUFLLFNBQVVDLEtBQUs7WUFDaEIsSUFBSUgsV0FBVyxHQUFHO2dCQUNkLElBQUtDLGFBQWFsQixnQkFBaUI7b0JBQy9CTyxhQUFhVyxZQUFZRTtvQkFDekJQLGVBQWVLO2dCQUNuQjtZQUNKO1lBQ0FEO1FBQ0o7UUFDQUksUUFBUTtZQUNKSjtZQUNBLElBQUksQ0FBQ0EsV0FBV0MsWUFBWTtnQkFDeEJBLFdBQVdJLFVBQVUsSUFBSUosV0FBV0ksVUFBVSxDQUFDQyxXQUFXLENBQUNMO2dCQUMzREEsYUFBYTtZQUNqQjtRQUNKO0lBQ0o7QUFDSixFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGxvb21pdHkvZGV2LWRhc2hib2FyZC8uLi8uLi9ub2RlX21vZHVsZXMvcmVhY3Qtc3R5bGUtc2luZ2xldG9uL2Rpc3QvZXMyMDE1L3NpbmdsZXRvbi5qcz8zODczIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldE5vbmNlIH0gZnJvbSAnZ2V0LW5vbmNlJztcbmZ1bmN0aW9uIG1ha2VTdHlsZVRhZygpIHtcbiAgICBpZiAoIWRvY3VtZW50KVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB2YXIgdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICB0YWcudHlwZSA9ICd0ZXh0L2Nzcyc7XG4gICAgdmFyIG5vbmNlID0gZ2V0Tm9uY2UoKTtcbiAgICBpZiAobm9uY2UpIHtcbiAgICAgICAgdGFnLnNldEF0dHJpYnV0ZSgnbm9uY2UnLCBub25jZSk7XG4gICAgfVxuICAgIHJldHVybiB0YWc7XG59XG5mdW5jdGlvbiBpbmplY3RTdHlsZXModGFnLCBjc3MpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgaWYgKHRhZy5zdHlsZVNoZWV0KSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGFnLnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRhZy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgICB9XG59XG5mdW5jdGlvbiBpbnNlcnRTdHlsZVRhZyh0YWcpIHtcbiAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgICBoZWFkLmFwcGVuZENoaWxkKHRhZyk7XG59XG5leHBvcnQgdmFyIHN0eWxlc2hlZXRTaW5nbGV0b24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvdW50ZXIgPSAwO1xuICAgIHZhciBzdHlsZXNoZWV0ID0gbnVsbDtcbiAgICByZXR1cm4ge1xuICAgICAgICBhZGQ6IGZ1bmN0aW9uIChzdHlsZSkge1xuICAgICAgICAgICAgaWYgKGNvdW50ZXIgPT0gMCkge1xuICAgICAgICAgICAgICAgIGlmICgoc3R5bGVzaGVldCA9IG1ha2VTdHlsZVRhZygpKSkge1xuICAgICAgICAgICAgICAgICAgICBpbmplY3RTdHlsZXMoc3R5bGVzaGVldCwgc3R5bGUpO1xuICAgICAgICAgICAgICAgICAgICBpbnNlcnRTdHlsZVRhZyhzdHlsZXNoZWV0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb3VudGVyKys7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY291bnRlci0tO1xuICAgICAgICAgICAgaWYgKCFjb3VudGVyICYmIHN0eWxlc2hlZXQpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXNoZWV0LnBhcmVudE5vZGUgJiYgc3R5bGVzaGVldC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlc2hlZXQpO1xuICAgICAgICAgICAgICAgIHN0eWxlc2hlZXQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH07XG59O1xuIl0sIm5hbWVzIjpbImdldE5vbmNlIiwibWFrZVN0eWxlVGFnIiwiZG9jdW1lbnQiLCJ0YWciLCJjcmVhdGVFbGVtZW50IiwidHlwZSIsIm5vbmNlIiwic2V0QXR0cmlidXRlIiwiaW5qZWN0U3R5bGVzIiwiY3NzIiwic3R5bGVTaGVldCIsImNzc1RleHQiLCJhcHBlbmRDaGlsZCIsImNyZWF0ZVRleHROb2RlIiwiaW5zZXJ0U3R5bGVUYWciLCJoZWFkIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJzdHlsZXNoZWV0U2luZ2xldG9uIiwiY291bnRlciIsInN0eWxlc2hlZXQiLCJhZGQiLCJzdHlsZSIsInJlbW92ZSIsInBhcmVudE5vZGUiLCJyZW1vdmVDaGlsZCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/../../node_modules/react-style-singleton/dist/es2015/singleton.js\n");

/***/ })

};
;
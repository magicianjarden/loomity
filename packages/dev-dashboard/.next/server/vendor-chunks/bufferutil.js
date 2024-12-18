"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/bufferutil";
exports.ids = ["vendor-chunks/bufferutil"];
exports.modules = {

/***/ "(ssr)/../../node_modules/bufferutil/fallback.js":
/*!*************************************************!*\
  !*** ../../node_modules/bufferutil/fallback.js ***!
  \*************************************************/
/***/ ((module) => {

eval("\n/**\n * Masks a buffer using the given mask.\n *\n * @param {Buffer} source The buffer to mask\n * @param {Buffer} mask The mask to use\n * @param {Buffer} output The buffer where to store the result\n * @param {Number} offset The offset at which to start writing\n * @param {Number} length The number of bytes to mask.\n * @public\n */ const mask = (source, mask, output, offset, length)=>{\n    for(var i = 0; i < length; i++){\n        output[offset + i] = source[i] ^ mask[i & 3];\n    }\n};\n/**\n * Unmasks a buffer using the given mask.\n *\n * @param {Buffer} buffer The buffer to unmask\n * @param {Buffer} mask The mask to use\n * @public\n */ const unmask = (buffer, mask)=>{\n    // Required until https://github.com/nodejs/node/issues/9006 is resolved.\n    const length = buffer.length;\n    for(var i = 0; i < length; i++){\n        buffer[i] ^= mask[i & 3];\n    }\n};\nmodule.exports = {\n    mask,\n    unmask\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vbm9kZV9tb2R1bGVzL2J1ZmZlcnV0aWwvZmFsbGJhY2suanMiLCJtYXBwaW5ncyI6IkFBQUE7QUFFQTs7Ozs7Ozs7O0NBU0MsR0FDRCxNQUFNQSxPQUFPLENBQUNDLFFBQVFELE1BQU1FLFFBQVFDLFFBQVFDO0lBQzFDLElBQUssSUFBSUMsSUFBSSxHQUFHQSxJQUFJRCxRQUFRQyxJQUFLO1FBQy9CSCxNQUFNLENBQUNDLFNBQVNFLEVBQUUsR0FBR0osTUFBTSxDQUFDSSxFQUFFLEdBQUdMLElBQUksQ0FBQ0ssSUFBSSxFQUFFO0lBQzlDO0FBQ0Y7QUFFQTs7Ozs7O0NBTUMsR0FDRCxNQUFNQyxTQUFTLENBQUNDLFFBQVFQO0lBQ3RCLHlFQUF5RTtJQUN6RSxNQUFNSSxTQUFTRyxPQUFPSCxNQUFNO0lBQzVCLElBQUssSUFBSUMsSUFBSSxHQUFHQSxJQUFJRCxRQUFRQyxJQUFLO1FBQy9CRSxNQUFNLENBQUNGLEVBQUUsSUFBSUwsSUFBSSxDQUFDSyxJQUFJLEVBQUU7SUFDMUI7QUFDRjtBQUVBRyxPQUFPQyxPQUFPLEdBQUc7SUFBRVQ7SUFBTU07QUFBTyIsInNvdXJjZXMiOlsid2VicGFjazovL0Bsb29taXR5L2Rldi1kYXNoYm9hcmQvLi4vLi4vbm9kZV9tb2R1bGVzL2J1ZmZlcnV0aWwvZmFsbGJhY2suanM/NmM4NiJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWFza3MgYSBidWZmZXIgdXNpbmcgdGhlIGdpdmVuIG1hc2suXG4gKlxuICogQHBhcmFtIHtCdWZmZXJ9IHNvdXJjZSBUaGUgYnVmZmVyIHRvIG1hc2tcbiAqIEBwYXJhbSB7QnVmZmVyfSBtYXNrIFRoZSBtYXNrIHRvIHVzZVxuICogQHBhcmFtIHtCdWZmZXJ9IG91dHB1dCBUaGUgYnVmZmVyIHdoZXJlIHRvIHN0b3JlIHRoZSByZXN1bHRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgVGhlIG9mZnNldCBhdCB3aGljaCB0byBzdGFydCB3cml0aW5nXG4gKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIFRoZSBudW1iZXIgb2YgYnl0ZXMgdG8gbWFzay5cbiAqIEBwdWJsaWNcbiAqL1xuY29uc3QgbWFzayA9IChzb3VyY2UsIG1hc2ssIG91dHB1dCwgb2Zmc2V0LCBsZW5ndGgpID0+IHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFtvZmZzZXQgKyBpXSA9IHNvdXJjZVtpXSBeIG1hc2tbaSAmIDNdO1xuICB9XG59O1xuXG4vKipcbiAqIFVubWFza3MgYSBidWZmZXIgdXNpbmcgdGhlIGdpdmVuIG1hc2suXG4gKlxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciBUaGUgYnVmZmVyIHRvIHVubWFza1xuICogQHBhcmFtIHtCdWZmZXJ9IG1hc2sgVGhlIG1hc2sgdG8gdXNlXG4gKiBAcHVibGljXG4gKi9cbmNvbnN0IHVubWFzayA9IChidWZmZXIsIG1hc2spID0+IHtcbiAgLy8gUmVxdWlyZWQgdW50aWwgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2lzc3Vlcy85MDA2IGlzIHJlc29sdmVkLlxuICBjb25zdCBsZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgYnVmZmVyW2ldIF49IG1hc2tbaSAmIDNdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgbWFzaywgdW5tYXNrIH07XG4iXSwibmFtZXMiOlsibWFzayIsInNvdXJjZSIsIm91dHB1dCIsIm9mZnNldCIsImxlbmd0aCIsImkiLCJ1bm1hc2siLCJidWZmZXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/../../node_modules/bufferutil/fallback.js\n");

/***/ }),

/***/ "(ssr)/../../node_modules/bufferutil/index.js":
/*!**********************************************!*\
  !*** ../../node_modules/bufferutil/index.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\ntry {\n    module.exports = __webpack_require__(/*! node-gyp-build */ \"(ssr)/../../node_modules/node-gyp-build/index.js\")(__dirname);\n} catch (e) {\n    module.exports = __webpack_require__(/*! ./fallback */ \"(ssr)/../../node_modules/bufferutil/fallback.js\");\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vLi4vbm9kZV9tb2R1bGVzL2J1ZmZlcnV0aWwvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQUE7QUFFQSxJQUFJO0lBQ0ZBLE9BQU9DLE9BQU8sR0FBR0MsbUJBQU9BLENBQUMsMEVBQWtCQztBQUM3QyxFQUFFLE9BQU9DLEdBQUc7SUFDVkoseUdBQXlCO0FBQzNCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGxvb21pdHkvZGV2LWRhc2hib2FyZC8uLi8uLi9ub2RlX21vZHVsZXMvYnVmZmVydXRpbC9pbmRleC5qcz8yZDc0Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudHJ5IHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdub2RlLWd5cC1idWlsZCcpKF9fZGlybmFtZSk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9mYWxsYmFjaycpO1xufVxuIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJyZXF1aXJlIiwiX19kaXJuYW1lIiwiZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/../../node_modules/bufferutil/index.js\n");

/***/ }),

/***/ "(rsc)/../../node_modules/bufferutil/fallback.js":
/*!*************************************************!*\
  !*** ../../node_modules/bufferutil/fallback.js ***!
  \*************************************************/
/***/ ((module) => {

eval("\n/**\n * Masks a buffer using the given mask.\n *\n * @param {Buffer} source The buffer to mask\n * @param {Buffer} mask The mask to use\n * @param {Buffer} output The buffer where to store the result\n * @param {Number} offset The offset at which to start writing\n * @param {Number} length The number of bytes to mask.\n * @public\n */ const mask = (source, mask, output, offset, length)=>{\n    for(var i = 0; i < length; i++){\n        output[offset + i] = source[i] ^ mask[i & 3];\n    }\n};\n/**\n * Unmasks a buffer using the given mask.\n *\n * @param {Buffer} buffer The buffer to unmask\n * @param {Buffer} mask The mask to use\n * @public\n */ const unmask = (buffer, mask)=>{\n    // Required until https://github.com/nodejs/node/issues/9006 is resolved.\n    const length = buffer.length;\n    for(var i = 0; i < length; i++){\n        buffer[i] ^= mask[i & 3];\n    }\n};\nmodule.exports = {\n    mask,\n    unmask\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi4vLi4vbm9kZV9tb2R1bGVzL2J1ZmZlcnV0aWwvZmFsbGJhY2suanMiLCJtYXBwaW5ncyI6IkFBQUE7QUFFQTs7Ozs7Ozs7O0NBU0MsR0FDRCxNQUFNQSxPQUFPLENBQUNDLFFBQVFELE1BQU1FLFFBQVFDLFFBQVFDO0lBQzFDLElBQUssSUFBSUMsSUFBSSxHQUFHQSxJQUFJRCxRQUFRQyxJQUFLO1FBQy9CSCxNQUFNLENBQUNDLFNBQVNFLEVBQUUsR0FBR0osTUFBTSxDQUFDSSxFQUFFLEdBQUdMLElBQUksQ0FBQ0ssSUFBSSxFQUFFO0lBQzlDO0FBQ0Y7QUFFQTs7Ozs7O0NBTUMsR0FDRCxNQUFNQyxTQUFTLENBQUNDLFFBQVFQO0lBQ3RCLHlFQUF5RTtJQUN6RSxNQUFNSSxTQUFTRyxPQUFPSCxNQUFNO0lBQzVCLElBQUssSUFBSUMsSUFBSSxHQUFHQSxJQUFJRCxRQUFRQyxJQUFLO1FBQy9CRSxNQUFNLENBQUNGLEVBQUUsSUFBSUwsSUFBSSxDQUFDSyxJQUFJLEVBQUU7SUFDMUI7QUFDRjtBQUVBRyxPQUFPQyxPQUFPLEdBQUc7SUFBRVQ7SUFBTU07QUFBTyIsInNvdXJjZXMiOlsid2VicGFjazovL0Bsb29taXR5L2Rldi1kYXNoYm9hcmQvLi4vLi4vbm9kZV9tb2R1bGVzL2J1ZmZlcnV0aWwvZmFsbGJhY2suanM/NmM4NiJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWFza3MgYSBidWZmZXIgdXNpbmcgdGhlIGdpdmVuIG1hc2suXG4gKlxuICogQHBhcmFtIHtCdWZmZXJ9IHNvdXJjZSBUaGUgYnVmZmVyIHRvIG1hc2tcbiAqIEBwYXJhbSB7QnVmZmVyfSBtYXNrIFRoZSBtYXNrIHRvIHVzZVxuICogQHBhcmFtIHtCdWZmZXJ9IG91dHB1dCBUaGUgYnVmZmVyIHdoZXJlIHRvIHN0b3JlIHRoZSByZXN1bHRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgVGhlIG9mZnNldCBhdCB3aGljaCB0byBzdGFydCB3cml0aW5nXG4gKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIFRoZSBudW1iZXIgb2YgYnl0ZXMgdG8gbWFzay5cbiAqIEBwdWJsaWNcbiAqL1xuY29uc3QgbWFzayA9IChzb3VyY2UsIG1hc2ssIG91dHB1dCwgb2Zmc2V0LCBsZW5ndGgpID0+IHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFtvZmZzZXQgKyBpXSA9IHNvdXJjZVtpXSBeIG1hc2tbaSAmIDNdO1xuICB9XG59O1xuXG4vKipcbiAqIFVubWFza3MgYSBidWZmZXIgdXNpbmcgdGhlIGdpdmVuIG1hc2suXG4gKlxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciBUaGUgYnVmZmVyIHRvIHVubWFza1xuICogQHBhcmFtIHtCdWZmZXJ9IG1hc2sgVGhlIG1hc2sgdG8gdXNlXG4gKiBAcHVibGljXG4gKi9cbmNvbnN0IHVubWFzayA9IChidWZmZXIsIG1hc2spID0+IHtcbiAgLy8gUmVxdWlyZWQgdW50aWwgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2lzc3Vlcy85MDA2IGlzIHJlc29sdmVkLlxuICBjb25zdCBsZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgYnVmZmVyW2ldIF49IG1hc2tbaSAmIDNdO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgbWFzaywgdW5tYXNrIH07XG4iXSwibmFtZXMiOlsibWFzayIsInNvdXJjZSIsIm91dHB1dCIsIm9mZnNldCIsImxlbmd0aCIsImkiLCJ1bm1hc2siLCJidWZmZXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/../../node_modules/bufferutil/fallback.js\n");

/***/ }),

/***/ "(rsc)/../../node_modules/bufferutil/index.js":
/*!**********************************************!*\
  !*** ../../node_modules/bufferutil/index.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\ntry {\n    module.exports = __webpack_require__(/*! node-gyp-build */ \"(rsc)/../../node_modules/node-gyp-build/index.js\")(__dirname);\n} catch (e) {\n    module.exports = __webpack_require__(/*! ./fallback */ \"(rsc)/../../node_modules/bufferutil/fallback.js\");\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi4vLi4vbm9kZV9tb2R1bGVzL2J1ZmZlcnV0aWwvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQUE7QUFFQSxJQUFJO0lBQ0ZBLE9BQU9DLE9BQU8sR0FBR0MsbUJBQU9BLENBQUMsMEVBQWtCQztBQUM3QyxFQUFFLE9BQU9DLEdBQUc7SUFDVkoseUdBQXlCO0FBQzNCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGxvb21pdHkvZGV2LWRhc2hib2FyZC8uLi8uLi9ub2RlX21vZHVsZXMvYnVmZmVydXRpbC9pbmRleC5qcz8yZDc0Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudHJ5IHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdub2RlLWd5cC1idWlsZCcpKF9fZGlybmFtZSk7XG59IGNhdGNoIChlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9mYWxsYmFjaycpO1xufVxuIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJyZXF1aXJlIiwiX19kaXJuYW1lIiwiZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/../../node_modules/bufferutil/index.js\n");

/***/ })

};
;
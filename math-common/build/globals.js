"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultFontSize = exports.heartBeatInterval = exports.activeCellColor = exports.signList = exports.matrixDimensions = void 0;
//export const messagingHost = "/msg";  // see proxy configuration in vite.config.ts
//export const apiHost = "/api";
exports.matrixDimensions = {
    rowsNum: 24,
    colsNum: 44,
};
exports.signList = ["=", "+", "-", "*", "/", "\\", "(", ")", "[", "]"];
exports.activeCellColor = "lightcyan";
exports.heartBeatInterval = 5000;
function getDefaultFontSize() {
    var style = window.getComputedStyle(document.body);
    var fs = style.getPropertyValue('font-size');
    let regex = fs.match(/\d+/);
    return Number(regex?.[0]);
}
exports.getDefaultFontSize = getDefaultFontSize;
;
//# sourceMappingURL=globals.js.map
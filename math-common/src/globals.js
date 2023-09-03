export const messagingHost = "http://localhost:3030";
export const apiHost = "http://localhost:8080";
export const matrixDimensions = {
    rowsNum: 24,
    colsNum: 44,
};
export const signList = ["=", "+", "-", "*", "/", "\\", "(", ")", "[", "]"];
export const activeCellColor = "lightcyan";
export const heartBeatInterval = 5000;
export function getDefaultFontSize() {
    var style = window.getComputedStyle(document.body);
    var fs = style.getPropertyValue('font-size');
    let regex = fs.match(/\d+/);
    return Number(regex?.[0]);
}
;
//# sourceMappingURL=globals.js.map
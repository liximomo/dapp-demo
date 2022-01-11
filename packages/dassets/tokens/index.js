"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToken = void 0;
var config_1 = require("../config");
var DEFAULT_DECIMALS = 18;
var TokenInfo = {};
function getToken(id, options) {
    if (options === void 0) { options = {}; }
    if (TokenInfo[id]) {
        return TokenInfo[id];
    }
    var tokens = config_1.getConfig("tokens", options.config);
    var config = tokens[id];
    if (!config) {
        throw new Error("Token not Found. (" + id + ")");
    }
    var token = (TokenInfo[id] = __assign(__assign({}, config), { symbol: config.symbol || config.name, decimals: config.decimals || DEFAULT_DECIMALS }));
    return token;
}
exports.getToken = getToken;

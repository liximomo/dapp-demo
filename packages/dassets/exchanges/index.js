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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlip = exports.getExchange = void 0;
var config_1 = require("../config");
var DEFAULT_DECIMALS = 18;
var FlipInfo = {};
function getExchange(exchange, options) {
    if (options === void 0) { options = {}; }
    var exchangeConfig = config_1.getConfig(exchange, options.config);
    if (!exchangeConfig) {
        throw new Error("Exchange not Found. (" + exchange + ")");
    }
    return exchangeConfig;
}
exports.getExchange = getExchange;
var FLIP_NAME_REGEX = /^([0-9a-zA-Z]+)[-_]([0-9a-zA-Z]+)/;
function getFlip(exchange, id, options) {
    if (options === void 0) { options = {}; }
    var match = id.match(FLIP_NAME_REGEX);
    if (!match) {
        throw new Error("id is invalid. (" + id + ")");
    }
    var suffix = id.replace(match[0], "");
    var _a = __read(match[0].split("-"), 2), token0 = _a[0], token1 = _a[1];
    id = token0 + "-" + token1 + suffix;
    var reversedId = token1 + "-" + token0 + suffix;
    var key = exchange + "@" + [token0, token1].sort().join("_");
    if (FlipInfo[key]) {
        return FlipInfo[key];
    }
    var exchangeConfig = config_1.getConfig(exchange, options.config);
    if (!exchangeConfig) {
        throw new Error("Exchange not Found. (" + exchange + ")");
    }
    var flipConfig = exchangeConfig.LpTokens.find(function (lp) { return lp.name === id || lp.name === reversedId; });
    if (!flipConfig) {
        throw new Error("Flip not Found. (" + id + ")");
    }
    var flip = (FlipInfo[key] = __assign(__assign({}, flipConfig), { symbol: flipConfig.symbol || flipConfig.name, decimals: DEFAULT_DECIMALS }));
    return flip;
}
exports.getFlip = getFlip;

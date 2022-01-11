"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.setConfig = void 0;
var _config;
function getByPaths(obj, path) {
    var segments = path.split(".");
    if (segments.length <= 0) {
        return obj;
    }
    var cur = obj[segments[0]];
    for (var i = 1; i < segments.length && cur; i++) {
        cur = cur[segments[i]];
    }
    return cur;
}
function setConfig(config) {
    _config = config;
}
exports.setConfig = setConfig;
function getConfig(path, config) {
    if (!_config) {
        throw new Error('Please call "setConfig" first');
    }
    if (!path) {
        return _config;
    }
    var value = getByPaths(config || _config, path);
    if (value === undefined) {
        throw new Error("Config not Found. (" + path + ")");
    }
    return value;
}
exports.getConfig = getConfig;

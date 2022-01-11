"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAbi = exports.resolveAbi = exports.registerAbi = void 0;
var abis = new Map();
function registerAbi(id, abi) {
    if (abis.has(id)) {
        console.warn("ABI \"" + id + "\" existed");
        return;
    }
    abis.set(id, abi);
}
exports.registerAbi = registerAbi;
function resolveAbi(id) {
    return abis.get(id);
}
exports.resolveAbi = resolveAbi;
function getAbi(id) {
    var abi = resolveAbi(id);
    if (!abi) {
        throw new Error("ABI Not Found. (" + id + ")");
    }
    return abi;
}
exports.getAbi = getAbi;

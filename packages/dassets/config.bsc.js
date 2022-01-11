"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_2 = require("./config");
var config_bsc_1 = __importDefault(require("./tokens/config.bsc"));
var config_bsc_2 = __importDefault(require("./apps/pancakeswap/config.bsc"));
var config = {
    "tokens": config_bsc_1.default,
    "pancakeswap": config_bsc_2.default,
};
config_2.setConfig(config);
exports.default = config;

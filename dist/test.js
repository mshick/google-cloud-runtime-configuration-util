#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const concat_stream_1 = __importDefault(require("concat-stream"));
function parse(buf) {
    const str = buf.toString();
    console.log(str);
}
process.stdin.pipe(concat_stream_1.default(parse));
//# sourceMappingURL=test.js.map
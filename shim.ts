// shim for loading in NodeJS deps
import * as buffer from "buffer/";
import * as crypto from "crypto-browserify";
// import * as browserProcess from "process/browser"
import * as stream from "stream-browserify";
import * as path from "path-browserify";
// @ts-ignore
globalThis.Buffer ??= buffer.default.Buffer;
// @ts-ignore
globalThis.Crypto ??= crypto;
// @ts-ignore
globalThis.process ??= { env: {} };
globalThis.stream ??= stream;
globalThis.path ??= path;

export * from "./index";

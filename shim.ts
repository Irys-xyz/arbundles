/* eslint-disable @typescript-eslint/ban-ts-comment */
// shim for loading in NodeJS deps
import * as buffer from "buffer/";
import * as crypto from "crypto-browserify";
// import * as browserProcess from "process/browser"
// import * as stream from "stream-browserify";
import stream from "stream";
// import * as path from "path-browserify";
import * as process from "process/browser";
// @ts-ignore
globalThis.Buffer ??= buffer.default.Buffer;
// @ts-ignore
// globalThis.crypto.createHash ? undefined : (globalThis.crypto = { ...crypto });
globalThis.Crypto = { ...globalThis.Crypto, ...crypto };
// @ts-ignore
globalThis.process ??= process;
globalThis.stream ??= stream;
// globalThis.path ??= path;

import * as arbundles from "./index";
globalThis.arbundles ??= arbundles;
export * from "./index";

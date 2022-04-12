/* eslint-disable @typescript-eslint/ban-ts-comment */
// shim for loading in NodeJS deps
import * as buffer from "buffer/";
import * as crypto from "crypto-browserify";
import stream from "stream";
import * as arbundles from "./index";

// @ts-ignore
globalThis.Buffer ??= buffer.default.Buffer;
// @ts-ignore
// globalThis.crypto.createHash ? undefined : (globalThis.crypto = { ...crypto });
globalThis.Crypto = { ...globalThis.Crypto, ...crypto };
// @ts-ignore
globalThis.process ??= { env: {} };
globalThis.stream ??= stream;
globalThis.arbundles ??= arbundles;

// /* eslint-disable @typescript-eslint/ban-ts-comment */
// // shim for loading in NodeJS deps
// import * as buffer from "buffer/";
// import * as crypto from "crypto-browserify";
// // import * as browserProcess from "process/browser"
// // import * as stream from "stream-browserify";
// import streamDep from "stream";
// // import * as path from "path-browserify";
// // @ts-ignore
// globalThis.Buffer ??= buffer.default.Buffer;
// // @ts-ignore
// // globalThis.crypto.createHash ? undefined : (globalThis.crypto = { ...crypto });
// globalThis.Crypto = { ...globalThis.Crypto, ...crypto };
// // @ts-ignore
// globalThis.process ??= { env: {} };
// globalThis.stream ??= streamDep;
// // globalThis.path ??= path;

// import getSigData from "./src/ar-data-base";
// import webDeepHash from "arweave/web/lib/deepHash";
// import type DataItem from "./src/DataItem";
// import { stringToBuffer } from "arweave/node/lib/utils";

// getSigData.getSignatureData = (item: DataItem) =>
//   webDeepHash([
//     stringToBuffer("dataitem"),
//     stringToBuffer("1"),
//     stringToBuffer(item.signatureType.toString()),
//     item.rawOwner,
//     item.rawTarget,
//     item.rawAnchor,
//     item.rawTags,
//     item.rawData,
//   ]);

import * as arbundlesSrc from "./src";
import * as stream from "./stream";
const expObj = { ...arbundlesSrc, stream };
globalThis.arbundles ??= expObj;
export default expObj;
export const arbundles = expObj;

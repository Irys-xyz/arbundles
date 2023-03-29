import * as arbundlesSrc from "./src";
import * as stream from "./src/stream";
const expObj = { ...arbundlesSrc, stream };
globalThis.arbundles ??= expObj;
export * from "./src";
export * from "./src/stream";
export default expObj;
export const arbundles = expObj;

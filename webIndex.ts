import * as arbundlesSrc from "./src";
import * as stream from "./src/stream";
const expObj = { ...arbundlesSrc, stream };
globalThis.arbundles ??= expObj;
export default expObj;
export const arbundles = expObj;

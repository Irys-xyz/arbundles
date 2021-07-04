/**
 * Decode the data content of a DataItem, either to a string or Uint8Array of bytes
 *
 * @param deps
 * @param d
 * @param param2
 */
import { DataItem, Dependencies } from "./ar-data-base";

export async function decodeData(
  deps: Dependencies,
  d: DataItem,
  options: { string: boolean } = { string: false }
): Promise<string | Uint8Array> {
  if (options.string) {
    return deps.utils.b64UrlToString(d.data);
  } else {
    return deps.utils.b64UrlToBuffer(d.data);
  }
}

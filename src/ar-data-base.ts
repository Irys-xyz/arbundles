import * as node from "arweave/node/lib/deepHash";
import * as web from "arweave/web/lib/deepHash";
import { stringToBuffer } from "arweave/web/lib/utils";
import DataItem from "./DataItem";
import { isBrowser } from "browser-or-node"

/**
 * Options for creation of a DataItem
 */
export interface DataItemCreateOptions {
  data: string | Uint8Array;
  target?: string;
  anchor?: string;
  tags?: { name: string; value: string }[];
}

export async function getSignatureData(item: DataItem): Promise<Uint8Array> {
  if (isBrowser) {
    return web.default([
      stringToBuffer("dataitem"),
      stringToBuffer("1"),
      item.getRawOwner(),
      item.getRawTarget(),
      item.getRawAnchor(),
      item.getRawTags(),
      item.getData()
    ]);
  } else {
    return node.default([
      stringToBuffer("dataitem"),
      stringToBuffer("1"),
      item.getRawOwner(),
      item.getRawTarget(),
      item.getRawAnchor(),
      item.getRawTags(),
      item.getData()
    ]);
  }

}

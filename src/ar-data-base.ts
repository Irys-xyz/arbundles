import { stringToBuffer } from "arweave/node/lib/utils";
import DataItem from "./DataItem";
import { isBrowser } from "./utils";
import { deepHash } from "./deepHash";
import webDeepHash from "arweave/web/lib/deepHash";
/**
 * Options for creation of a DataItem
 */
export interface DataItemCreateOptions {
  /**
   * @deprecated
   */
  data?: never; // breaking api change, should get the message across
  target?: string;
  anchor?: string;
  tags?: { name: string; value: string }[];
}

export async function getSignatureData(item: DataItem): Promise<Uint8Array> {
  if (isBrowser) {
    return webDeepHash([
      stringToBuffer("dataitem"),
      stringToBuffer("1"),
      stringToBuffer(item.signatureType.toString()),
      item.rawOwner,
      item.rawTarget,
      item.rawAnchor,
      item.rawTags,
      item.rawData,
    ]);
  } else {
    return deepHash([
      stringToBuffer("dataitem"),
      stringToBuffer("1"),
      stringToBuffer(item.signatureType.toString()),
      item.rawOwner,
      item.rawTarget,
      item.rawAnchor,
      item.rawTags,
      item.rawData,
    ]);
  }
}

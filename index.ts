import { stringToBuffer } from "arweave/node/lib/utils";
import type DataItem from "./src/DataItem";
import { deepHash } from "./src/deepHash";
import getSigData from "./src/ar-data-base";

getSigData.getSignatureData = (item: DataItem): Promise<Uint8Array> => {
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
};

export * from "./src/index";

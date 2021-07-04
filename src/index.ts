import { createData } from "./ar-data-create";
import { bundleAndSignData, unbundleData } from "./ar-data-bundle";
import { verifyData, verifyBundle } from "./ar-data-verify";
import Bundle from "./Bundle";
import DataItem from "./DataItem";

// interface ExportInterface {
//   createData(opts: DataItemCreateOptions, jwk: JWKPublicInterface): Promise<DataItem>;
//
//   sign(d: Uint8Array, jwk: JWKInterface): Promise<void>;
//
//   addTag(d: Uint8Array, name: string, value: string): Promise<boolean>;
//
//   verifyData(d: Uint8Array): Promise<boolean>;
//
//   verifyBundle(d: Uint8Array): Promise<boolean>;
//
//   bundleAndSignData(d: DataItemCreateOptions[]): Promise<Bundle>;
//
//   unbundleData(d: Uint8Array): Promise<DataItem[]>
// }

export {
  Bundle,
  DataItem,
  createData,
  bundleAndSignData,
  unbundleData,
  verifyData,
  verifyBundle
};



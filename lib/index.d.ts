import { createData } from "./ar-data-create";
import { bundleAndSignData, unbundleData } from "./ar-data-bundle";
import { verifyData, verifyBundle } from "./ar-data-verify";
import Bundle from "./Bundle";
import DataItem from "./DataItem";
declare const checkTags: (val: any, opts?: Partial<import("avsc/types").IsValidOptions>) => boolean;
export { Bundle, DataItem, createData, bundleAndSignData, unbundleData, verifyData, verifyBundle, checkTags };

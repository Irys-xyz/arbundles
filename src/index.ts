import { createData } from "./ar-data-create";
import { bundleAndSignData, unbundleData } from "./ar-data-bundle";
import { verifyFile } from './ar-data-verify';
import Bundle from "./Bundle";
import DataItem, { MIN_BINARY_SIZE } from './DataItem';
import { tagsParser } from "./parser";
import deepHash from './deepHash';
import { DataItemCreateOptions } from './ar-data-base';
import { fileToJson, getTags } from './file/file';

const checkTags = tagsParser.isValid;

export {
  MIN_BINARY_SIZE,
  Bundle,
  DataItem,
  createData,
  bundleAndSignData,
  unbundleData,
  verifyFile,
  deepHash,
  checkTags,
  DataItemCreateOptions
};

// File exports
export {
  getTags,
  fileToJson
}



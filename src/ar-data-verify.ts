import Bundle from "./Bundle";
import DataItem from "./DataItem";
import { Buffer } from "buffer";
import * as crypto from "crypto";
import Arweave from "arweave";
import base64url from "base64url";

/**
 * Verifies a bundle and all of its DataItems
 *
 * @param bundle
 */
export function verifyBundle(bundle: Bundle): boolean {
  return bundle.verify();
}

export async function verifyData(item: DataItem): Promise<boolean> {
  return item.verify();
}

export async function verifyDataStream(stream: NodeJS.ReadableStream): Promise<boolean> {
  const hasher = crypto.createHash("sha384");
  console.log(hasher);

  const signature = stream.read(512) as Buffer;
  const owner = stream.read(512) as Buffer;

  // Create hashing context deep hash
  const hash = Buffer.from("");

  const targetPresent = (stream.read(1) as Buffer)[0];
  if (targetPresent) {

  }

  return await Arweave.crypto.verify(base64url.encode(Buffer.from(owner), "hex"), hash, signature);
}

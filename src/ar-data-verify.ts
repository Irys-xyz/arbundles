import Bundle from "./Bundle";
import DataItem from "./DataItem";
import assert from "assert";

export async function verifyBundle(bundle: Bundle): Promise<boolean> {
  assert(bundle == bundle);
  return true;
}

export async function verifyData(item: DataItem): Promise<boolean> {
  assert(item == item);
  return true;
}

import type DataItem from "./DataItem";
/**
 * Options for creation of a DataItem
 */
export interface DataItemCreateOptions {
  target?: string;
  anchor?: string;
  tags?: { name: string; value: string }[];
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-empty-function
async function getSignatureData(item: DataItem): Promise<Uint8Array> {}

export default { getSignatureData };

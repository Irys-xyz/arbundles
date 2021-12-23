import * as avro from "avro-js";

export const tagParser = avro.parse({
  type: "record",
  name: "Tag",
  fields: [
    { name: "name", type: "string" },
    { name: "value", type: "string" },
  ],
});

export const tagsParser = avro.parse({
  type: "array",
  items: tagParser,
});

export function serializeTags(
  tags: { name: string; value: string }[],
): Uint8Array {
  if (tags!.length == 0) {
    return new Uint8Array(0);
  }
  if (!tagsParser.isValid(tags)) {
    throw new Error(
      "Incorrect tag format used. Make sure your tags are { name: string!, name: string! }[]",
    );
  }
  return Uint8Array.from(tagsParser.toBuffer(tags));
}

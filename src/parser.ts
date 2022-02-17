import * as avro from "avsc";

export const tagParser = avro.Type.forSchema({
  type: "record",
  name: "Tag",
  fields: [
    { name: "name", type: "string" },
    { name: "value", type: "string" },
  ],
});

export const tagsParser = avro.Type.forSchema({
  type: "array",
  items: tagParser,
});

export function serializeTags(
  tags: { name: string; value: string }[],
): Uint8Array {
  if (tags!.length == 0) {
    return new Uint8Array(0);
  }

  let tagsBuffer;
  try {
    tagsBuffer = tagsParser.toBuffer(tags);
  } catch (e) {
    throw new Error(
      "Incorrect tag format used. Make sure your tags are { name: string!, value: string! }[]",
    );
  }

  return Uint8Array.from(tagsBuffer);
}

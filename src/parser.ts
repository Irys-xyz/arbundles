import * as avro from "avsc";

export const tagParser = avro.Type.forSchema({
  type: "record",
  name: "Tag",
  fields: [
    { name: "name", type: "string" },
    { name: "value", type: "string" }
  ]
});

export const tagsParser = avro.Type.forSchema({
  type: "array",
  items: tagParser
});

export async function serializeTags(tags: { name: string; value: string }[]): Promise<Uint8Array> {
  if (tags!.length == 0) {
    return new Uint8Array(0);
  }

  return Uint8Array.from(tagsParser.toBuffer(tags));
}

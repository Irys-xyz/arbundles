import * as avro from "avsc";

export const tagParser = avro.Type.forSchema({
  type: "record",
  name: "x",
  fields: [
    { name: "name", type: "string" },
    { name: "value", type: "string" }
  ]
});

export const tagsParser = avro.Type.forSchema({
  type: "array",
  items: tagParser
});

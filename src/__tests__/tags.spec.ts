import { deserializeTags, serializeTags } from "../tags";

import { Type } from "avsc";
import { randomBytes, randomInt } from "crypto";

const tagParser = Type.forSchema({
  type: "record",
  name: "Tag",
  fields: [
    { name: "name", type: "string" },
    { name: "value", type: "string" },
  ],
});

const tagsParser = Type.forSchema({
  type: "array",
  items: tagParser,
});

function serializeTagsAVSC(tags: { name: string; value: string }[]): Buffer {
  if (tags!.length == 0) {
    return Buffer.from([0]);
  }

  let tagsBuffer;
  try {
    tagsBuffer = tagsParser.toBuffer(tags);
  } catch (e) {
    throw new Error("Incorrect tag format used. Make sure your tags are { name: string!, value: string! }[]");
  }

  return tagsBuffer;
}

export function generateRandomTags(
  tagsCount = randomInt(1, 20),
  maxChars = 100,
): {
  name: string;
  value: string;
}[] {
  return new Array(tagsCount).fill(undefined).map(() => {
    return {
      name: randomBytes(randomInt(1, maxChars)).toString("hex"),
      value: randomBytes(randomInt(1, maxChars)).toString("hex"),
    };
  });
}

const rustTags = {
  dec: [
    { name: "Hello", value: "Bundlr!" },
    { name: "This is a ", value: "Test" },
  ],
  enc: Buffer.from([
    4, 10, 72, 101, 108, 108, 111, 14, 66, 117, 110, 100, 108, 114, 33, 20, 84, 104, 105, 115, 32, 105, 115, 32, 97, 32, 8, 84, 101, 115, 116, 0,
  ]),
};

const warpTags = {
  dec: [
    {
      name: "YnVuZGxlci10ZXN0cw",
      value: "dHJ1ZQ",
    },
    {
      name: "ZFJUQUJSb1VNSmRXTUFtVGlQUlZ6T3hLc3Vya29HeEJlaFF6UlB5d2dITw",
      value: "enBJVFFUUWpzSGRtSFlVTGpCamZOZllpcHNaaUNRUENycEFSQUxaenJheQ",
    },
    {
      name: "WFRvbkZlaFltYmRWb21RUUtMWFZGc2tqak1wZkxFZGhlcnpoclRJT05vTg",
      value: "YkNtcXpZS254RUtFQXVKa0VGSUdaVGl3c29xdWdsWEZYeVVNUUhXQVNNdQ",
    },
    {
      name: "T25QVnp6RENsY3RIVUVFd3VhZ0xmYlVNc0pZTmV0ZkpXeFVLRXdpV2Z6Sg",
      value: "R3BocXp4bU5xekNQUFF3eUtVY2pXeXhUSldpTkhwTWtvT3JVbGdlQ2FRbA",
    },
    {
      name: "SWZzUmVyTXJ4VmtBTnpjUGpoZG1SSkZwTWlFTEJXS1NBWVNHQ2p1TGREaA",
      value: "b1NHbWtNRlRjeg",
    },
  ],
  // strange, equivalent encoding.
  weirdEnc: Buffer.from([
    9, 140, 7, 36, 89, 110, 86, 117, 90, 71, 120, 108, 99, 105, 49, 48, 90, 88, 78, 48, 99, 119, 12, 100, 72, 74, 49, 90, 81, 116, 90, 70, 74, 85, 81,
    85, 74, 83, 98, 49, 86, 78, 83, 109, 82, 88, 84, 85, 70, 116, 86, 71, 108, 81, 85, 108, 90, 54, 84, 51, 104, 76, 99, 51, 86, 121, 97, 50, 57, 72,
    101, 69, 74, 108, 97, 70, 70, 54, 85, 108, 66, 53, 100, 50, 100, 73, 84, 119, 116, 101, 110, 66, 74, 86, 70, 70, 85, 85, 87, 112, 122, 83, 71, 82,
    116, 83, 70, 108, 86, 84, 71, 112, 67, 97, 109, 90, 79, 90, 108, 108, 112, 99, 72, 78, 97, 97, 85, 78, 82, 85, 69, 78, 121, 99, 69, 70, 83, 81,
    85, 120, 97, 101, 110, 74, 104, 101, 81, 116, 87, 70, 82, 118, 98, 107, 90, 108, 97, 70, 108, 116, 89, 109, 82, 87, 98, 50, 49, 82, 85, 85, 116,
    77, 87, 70, 90, 71, 99, 50, 116, 113, 97, 107, 49, 119, 90, 107, 120, 70, 90, 71, 104, 108, 99, 110, 112, 111, 99, 108, 82, 74, 84, 48, 53, 118,
    84, 103, 116, 89, 107, 78, 116, 99, 88, 112, 90, 83, 50, 53, 52, 82, 85, 116, 70, 81, 88, 86, 75, 97, 48, 86, 71, 83, 85, 100, 97, 86, 71, 108,
    51, 99, 50, 57, 120, 100, 87, 100, 115, 87, 69, 90, 89, 101, 86, 86, 78, 85, 85, 104, 88, 81, 86, 78, 78, 100, 81, 116, 84, 50, 53, 81, 86, 110,
    112, 54, 82, 69, 78, 115, 89, 51, 82, 73, 86, 85, 86, 70, 100, 51, 86, 104, 90, 48, 120, 109, 89, 108, 86, 78, 99, 48, 112, 90, 84, 109, 86, 48,
    90, 107, 112, 88, 101, 70, 86, 76, 82, 88, 100, 112, 86, 50, 90, 54, 83, 103, 116, 82, 51, 66, 111, 99, 88, 112, 52, 98, 85, 53, 120, 101, 107,
    78, 81, 85, 70, 70, 51, 101, 85, 116, 86, 89, 50, 112, 88, 101, 88, 104, 85, 83, 108, 100, 112, 84, 107, 104, 119, 84, 87, 116, 118, 84, 51, 74,
    86, 98, 71, 100, 108, 81, 50, 70, 82, 98, 65, 116, 83, 87, 90, 122, 85, 109, 86, 121, 84, 88, 74, 52, 86, 109, 116, 66, 84, 110, 112, 106, 85, 71,
    112, 111, 90, 71, 49, 83, 83, 107, 90, 119, 84, 87, 108, 70, 84, 69, 74, 88, 83, 49, 78, 66, 87, 86, 78, 72, 81, 50, 112, 49, 84, 71, 82, 69, 97,
    65, 28, 98, 49, 78, 72, 98, 87, 116, 78, 82, 108, 82, 106, 101, 103, 0,
  ]),
  enc: Buffer.from([
    10, 36, 89, 110, 86, 117, 90, 71, 120, 108, 99, 105, 49, 48, 90, 88, 78, 48, 99, 119, 12, 100, 72, 74, 49, 90, 81, 116, 90, 70, 74, 85, 81, 85,
    74, 83, 98, 49, 86, 78, 83, 109, 82, 88, 84, 85, 70, 116, 86, 71, 108, 81, 85, 108, 90, 54, 84, 51, 104, 76, 99, 51, 86, 121, 97, 50, 57, 72, 101,
    69, 74, 108, 97, 70, 70, 54, 85, 108, 66, 53, 100, 50, 100, 73, 84, 119, 116, 101, 110, 66, 74, 86, 70, 70, 85, 85, 87, 112, 122, 83, 71, 82, 116,
    83, 70, 108, 86, 84, 71, 112, 67, 97, 109, 90, 79, 90, 108, 108, 112, 99, 72, 78, 97, 97, 85, 78, 82, 85, 69, 78, 121, 99, 69, 70, 83, 81, 85,
    120, 97, 101, 110, 74, 104, 101, 81, 116, 87, 70, 82, 118, 98, 107, 90, 108, 97, 70, 108, 116, 89, 109, 82, 87, 98, 50, 49, 82, 85, 85, 116, 77,
    87, 70, 90, 71, 99, 50, 116, 113, 97, 107, 49, 119, 90, 107, 120, 70, 90, 71, 104, 108, 99, 110, 112, 111, 99, 108, 82, 74, 84, 48, 53, 118, 84,
    103, 116, 89, 107, 78, 116, 99, 88, 112, 90, 83, 50, 53, 52, 82, 85, 116, 70, 81, 88, 86, 75, 97, 48, 86, 71, 83, 85, 100, 97, 86, 71, 108, 51,
    99, 50, 57, 120, 100, 87, 100, 115, 87, 69, 90, 89, 101, 86, 86, 78, 85, 85, 104, 88, 81, 86, 78, 78, 100, 81, 116, 84, 50, 53, 81, 86, 110, 112,
    54, 82, 69, 78, 115, 89, 51, 82, 73, 86, 85, 86, 70, 100, 51, 86, 104, 90, 48, 120, 109, 89, 108, 86, 78, 99, 48, 112, 90, 84, 109, 86, 48, 90,
    107, 112, 88, 101, 70, 86, 76, 82, 88, 100, 112, 86, 50, 90, 54, 83, 103, 116, 82, 51, 66, 111, 99, 88, 112, 52, 98, 85, 53, 120, 101, 107, 78,
    81, 85, 70, 70, 51, 101, 85, 116, 86, 89, 50, 112, 88, 101, 88, 104, 85, 83, 108, 100, 112, 84, 107, 104, 119, 84, 87, 116, 118, 84, 51, 74, 86,
    98, 71, 100, 108, 81, 50, 70, 82, 98, 65, 116, 83, 87, 90, 122, 85, 109, 86, 121, 84, 88, 74, 52, 86, 109, 116, 66, 84, 110, 112, 106, 85, 71,
    112, 111, 90, 71, 49, 83, 83, 107, 90, 119, 84, 87, 108, 70, 84, 69, 74, 88, 83, 49, 78, 66, 87, 86, 78, 72, 81, 50, 112, 49, 84, 71, 82, 69, 97,
    65, 28, 98, 49, 78, 72, 98, 87, 116, 78, 82, 108, 82, 106, 101, 103, 0,
  ]),
};
const shortTags = {
  dec: [{ name: "ThisIsAShortName", value: "ThisIsAShortValue" }],
  enc: Buffer.from([
    2, 32, 84, 104, 105, 115, 73, 115, 65, 83, 104, 111, 114, 116, 78, 97, 109, 101, 34, 84, 104, 105, 115, 73, 115, 65, 83, 104, 111, 114, 116, 86,
    97, 108, 117, 101, 0,
  ]),
};

const longTags = {
  dec: [
    {
      name: "ThisIsALongNameAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      value: "ThisIsALongValueAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    },
  ],
  enc: Buffer.from([
    2, 128, 1, 84, 104, 105, 115, 73, 115, 65, 76, 111, 110, 103, 78, 97, 109, 101, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65,
    65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 156, 1, 84,
    104, 105, 115, 73, 115, 65, 76, 111, 110, 103, 86, 97, 108, 117, 101, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65,
    65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65,
    65, 65, 65, 65, 65, 65, 65, 0,
  ]),
};

const invalidTags = [
  "",
  { name: undefined },
  { value: undefined },
  { name: undefined, value: undefined },
  { name: Buffer.from("test"), value: { test: true } },
];

const testTags = { rustTags, warpTags, shortTags, longTags };

describe("Tag tests", function () {
  test("encode decode empty tags", () => {
    const tags = [{ name: "", value: "" }];
    const avscEnc = serializeTagsAVSC(tags);
    const enc = serializeTags(tags);
    expect(avscEnc).toEqual(enc);
  });

  describe("reject invalid tags", () => {
    test.each(invalidTags)("tag %s", (tag) => {
      // @ts-expect-error test cases
      expect(() => serializeTagsAVSC([tag])).toThrow();
      // @ts-expect-error test cases
      expect(() => serializeTags([tag])).toThrow();
    });
  });

  describe("should encode the sample tags correctly", function () {
    test.each(Object.keys(testTags))("%s", (key) => {
      const { enc, dec } = testTags[key];
      const sec1 = serializeTags(dec);
      expect(sec1).toEqual(enc);
      const sec2 = serializeTagsAVSC(dec);
      expect(sec2).toEqual(enc);
    });
  });

  describe("should decode the sample tags correctly", function () {
    test.each(Object.keys(testTags))("%s", (key) => {
      const { enc, dec } = testTags[key];
      expect(deserializeTags(enc)).toEqual(dec);
      expect(tagsParser.fromBuffer(enc)).toEqual(dec);
    });
  });

  it("Should correctly decode the different encoding of warpTags", function () {
    expect(deserializeTags(warpTags.weirdEnc)).toEqual(warpTags.dec);
    expect(tagsParser.fromBuffer(warpTags.weirdEnc)).toEqual(warpTags.dec);
  });

  it("should correctly encode/decode random tags", function () {
    const randomTags = generateRandomTags();
    const serializedTags = serializeTags(randomTags);
    const deTags = deserializeTags(serializedTags);
    expect(deTags).toEqual(randomTags);
    const avscTags = Buffer.from(serializeTagsAVSC(randomTags));
    const deAvscTags = tagsParser.fromBuffer(serializedTags);
    expect(serializedTags).toStrictEqual(avscTags);
    expect(deAvscTags).toEqual(randomTags);
  });
});

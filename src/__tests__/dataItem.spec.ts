import base64url from "base64url";
import { createData } from "../ar-data-create";
import type DataItem from "../DataItem";
import { EthereumSigner } from "../signing";
import type { Tag } from "../tags";
import { serializeTags } from "../tags";
import { byteArrayToLong } from "../utils";

const testTagsVariations = [
  { description: "no", tags: [] },
  { description: "one", tags: [{ name: "tag1", value: "value1" }] },
  {
    description: "two",
    tags: [
      { name: "tag1", value: "value1" },
      { name: "tag2", value: "value2" },
    ],
  },
  { description: "not defined", tags: undefined },
];

const testAnchorVariations = [
  { description: "no", anchor: undefined },
  { description: "a valid", anchor: "thisSentenceIsDefinitely32Bytes!" },
];

const testTargetVariations: { description: string; target: undefined | string }[] = [
  { description: "no", target: undefined },
  { description: "a valid", target: base64url.encode("thisSentenceIsDefinitely32Bytes!") },
];

const testDataVariations = [
  { description: "empty string", data: "" },
  { description: "a valid string", data: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};':\",./<>?`~" },
];

describe("DataItem", () => {
  describe("given we have a dataItem", () => {
    describe.each(testTagsVariations)("with $description tags", ({ tags }) => {
      describe.each(testAnchorVariations)("and with $description anchor", ({ anchor }) => {
        describe.each(testTargetVariations)("and with $description target", ({ target }) => {
          describe.each(testDataVariations)("and with $description data", ({ data }) => {
            let dataItem: DataItem;
            const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");
            beforeEach(async () => {
              dataItem = createData(data, signer, { anchor, target, tags });
            });
            describe("given we want to get the data", () => {
              it("should return the data", async () => {
                expect(dataItem.rawData.toString()).toEqual(data);
              });
            });

            describe("given we want to get the signature", () => {
              describe("and it's signed", () => {
                it("should return the signature", async () => {
                  await dataItem.sign(signer);
                  expect(dataItem.signature).toBeDefined();
                });
                it("should return true if we call isSigned", async () => {
                  await dataItem.sign(signer);
                  expect(dataItem.isSigned()).toEqual(true);
                });
              });
              describe("and it's not signed", () => {
                it("should return the default string", async () => {
                  const NOT_INITIALIZED_SIGNATURE = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
                  expect(dataItem.signature).toEqual(NOT_INITIALIZED_SIGNATURE);
                });

                it("should return false if we call isSigned", async () => {
                  expect(dataItem.isSigned()).toEqual(false);
                });
              });
            });
            describe("given we want to get the anchor", () => {
              it("should return the anchor", async () => {
                expect(dataItem.anchor).toEqual(base64url.encode(anchor ?? ""));
              });
            });
            describe("given we want to get the target", () => {
              it("should return the target", async () => {
                expect(dataItem.target).toEqual(target ?? "");
              });
            });
            describe("given we want to get the tags", () => {
              it("should return the tags", async () => {
                expect(dataItem.tags).toEqual(tags ?? []);
              });
            });
            describe("given we want to get the id", () => {
              it("should return the id", async () => {
                expect(dataItem.id).toBe("mM5C3u9R1AJp1UL1MUvvLHRo1AGtXYUWi_q0wBCPdfc");
              });
            });
            describe("given we want to get the owner", () => {
              it("should return the owner", async () => {
                expect(dataItem.owner).toBe(signer.publicKey.toString("base64url"));
              });
            });
            describe("given we use getRaw()", () => {
              it("should return the raw data", async () => {
                expect(dataItem.getRaw()).toBeDefined();
              });
            });
            describe("given we use getSignatureData()", () => {
              it("should return the signature data", async () => {
                expect(Buffer.from(await dataItem.getSignatureData())).toBeDefined();
              });
            });

            describe("given we use getStartOfData()", () => {
              it("should return the start of data", async () => {
                // @ts-expect-error private property access
                const tagsStart = dataItem.getTagsStart();
                // @ts-expect-error private property access
                const numberOfTagBytesArray = dataItem.binary.subarray(tagsStart + 8, tagsStart + 16);
                const numberOfTagBytes = byteArrayToLong(numberOfTagBytesArray);
                expect(dataItem.getStartOfData()).toEqual(tagsStart + 16 + numberOfTagBytes);
              });
            });

            describe("given we use isValid()", () => {
              describe("and the data is valid", () => {
                it("should return true that the data is valid", async () => {
                  await dataItem.sign(signer);
                  expect(await dataItem.isValid()).toEqual(true);
                });
              });
              describe("and the data is not valid", () => {
                it("should return false that the data is valid", async () => {
                  await dataItem.sign(signer);
                  if (dataItem.rawData.length > 0) {
                    dataItem.rawData[0] = dataItem.rawData[0] + 1;
                  } else {
                    // @ts-expect-error private property access
                    const newBuffer = Buffer.alloc(dataItem.binary.length + 1);
                    // @ts-expect-error private property access
                    dataItem.binary.copy(newBuffer);
                    // @ts-expect-error private property access
                    newBuffer[dataItem.binary.length] = 1;
                    // @ts-expect-error private property access
                    dataItem.binary = newBuffer;
                  }
                  expect(await dataItem.isValid()).toEqual(false);
                });
              });
            });

            describe("given we access ownerLength", () => {
              it("should return the owner length", async () => {
                expect(dataItem.ownerLength).toEqual(65);
              });
            });

            describe("given we access rawAnchor", () => {
              it("should return the raw anchor", async () => {
                expect(dataItem.rawAnchor).toEqual(Buffer.from(anchor ?? ""));
              });
            });
            describe("given we access rawTarget", () => {
              it("should return the raw target", async () => {
                expect(dataItem.rawTarget).toEqual(base64url.toBuffer(target ?? ""));
              });
            });

            describe("given we access rawTags", () => {
              it("should return the raw tags", async () => {
                expect(dataItem.rawTags).toEqual((tags?.length ?? 0) > 0 ? serializeTags(tags as Tag[]) : /* null */ Buffer.alloc(0));
              });
            });

            describe("given we access rawId", () => {
              it("should return the raw id", async () => {
                expect(dataItem.rawId).toEqual(base64url.toBuffer("mM5C3u9R1AJp1UL1MUvvLHRo1AGtXYUWi_q0wBCPdfc"));
              });
            });

            describe("given we access rawOwner", () => {
              it("should return the raw owner", async () => {
                expect(dataItem.rawOwner).toEqual(Buffer.from(signer.publicKey));
              });
            });

            describe("given we access signatureType", () => {
              it("should return the signature type", async () => {
                const ETHEREUM_SIGNATURE_TYPE = 3;
                expect(dataItem.signatureType).toEqual(ETHEREUM_SIGNATURE_TYPE);
              });
            });

            describe("given we use setSignature()", () => {
              it("should set the signature", async () => {
                const signature = Buffer.from("C".repeat(65));
                dataItem.setSignature(signature);
                expect(dataItem.rawSignature.toString("hex")).toEqual(signature.toString("hex"));
              });
            });

            describe("given we use toJSON()", () => {
              it("should return the json", async () => {
                expect(dataItem.toJSON()).toEqual({
                  signature: dataItem.signature,
                  owner: signer.publicKey.toString("base64url"),
                  target: target ?? "",
                  tags: (tags ?? []).map((t) => ({
                    name: base64url.encode(t.name),
                    value: base64url.encode(t.value),
                  })),
                  data: Buffer.from(data).toString("base64url"),
                });
              });
            });
          });
        });
      });
    });
  });
  describe("given we have a known Dataitem", () => {
    let dataItem: DataItem;
    // we use precomputed values for this known data item
    const data = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};':\",./<>?`~";
    const tags = [
      { name: "tag1", value: "value1" },
      { name: "tag2", value: "value2" },
    ];
    const anchor = "thisSentenceIs32BytesLongTrustMe";
    const target = "OXcT1sVRSA5eGwt2k6Yuz8-3e3g9WJi5uSE99CWqsBs";

    const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");
    beforeEach(async () => {
      dataItem = createData(data, signer, { anchor, target, tags });
    });
    describe("given we want to get the data", () => {
      it("should return the data", async () => {
        expect(dataItem.rawData.toString()).toEqual(data);
      });
    });

    describe("given we want to get the signature", () => {
      it("should return the signature", async () => {
        await dataItem.sign(signer);
        expect(dataItem.signature).toEqual("e17NCZKJP8rY9EwaFyN-_icUX_IJAX9PbGjj5E55hslNoOdUQQgu13d_CjnBpOvkHwjzpgHzOiJ3UWMmimp0-Bw");
      });
    });
    describe("given we want to get the start of data", () => {
      it("should return the start of data", async () => {
        expect(dataItem.getStartOfData()).toEqual(240);
      });
    });
    describe("given we want use getSignatureData()", () => {
      it("should return the signature data", async () => {
        await dataItem.sign(signer);
        expect(Buffer.from(await dataItem.getSignatureData())).toBeDefined();
      });
    });

    describe("given we construct a DataItem with oversized tags", () => {
      it("should throw", async () => {
        expect(() =>
          createData(data, signer, {
            anchor,
            target,
            tags: [
              { name: "a", value: "b" },
              { name: "oversized", value: "oversized".repeat(4096) },
            ],
          }),
        ).toThrow();
        //   await dataItem.sign(signer);
        //   expect(() => dataItem.isValid()).rejects.toThrowError();
      });
    });
  });
});

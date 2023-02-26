import * as fs from "fs";
import { EthereumSigner } from "../../src/signing";
import { serializeTags } from "../../src/tags";
import { byteArrayToLong } from "../../src/utils";
import { promisify } from "util";
import FileDataItem from "file/FileDataItem";

const testTagsVariations = [
  { description: "no", tags: [] },
  { description: "one", tags: [{ name: "tag1", value: "value1" }] },
  { description: "two", tags: [{ name: "tag1", value: "value1" }, { name: "tag2", value: "value2" }] },
  { description: "not defined", tags: undefined },
];

const testAnchorVariations = [
  { description: "no", anchor: undefined },
  { description: "a valid", anchor: "thisSentenceIs32BytesLongTrustMe" },
];

const testTargetVariations: { description: string, target: undefined | string; }[] = [
  { description: "no", target: undefined },
  // { description: "a valid", target: "thisSentenceIsDefinitely32Bytes!" },
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
            let dataItem: FileDataItem;
            // write a sentence which describe itself and is 32 bytes long
            // thisSentenceIs32BytesLongRightNow
            const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");
            beforeEach(async () => {
              dataItem = await createData(data, signer, { anchor, target, tags });
            });

            afterEach(async () => {
              if (dataItem?.filename) {
                const handle = await fs.promises.open(dataItem.filename, "r");
                await handle.close();
              }
            });


            describe("given we want to get the data", () => {
              it("should return the data", async () => {
                expect((await dataItem.rawData()).toString()).toEqual(data);
              });
            });

            describe("given we want to get the signature", () => {
              describe("and it's signed", () => {
                it("should return the signature", async () => {
                  await dataItem.sign(signer);
                  expect(await dataItem.signature()).toBeDefined();
                });
                it("should return true if we call isSigned", async () => {
                  await dataItem.sign(signer);
                  expect(await dataItem.isSigned()).toEqual(true);
                });
              });
              describe("and it's not signed", () => {
                it("should return the default string", async () => {
                  const NOT_INITIALIZED_SIGNATURE = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
                  expect(await dataItem.signature()).toEqual(NOT_INITIALIZED_SIGNATURE);
                });

                it("should return false if we call isSigned", async () => {
                  expect(await dataItem.isSigned()).toEqual(false);
                });
              });
            });
            describe("given we want to get the anchor", () => {
              it("should return the anchor", async () => {
                expect(await dataItem.anchor()).toEqual(anchor ?? "");
              });
            });
            describe("given we want to get the target", () => {
              it("should return the target", async () => {
                expect(await dataItem.target()).toEqual(target ?? "");
              });
            });
            describe("given we want to get the tags", () => {
              it("should return the tags", async () => {
                expect(await dataItem.tags()).toEqual(tags ?? []);
              });
            });
            describe("given we want to get the id", () => {
              it("should return the id", async () => {
                await dataItem.sign(signer);
                expect(dataItem.id).toBeDefined();
              });
            });
            describe("given we want to get the owner", () => {
              it("should return the owner", async () => {
                expect(await dataItem.owner()).toBe(signer.publicKey.toString("base64url"));
              });
            });
            describe("given we use rawData()", () => {
              it("should return the raw data", async () => {
                expect(await dataItem.rawData()).toBeDefined();
              });
            });
            describe("given we use signature()", () => {
              it("should return the signature data", async () => {
                expect(Buffer.from((await dataItem.signature()))).toBeDefined();
              });
            });

            describe("given we use getStartOfData()", () => {
              it("should return the start of data", async () => {
                const tagsStart = await dataItem.getTagsStart();
                const handle = (await fs.promises.open(dataItem.filename, "r"));
                const numberOfTagsBytesBuffer = await promisify(fs.read)(
                  handle.fd,
                  Buffer.allocUnsafe(8),
                  0,
                  8,
                  tagsStart + 8,
                ).then((r) => r.buffer);
                const numberOfTagBytes = byteArrayToLong(numberOfTagsBytesBuffer);
                expect(await dataItem.dataStart()).toEqual(tagsStart + 16 + numberOfTagBytes);
                await handle.close();
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
                  fs.writeFileSync(dataItem.filename, "invalid", { flag: "a" });

                  expect(await dataItem.isValid()).toEqual(false);
                });
              });
            });

            describe("given we access ownerLength", () => {
              it("should return the owner length", async () => {
                expect(await dataItem.ownerLength()).toEqual(65);
              });
            });

            describe("given we access rawAnchor", () => {
              it("should return the raw anchor", async () => {
                expect(await dataItem.rawAnchor()).toEqual(Buffer.from(anchor ?? ""));
              });
            });
            describe("given we access rawTarget", () => {
              it("should return the raw target", async () => {
                expect(await dataItem.rawTarget()).toEqual(Buffer.from(target ?? ""));
              });
            });

            describe("given we access rawTags", () => {
              it("should return the raw tags", async () => {
                expect(await dataItem.rawTags()).toEqual(serializeTags(tags ?? []));
              });
            });

            describe("given we access rawId", () => {
              it("should return the raw id", async () => {
                await dataItem.sign(signer);
                expect(dataItem.rawId).toBeDefined();
              });
            });

            describe("given we access rawOwner", () => {
              it("should return the raw owner", async () => {
                expect(await dataItem.rawOwner()).toEqual(Buffer.from(signer.publicKey));
              });
            });

            describe("given we access signatureType", () => {
              it("should return the signature type", async () => {
                const ETHEREUM_SIGNATURE_TYPE = 3;
                expect(await dataItem.signatureType()).toEqual(ETHEREUM_SIGNATURE_TYPE);
              });
            });
            describe("given we want to verify the signature", () => {
              describe("and the signature is valid", () => {
                it("should return true", async () => {
                  await dataItem.sign(signer);
                  expect(await FileDataItem.verify(dataItem.filename)).toEqual(true);
                });
              });
              describe("and the signature is invalid", () => {
                it("should return false", async () => {
                  await dataItem.sign(signer);
                  fs.writeFileSync(dataItem.filename, "invalid", { flag: "a" });
                  expect(await FileDataItem.verify(dataItem.filename)).toEqual(false);
                });
              });
            });
          });
        });
      });
    });
  });
});

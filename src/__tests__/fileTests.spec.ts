import { DataItem, ArweaveSigner } from "../../index";
import { bundleAndSignData, createData, FileDataItem } from "../../src/file/index";
import { readFileSync } from "fs";
import path from "path";
import * as fs from "fs";
import { EthereumSigner } from "../signing";
import { serializeTags } from "../tags";
import { byteArrayToLong, longTo8ByteArray } from "../utils";
import { promisify } from "util";
import base64url from "base64url";

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
const wallet0 = JSON.parse(readFileSync(path.join(__dirname, "test_key0.json")).toString());

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
                expect(await dataItem.anchor()).toEqual(base64url.encode(anchor ?? ""));
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
                expect(Buffer.from(await dataItem.signature())).toBeDefined();
              });
            });

            describe("given we call data()", () => {
              it("should return the data as base64url", async () => {
                expect(await dataItem.data()).toEqual(base64url.encode(Buffer.from(data)));
              });
            });

            describe("given we use getStartOfData()", () => {
              it("should return the start of data", async () => {
                const tagsStart = await dataItem.getTagsStart();
                const handle = await fs.promises.open(dataItem.filename, "r");
                const numberOfTagsBytesBuffer = await promisify(fs.read)(handle.fd, Buffer.allocUnsafe(8), 0, 8, tagsStart + 8).then((r) => r.buffer);
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
                expect(await dataItem.rawTarget()).toEqual(base64url.toBuffer(target ?? ""));
              });
            });

            describe("given we access rawTags", () => {
              describe("and the format is valid", () => {
                it("should return the raw tags", async () => {
                  expect(await dataItem.rawTags()).toEqual(serializeTags(tags ?? []) ?? []);
                });
              });

              describe("and the format is invalid (too many numberOfTagsBytes)", () => {
                it("should return false", async () => {
                  await dataItem.sign(signer);
                  const tagStart = await dataItem.getTagsStart();
                  const fakeTagLength = longTo8ByteArray(4096 + 1);
                  const fakeTagCnt = longTo8ByteArray(10);

                  const handle = fs.openSync(dataItem.filename, "r+");
                  fs.writeSync(handle, fakeTagCnt, 0, 8, tagStart);
                  fs.writeSync(handle, fakeTagLength, 0, 8, tagStart + 8);
                  fs.closeSync(handle);
                  await expect(async () => await dataItem.rawTags()).rejects.toThrowError("Tags too large");
                });
              });
            });

            describe("given we access rawId", () => {
              it("should return the raw id", async () => {
                await dataItem.sign(signer);
                expect(dataItem.rawId).toBeDefined();
              });
              it("should throw if the id is not set", () => {
                expect(() => dataItem.rawId).toThrowError(new Error("ID is not set"));
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

describe("static methods", () => {
  const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");
  describe("isDataItem()", () => {
    describe("given a valid data item", () => {
      it("should return true", async () => {
        const dataItem = await createData("loremIpsum", signer);
        expect(FileDataItem.isDataItem(dataItem)).toEqual(true);
      });
    });
    describe("given an invalid data item", () => {
      it("should return false for objects", async () => {
        expect(FileDataItem.isDataItem({})).toEqual(false);
      });
      it("should return false for strings", async () => {
        expect(FileDataItem.isDataItem("")).toEqual(false);
      });
      it("should return false for numbers", async () => {
        expect(FileDataItem.isDataItem(0)).toEqual(false);
      });
      it("should return false for objects with partial DataItem properties", () => {
        expect(FileDataItem.isDataItem({ filename: "test" })).toEqual(false);
      });
    });
  });
  describe("verify()", () => {
    describe("given a valid data item", () => {
      it("should return true", async () => {
        const dataItem = await createData("loremipsum", signer);
        await dataItem.sign(signer);
        expect(await FileDataItem.verify(dataItem.filename)).toEqual(true);
      });
      describe("given a invalid data item", () => {
        it("should return false", async () => {
          const dataItem = await createData("loremIpsum", signer);
          await dataItem.sign(signer);
          fs.writeFileSync(dataItem.filename, "invalid", { flag: "a" });
          expect(await FileDataItem.verify(dataItem.filename)).toEqual(false);
        });
      });
      describe("given a invalid DataItem due to having too many tags", () => {
        it("should return false", async () => {
          const dataItem = await createData("loremIpsum", signer);
          await dataItem.sign(signer);
          const tagStart = await dataItem.getTagsStart();
          const fakeTagLength = longTo8ByteArray(4096 + 1);
          const handle = fs.openSync(dataItem.filename, "r+");
          fs.writeSync(handle, fakeTagLength, 0, 8, tagStart + 8);
          fs.closeSync(handle);
          expect(await FileDataItem.verify(dataItem.filename)).toEqual(false);
        });
      });
    });
  });

  it("should get all correct data", async function () {
    const signer = new ArweaveSigner(wallet0);
    const opts = {
      anchor: "fgggggggggggggggggggggggggllllll",
    };

    const data = await createData("tasty", signer, opts);
    await data.sign(signer);

    expect(await data.isValid()).toBe(true);
    expect(await data.signatureType()).toEqual(1);
    expect(await data.owner()).toEqual(wallet0.n);
    expect(await data.rawAnchor().then((r) => r.toString())).toEqual("fgggggggggggggggggggggggggllllll");
    expect(await data.tags()).toEqual([]);
    expect(await data.target()).toEqual("");
    expect((await data.rawData()).toString()).toEqual("tasty");
    expect(await FileDataItem.verify(data.filename)).toEqual(true);
  }, 10000000);

  it("should bundle correctly", async function () {
    const signer = new ArweaveSigner(wallet0);
    const tags = [
      {
        name: "Content-Type",
        value: "image/png",
      },
    ];
    const data = "hello";
    const d = [await createData(data, signer, { tags }), await createData(data, signer, { tags }), await createData(data, signer, { tags })];
    const bundle = await bundleAndSignData(d, signer);

    const first = await bundle.get(0);
    const second = await bundle.get(1);
    const third = await bundle.get(2);

    expect(await DataItem.verify(fs.readFileSync(first.filename))).toBe(true);
    expect(await DataItem.verify(fs.readFileSync(second.filename))).toBe(true);
    expect(await DataItem.verify(fs.readFileSync(third.filename))).toBe(true);
    expect(await first.owner()).toEqual(wallet0.n);
    expect(await second.owner()).toEqual(wallet0.n);
    expect(await third.owner()).toEqual(wallet0.n);
  }, 1000000000);

  // it("Should post correctly", async function () {
  //   const signer = new ArweaveSigner(wallet0);
  //   const tags = [
  //     {
  //       name: "Content-Type",
  //       value: "image/png",
  //     },
  //   ];

  //   const d = [await createData("", signer, { tags })];

  //   const bundle = await bundleAndSignData(d, signer);
  //   const tx = await bundle.toTransaction({}, arweave, wallet0);
  //   await arweave.transactions.sign(tx, wallet0);
  //   const response = await arweave.transactions.post(tx);

  //   expect(response.status).toEqual(200);
  // });

  // it("Test posted tx", async function () {
  //   const tx = await arweave.transactions.getData(
  //     "viUi_gCJyL2Wgjd0AcBtHjkNw0Vgj7v-HshQF8NRcBY"
  //   );
  //   console.log(tx);
  // }, 10000000);
  //
  // it("Test unbundle", async function () {
  //   const signer = new ArweaveSigner(wallet0);
  //   const tags = [
  //     {
  //       name: "Content-Type",
  //       value: "image/png",
  //     },
  //   ];
  //   const data = await fs.promises
  //       .readFile("test")
  //       .then((r) => Buffer.from(r.buffer)) as never;
  //
  //   const num = 100;
  //   const items = new Array(num);
  //
  //   for (let i = 0; i < num; i++) {
  //     items[i] = await createData(data, signer, { tags });
  //   }
  //
  //   const bundle = await bundleAndSignData(items, signer);
  //   const tx = await bundle.signAndSubmit(arweave, wallet0);
  //
  //   console.log(tx.id);
  //   console.log(await bundle.getIds());
  // }, 1000000);
  //
  // it("Small test", async function () {
  //   const signer = new ArweaveSigner(wallet0);
  //   const tags = [
  //     {
  //       name: "Content-Type",
  //       value: "image/png",
  //     },
  //   ];
  //   const data = await fs.promises
  //       .readFile("test")
  //       .then((r) => Buffer.from(r.buffer)) as never;
  //
  //   const d = await createData(data, signer, { tags });
  //   await d.sign(signer);
  //
  //   const bundle = await bundleAndSignData([d], signer);
  //
  //   const _tx = await bundle.toTransaction(arweave, wallet0);
  //
  //   _tx.reward = (+_tx.reward * 2).toString();
  //
  //   await arweave.transactions.sign(_tx, wallet0);
  // });

  // it("should get 200", async function() {
  //   const signer = new ArweaveSigner(wallet0);
  //   const tags = [
  //     {
  //       name: "Content-Type",
  //       value: "image/png",
  //     },
  //   ];
  //   const data = await fs.promises
  //       .readFile("test")
  //       .then((r) => Buffer.from(r.buffer)) as never;
  //
  //   const d = await createData(data, signer, { tags });
  //   await d.sign(signer);
  //
  //   const response = await d.sendToBundler("http://bundler.arweave.net");
  //   expect(response.status).toBe(200);
  // });

  // it("should index item from S3", async function() {
  //   console.log(await DataItem.verify(fs.readFileSync(path.join(__dirname, "./.e5f55c2424dbaf806a15ea722881cea2.part.minio"))));
  //   const item = new FileDataItem(path.join(__dirname, "./.e5f55c2424dbaf806a15ea722881cea2.part.minio"));
  //   console.log(base64url.encode(crypto.createHash("sha256").update(await item.rawOwner()).digest()));
  //   expect(await item.isValid()).toBe(true);
  // });
});

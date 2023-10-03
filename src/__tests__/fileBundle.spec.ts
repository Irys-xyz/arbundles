/* eslint-disable @typescript-eslint/no-explicit-any */
import { createData } from "../ar-data-create";
import { FileDataItem } from "../file";
import type { FileBundle } from "../file/FileBundle";
import Bundle from "../file/FileBundle";
import { EthereumSigner } from "../../index";
import { bundleAndSignData } from "../file";
import base64url from "base64url";
import type Transactions from "@irys/arweave/common/transactions";
import type Arweave from "@irys/arweave";
import type { JWKInterface } from "../";
import Transaction from "@irys/arweave/common/lib/transaction";
import path from "path";
import type { PathLike } from "fs";
import fs from "fs";
import { tmpName } from "tmp-promise";
import { randomBytes } from "crypto";
import { unlink, writeFile } from "fs/promises";

export function randomNumber(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const testDataVariations = [
  { description: "no", numDataItems: 0 },
  { description: "one", numDataItems: 1 },
  { description: "two", numDataItems: 2 },
  { description: "eight", numDataItems: 8 },
];

const paths: string[] = [];

afterAll(async () => {
  for (const path of paths) {
    await unlink(path);
  }
});

describe.each(testDataVariations)("given we have $description FileDataItems", ({ numDataItems }) => {
  let dataItems: FileDataItem[] = [];
  const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");
  beforeEach(async () => {
    dataItems = [];
    for (let i = 0; i < numDataItems; ++i) {
      const path = await tmpName();
      const item = createData(randomBytes(randomNumber(1_000, 5_000)), signer);
      await item.sign(signer);
      await writeFile(path, item.getRaw());
      paths.push(path);
      dataItems.push(new FileDataItem(path));
    }
  });

  (numDataItems === 0 ? describe.skip : describe)("and given we want to create a bundle from a directory using fromDir()", () => {
    let bundle: FileBundle;
    let destPaths: PathLike[];
    let headerPath: PathLike;
    let orgBundle: FileBundle;
    beforeEach(async () => {
      destPaths = [];
      orgBundle = await bundleAndSignData(dataItems, signer);
      // this is a strange workaround - we now copy everything besides the header into a new tmp dir
      // and then we copy the renamed header into the new dir
      const newDir = fs.mkdtempSync(path.join(path.dirname(dataItems[0].filename.toString()), "/tmp"));
      orgBundle.txs.forEach((file) => {
        const newFilePath = path.join(newDir, path.basename(file.toString()));
        fs.copyFileSync(file, newFilePath);
        destPaths.push(newFilePath);
      });
      // cop rename header file
      headerPath = path.join(newDir, "/header");
      fs.copyFileSync(orgBundle.headerFile, headerPath);
      bundle = await Bundle.fromDir(newDir);
    });

    it("should create a bundle", async () => {
      expect(bundle).toBeDefined();
    });
    it("should contain all the data items", async () => {
      expect(await bundle.length()).toEqual(numDataItems);
    });
    // TODO: This tests fails really strange, getById returns the wrong data items. Fix FileBundle implementation.
    it("should contain the data for every data item with the same id", async () => {
      for (let i = 0; i < numDataItems; ++i) {
        const orgDataItem = await orgBundle.get(i);
        const orgId = orgDataItem.id;
        const bundleDataItem = await bundle.get(orgId);
        expect(bundleDataItem.id).toEqual(orgId);
        // console.log((await bundleDataItem.rawData()).toString(), (await orgDataItem.rawData()).toString());
        await expect(bundleDataItem.rawData()).toEqual(orgDataItem.rawData());
      }
    });
    it("should contain the correct paths", async () => {
      expect(bundle.txs.sort()).toEqual(destPaths.sort() /* [...destPaths.map((p) => p.toString().split("/").at(-1)), "header"].sort() */);
    });
    it("should contain the correct header paths", async () => {
      expect(bundle.headerFile).toEqual(headerPath);
    });
  });

  describe("and given we have a bundle", () => {
    let bundle: Bundle;
    beforeEach(async () => {
      bundle = await bundleAndSignData(dataItems, signer);
    });
    describe("and we want to access the data", () => {
      it("should contain the data for every data item", async () => {
        for (let i = 0; i < dataItems.length; ++i) {
          const bundleDataItem = await (await bundle.get(i)).rawData();
          const orgDataItem = await dataItems[i].rawData();
          expect(Buffer.compare(bundleDataItem, orgDataItem)).toEqual(0);
        }
      });
    });
    describe("and we access out of range with dataItems.length", () => {
      it("should throw", async () => {
        await expect(bundle.get(dataItems.length)).rejects.toThrowError(new Error("Can't find by index"));
      });
    });

    describe("and we access with a way out of range index", () => {
      it("should throw", async () => {
        await expect(bundle.get(dataItems.length * 2)).rejects.toThrowError(
          numDataItems === 0 ? new Error("Can't find by index") : new RangeError("Index out of range"),
        );
      });
    });

    describe.skip("and given we want to convert the bundle to a transaction", () => {
      let tx: any;
      beforeEach(async () => {
        tx = await bundle.toTransaction(
          {
            target: "target",
            quantity: "quantity",
            reward: "reward",
            tags: [],
          },
          {
            transactions: {
              getTransactionAnchor: jest.fn().mockReturnValue("testAnchor"),
            },
          } as any,
          { kty: "kty", e: "e", n: "n" },
        );
      });
      it("should return a transaction", async () => {
        expect(tx.last_tx).toEqual("testAnchor");
        expect(tx.target).toEqual("target");
        expect(tx.quantity).toEqual("quantity");
        expect(tx.reward).toEqual("reward");
        expect(tx.tags).toEqual(
          [
            {
              name: "Bundle-Format",
              value: "binary",
            },
            {
              name: "Bundle-Version",
              value: "2.0.0",
            },
          ].map((t) => ({
            name: base64url.encode(t.name),
            value: base64url.encode(t.value),
          })),
        );
        expect(tx.owner).toEqual("n");
        expect(tx.data_root).toBeDefined();
        expect(tx.data_size).toBeDefined();
        expect(tx.chunks).toBeDefined();
        expect(tx.signature).toBeDefined();
      });
    });
    describe("given we call  getIds()", () => {
      it("should return the ids", async () => {
        expect(await bundle.getIds()).toEqual(dataItems.map((item) => item.id));
      });
    });

    describe("given we access the property .length ", () => {
      it("should return the length of the dataItems", async () => {
        expect(await bundle.length()).toEqual(dataItems.length);
      });
    });

    describe("given we call getRaw()", () => {
      it("should return the raw data", async () => {
        const raw = await bundle.getRaw();
        expect(raw).toBeDefined();
      });
    });

    describe("and we want to access the ids", () => {
      it("should contain the ids for every data item", async () => {
        for (let i = 0; i < dataItems.length; ++i) {
          const bundleDataItem = (await bundle.get(i)).id;
          const orgDataItem = dataItems[i].id;
          expect(bundleDataItem).toEqual(orgDataItem);
        }
      });
    });

    describe("and we use getById()", () => {
      it("should return the data item", async () => {
        for (const item of dataItems) {
          // @ts-expect-error normally private
          const bundleDataItem = await bundle.getById(item.id);
          const orgDataItem = item;
          expect(bundleDataItem).toEqual(orgDataItem);
        }
      });
      it("should throw for unknown id", async () => {
        // @ts-expect-error normally private
        await expect(() => bundle.getById("unknown")).rejects.toThrowError("Can't find by id");
      });
    });

    describe("and we use get", () => {
      describe("with a number as index", () => {
        it("should return the data item", async () => {
          for (let i = 0; i < dataItems.length; ++i) {
            const bundleDataItem = await bundle.get(i);
            const orgDataItem = dataItems[i];
            expect(bundleDataItem).toEqual(orgDataItem);
          }
        });
        it("should throw for out of range", async () => {
          await expect(bundle.get(dataItems.length)).rejects.toThrow();
        });
      });
      describe("and we use the id", () => {
        it("should return the data item", async () => {
          for (const item of dataItems) {
            const bundleDataItem = await bundle.get(item.id);
            const orgDataItem = item;
            expect(bundleDataItem).toEqual(orgDataItem);
          }
        });
      });

      describe("and we want to verify every data item", () => {
        it("should return true", async () => {
          for (let i = 0; i < dataItems.length; ++i) {
            const bundleDataItem = await bundle.get(i);
            expect(await FileDataItem.verify(bundleDataItem.filename)).toEqual(true);
          }
        });
      });
      describe("and given we want to access the items via the getter items", () => {
        it("should return the items", async () => {
          for await (const item of bundle.items) {
            expect(dataItems).toContainEqual(item);
          }
        });
      });

      describe.skip("and we signAndSubmit the bundle", () => {
        const signAndSubmitTagVariations = [
          {
            description: "no",
            tags: undefined,
          },
          {
            description: "empty",
            tags: [],
          },
          {
            description: "with tags",
            tags: [
              { name: "hello", value: "world" },
              { name: "lorem", value: "ipsum" },
            ],
          },
        ];
        describe.each(signAndSubmitTagVariations)("with $description tags", ({ tags }) => {
          let tx: Transaction;
          const arweaveMock = {
            api: {
              post: jest.fn().mockReturnValue({ status: 200, data: "some test data" }),
            },
            transactions: {
              sign: jest.fn().mockImplementation((tx) => {
                tx.signature = "testSignature";
              }),
              getTransactionAnchor: jest.fn().mockReturnValue("testAnchor"),
              getPrice: jest.fn().mockReturnValue(123),
            } as any as Transactions,
            stream: {
              uploadTransactionAsync: jest.fn().mockReturnValue(async (s: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                for await (const _ of s) {
                  true;
                }
              }),
              createTransactionAsync: jest.fn().mockReturnValue(async (s: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                for await (const _ of s) {
                  true;
                }
                return {
                  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/explicit-function-return-type
                  addTag: (_: any) => {},
                };
              }),
            },
          } as any as typeof Arweave;

          const jwkInterfaceMock = {
            k: "k",
            kty: "kty",
            e: "e",
            n: "n",
          } as any as JWKInterface;

          beforeEach(async () => {
            // @ts-expect-error types
            tx = await bundle.signAndSubmit(arweaveMock, jwkInterfaceMock, tags);
          });
          it("should return a transaction", () => {
            expect(tx).toBeDefined();
            expect(tx).toBeInstanceOf(Transaction);
          });
          it("should contain the last_tx", () => {
            expect(tx.last_tx).toEqual("testAnchor");
          });
          it("should contain the reward", () => {
            expect(tx.reward).toEqual(123);
          });
          it("should contain the signature", () => {
            expect(tx.signature).toEqual("testSignature");
          });
          it("should contain chunks", () => {
            expect(tx.chunks).toBeDefined();
          });
          it("should contain data_size", async () => {
            expect(tx.data_size).toBe((await bundle.getRaw()).length.toString());
          });
          it("should call the api", () => {
            // @ts-expect-error types
            expect(arweaveMock.api.post).toHaveBeenCalled();

            // @ts-expect-error types
            expect(arweaveMock.transactions.sign).toHaveBeenCalled();

            // @ts-expect-error types
            expect(arweaveMock.transactions.getTransactionAnchor).toHaveBeenCalled();

            // @ts-expect-error types
            expect(arweaveMock.transactions.getPrice).toHaveBeenCalled();
          });
          it("should set the correct tags", () => {
            expect(
              tx.tags /* .map((v) => ({
                name: base64url.decode(v.name),
                value: base64url.decode(v.value),
              })), */,
            ).toEqual(
              [
                {
                  name: "Bundle-Format",
                  value: "binary",
                },
                {
                  name: "Bundle-Version",
                  value: "2.0.0",
                },
                ...(tags ?? []),
              ].map((t) => ({
                name: base64url.encode(t.name),
                value: base64url.encode(t.value),
              })),
            );
          });
          // tx.data field is internally by upload-transaction-async set to zero. Thus we skip this test for now.
          it.skip("should set the correct data", async () => {
            expect(tx.data).toEqual(await bundle.getRaw());
          });
          it("should set the correct owner", () => {
            expect(tx.owner).toEqual(jwkInterfaceMock.n);
          });
          it("should set the format to 2", () => {
            expect(tx.format).toEqual(2);
          });
          it("should contain a data_root", () => {
            expect(tx.data_root).toBeDefined();
          });
          it("should contain a quantity", () => {
            expect(tx.quantity).toBeDefined();
          });
        });
      });
    });
  });
});

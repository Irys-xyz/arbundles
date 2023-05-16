import { createData } from "../ar-data-create";
import type Bundle from "../Bundle";
import type DataItem from "../DataItem";
import { EthereumSigner } from "../signing";
import { bundleAndSignData, longTo32ByteArray, sign } from "../../index";

const testDataVariations = [
  { description: "no", numDataItems: 0 },
  { description: "one", numDataItems: 1 },
  { description: "two", numDataItems: 2 },
  { description: "eight", numDataItems: 8 },
];

describe.each(testDataVariations)("given we have $description dataItems", ({ numDataItems }) => {
  let dataItems: DataItem[] = [];
  const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");
  beforeEach(async () => {
    dataItems = [];
    for (let i = 0; i < numDataItems; ++i) {
      const item = createData(`loremIpsumData_${i}`, signer);
      await item.sign(signer);
      dataItems.push(item);
    }
  });

  describe("and given we have a bundle", () => {
    let bundle: Bundle;
    beforeEach(async () => {
      bundle = await bundleAndSignData(dataItems, signer);
    });
    describe("and we want to access the data", () => {
      it("should contain the data for every data item", () => {
        for (let i = 0; i < dataItems.length; ++i) {
          const bundleDataItem = bundle.get(i).getRaw();
          const orgDataItem = dataItems[i].getRaw();
          expect(bundleDataItem).toEqual(orgDataItem);
        }
      });
    });
    describe("and we access out of range", () => {
      it("should throw", () => {
        expect(() => bundle.get(dataItems.length)).toThrow();
      });
    });

    describe("and we want to get the sizes of the data", () => {
      it("should contain the sizes for every data item", () => {
        const bundleDataItem = bundle.getSizes();
        const orgDataItem = dataItems.map((item) => item.getRaw().length);
        expect(bundleDataItem).toEqual(orgDataItem);
      });
    });

    describe("and we want to verify the bundle", () => {
      describe("and given the bundle is valid", () => {
        it("should return true", async () => {
          const result = await bundle.verify();
          expect(result).toEqual(true);
        });
      });
      describe("and given the bundle is invalid", () => {
        it("should return false", async () => {
          const invalidDataItem = createData("invalidData", signer);
          bundle.items.push(invalidDataItem);
          const result = await bundle.verify();
          expect(result).toEqual(false);
        });
      });
    });
    describe("and given we want to convert the bundle to a transaction", () => {
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
            createTransaction: jest.fn().mockReturnValue({
              addTag: jest.fn(),
              get id() {
                return "testId";
              },
            }),
          } as any,
          { kty: "kty", e: "e", n: "n" },
        );
      });
      it("should return a transaction", () => {
        expect(tx).toEqual({
          addTag: expect.any(Function),
          id: "testId",
        });
      });
      it("should add the bundle format tag", () => {
        expect(tx.addTag).toHaveBeenCalledWith("Bundle-Format", "binary");
      });
      it("should add the bundle version tag", () => {
        expect(tx.addTag).toHaveBeenCalledWith("Bundle-Version", "2.0.0");
      });
    });
    describe("given we call  getIds()", () => {
      it("should return the ids", () => {
        expect(bundle.getIds()).toEqual(dataItems.map((item) => item.id));
      });
    });

    describe("given we access the property .length ", () => {
      it("should return the length of the dataItems", () => {
        expect(bundle.length).toEqual(dataItems.length);
      });
    });

    describe("given we call  getRaw()", () => {
      it("should return the raw data", async () => {
        const raw = bundle.getRaw();
        const headers = new Uint8Array(64 * dataItems.length);
        const binaries = await Promise.all(
          dataItems.map(async (d, index) => {
            const id = d.isSigned() ? d.rawId : await sign(d, signer);
            const header = new Uint8Array(64);
            header.set(longTo32ByteArray(d.getRaw().byteLength), 0);
            header.set(id, 32);
            headers.set(header, 64 * index);
            return d.getRaw();
          }),
        ).then((a) => {
          return Buffer.concat(a);
        });

        const buffer = Buffer.concat([longTo32ByteArray(dataItems.length), headers, binaries]);
        expect(raw).toEqual(buffer);
      });
    });

    describe("and we want to access the ids", () => {
      it("should contain the ids for every data item", () => {
        for (let i = 0; i < dataItems.length; ++i) {
          const bundleDataItem = bundle.get(i).id;
          const orgDataItem = dataItems[i].id;
          expect(bundleDataItem).toEqual(orgDataItem);
        }
      });
    });

    describe("and we want to getIdBy", () => {
      it("should return the id", () => {
        for (let i = 0; i < dataItems.length; ++i) {
          const bundleDataItem = bundle.getIdBy(i);
          const orgDataItem = dataItems[i].id;
          expect(bundleDataItem).toEqual(orgDataItem);
        }
      });
      it("should throw for out of range", () => {
        expect(() => bundle.getIdBy(dataItems.length)).toThrow();
      });
    });

    describe.skip("and we use getById()", () => {
      it("should return the data item", () => {
        for (let i = 0; i < dataItems.length; ++i) {
          console.log(dataItems[i].id);
          // @ts-expect-error private property access
          const bundleDataItem = bundle.getById(dataItems[i].id);
          const orgDataItem = dataItems[i];
          expect(bundleDataItem).toEqual(orgDataItem);
        }
      });
    });

    describe("and we use get", () => {
      describe("with a number as index", () => {
        it("should return the data item", () => {
          for (let i = 0; i < dataItems.length; ++i) {
            const bundleDataItem = bundle.get(i);
            const orgDataItem = dataItems[i];
            expect(bundleDataItem).toEqual(orgDataItem);
          }
        });
        it("should throw for out of range", () => {
          expect(() => bundle.get(dataItems.length)).toThrow();
        });
      });
      describe.skip("and we use the id", () => {
        it("should return the data item", () => {
          for (let i = 0; i < dataItems.length; ++i) {
            const bundleDataItem = bundle.get(dataItems[i].id);
            const orgDataItem = dataItems[i];
            expect(bundleDataItem).toEqual(orgDataItem);
          }
        });
      });
    });
  });
});

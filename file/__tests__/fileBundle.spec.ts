/* eslint-disable @typescript-eslint/no-explicit-any */
import { createData } from "../createData";
import Bundle from "../FileBundle";
import { EthereumSigner } from "../../src/signing";
import { bundleAndSignData, FileDataItem } from "../index";
import base64url from "base64url";



const testDataVariations = [
    { description: "no", numDataItems: 0 },
    { description: "one", numDataItems: 1 },
    { description: "two", numDataItems: 2 },
    { description: "eight", numDataItems: 8 }
];



describe.each(testDataVariations)("given we have $description dataItems", ({ numDataItems }) => {
    let dataItems: FileDataItem[] = [];
    const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");
    beforeEach(async () => {
        dataItems = [];
        for (let i = 0; i < numDataItems; ++i) {
            dataItems.push(await createData(`loremIpsumData_${i}`, signer));
        }
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
                    expect(bundleDataItem).toEqual(orgDataItem);
                }
            });
        });
        describe("and we access out of range", () => {
            it("should throw", async () => {
                await expect(bundle.get(dataItems.length)).rejects.toThrow();
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


                        transactions: {
                            getTransactionAnchor: jest.fn().mockReturnValue("testAnchor"),
                        }

                    } as any,
                    { kty: "kty", e: "e", n: "n", }

                );
            });
            it("should return a transaction", async () => {
                expect(tx.last_tx).toEqual("testAnchor");
                expect(tx.target).toEqual("target");
                expect(tx.quantity).toEqual("quantity");
                expect(tx.reward).toEqual("reward");
                expect(tx.tags).toEqual([{
                    name: "Bundle-Format",
                    value: "binary",
                },
                {
                    name: "Bundle-Version",
                    value: "2.0.0",
                }
                ].map((t) => ({
                    name: base64url.encode(t.name),
                    value: base64url.encode(t.value),
                })));
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
                for (let i = 0; i < dataItems.length; ++i) {
                    // @ts-expect-error since its normally private
                    const bundleDataItem = await bundle.getById(dataItems[i].id);
                    const orgDataItem = dataItems[i];
                    expect(bundleDataItem).toEqual(orgDataItem);
                }
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
                    for (let i = 0; i < dataItems.length; ++i) {
                        const bundleDataItem = await bundle.get(dataItems[i].id);
                        const orgDataItem = dataItems[i];
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
        });
    });
});



/* eslint-disable @typescript-eslint/no-explicit-any */
import { createData } from "../createData";
import Bundle, { FileBundle } from "../FileBundle";
import { EthereumSigner } from "../../src/signing";
import { bundleAndSignData, FileDataItem } from "../index";
import base64url from "base64url";
import Transactions from "arweave/node/transactions";
import Arweave from "arweave/node/common";
import { JWKInterface } from "src";
import Transaction from "arweave/node/lib/transaction";
import path from "path";
import fs, { PathLike } from "fs";


const testDataVariations = [
    { description: "no", numDataItems: 0 },
    { description: "one", numDataItems: 1 },
    { description: "two", numDataItems: 2 },
    { description: "eight", numDataItems: 8 }
];

describe.each(testDataVariations)("given we have $description FileDataItems", ({ numDataItems }) => {
    let dataItems: FileDataItem[] = [];
    const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");
    beforeEach(async () => {
        dataItems = [];
        for (let i = 0; i < numDataItems; ++i) {
            dataItems.push(await createData(`loremIpsumData_${i}`, signer));
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
            orgBundle.txs.forEach(file => {
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
                expect((await bundleDataItem.rawData()).toString()).toEqual((await orgDataItem.rawData()).toString());
            }
        });
        it("should contain the correct paths", async () => {
            expect(bundle.txs.sort()).toEqual(destPaths.sort());
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
                    expect(bundleDataItem).toEqual(orgDataItem);
                }
            });
        });
        describe("and we access out of range with dataItems.length", () => {
            it("should throw", async () => {
                await expect(bundle.get(dataItems.length)).rejects.toThrowError(new RangeError("Index out of range"));
            });
        });

        describe("and we access with a way out of range index", () => {
            it("should throw", async () => {
                await expect(bundle.get(dataItems.length * 2)).rejects.toThrowError(new RangeError("Index out of range"));
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
            it("should throw for unknown id", async () => {
                // @ts-expect-error since its normally private
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
            describe("and given we want to access the items via the getter items", () => {
                it("should return the items", async () => {
                    for await (const item of bundle.items) {
                        expect(dataItems).toContainEqual(item);
                    }
                });
            });


            describe("and we signAndSubmit the bundle", () => {
                const signAndSubmitTagVariations = [{
                    description: "no", tags: undefined,
                }, {
                    description: "empty", tags: [],
                }, {
                    description: "with tags", tags: [
                        { name: "hello", value: "world" },
                        { name: "lorem", value: "ipsum" }
                    ],
                }];
                describe.each(signAndSubmitTagVariations)("with $description tags", ({ tags }) => {
                    let tx: Transaction;
                    const arweaveMock = {
                        api: {
                            post: jest.fn().mockReturnValue({ status: 200, data: "some test data" }),
                        },
                        transactions: {
                            sign: jest.fn().mockImplementation((tx) => { tx.signature = "testSignature"; }),
                            getTransactionAnchor: jest.fn().mockReturnValue("testAnchor"),
                            getPrice: jest.fn().mockReturnValue(123),
                        } as any as Transactions,
                    } as any as Arweave;

                    const jwkInterfaceMock = {
                        k: "k",
                        kty: "kty",
                        e: "e",
                        n: "n",
                    } as any as JWKInterface;



                    beforeEach(async () => {
                        tx = await bundle.signAndSubmit(
                            arweaveMock,
                            jwkInterfaceMock,
                            tags,
                        );
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
                        expect(tx.data_size).toBe(((await bundle.getRaw()).length).toString());
                    });
                    it("should call the api", () => {
                        expect(arweaveMock.api.post).toHaveBeenCalled();
                        expect(arweaveMock.transactions.sign).toHaveBeenCalled();
                        expect(arweaveMock.transactions.getTransactionAnchor).toHaveBeenCalled();
                        expect(arweaveMock.transactions.getPrice).toHaveBeenCalled();
                    });
                    it("should set the correct tags", () => {
                        expect(tx.tags).toEqual([
                            {
                                name: "Bundle-Format",
                                value: "binary",
                            },
                            {
                                name: "Bundle-Version",
                                value: "2.0.0",
                            },
                            ...(tags ?? [])].map((t) => ({
                                name: base64url.encode(t.name),
                                value: base64url.encode(t.value),
                            })));
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



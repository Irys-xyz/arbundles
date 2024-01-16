import type { DataItemCreateOptions } from "../../index";
import {
  createData,
  AptosSigner,
  DataItem,
  TypedEthereumSigner,
  PolygonSigner,
  SolanaSigner,
  ArweaveSigner,
  EthereumSigner,
  AlgorandSigner,
  NearSigner,
  HexSolanaSigner,
} from "../../index";
import base58 from "bs58";
import arweaveTestKey from "./test_key0.json";
import { createData as createFileData } from "../file";
import { Wallet } from "@ethersproject/wallet";
import base64url from "base64url";

const multiAptoskeyPairs = [
  {
    public: "0xd27d65f2649ac514ea9be961e51669ea8295613553db172d3bac72622b601801",
    private: "0xd878bed0e86252d296d7f5275b5aac46046a03906372831fad0f9bf764d69fe2",
  },
  {
    public: "0xd3c22056623f7a18ee7bc9604c57e63e395693b32a339e37ae5fcda77289532a",
    private: "0x3ec81992bdc4db449a96006ff17afab4a63ecc256bee61efd5b414ec0c670e93",
  },
  {
    public: "0x0270469f86a0dd56c7537dc26372c5afa15fa024be20becc147bd794cf90989c",
    private: "0x2c1106806f574a145e07efb7dd5ffb1886ef5ebac2f263117d1d0c4eea6e1b5b",
  },
];
const multiAptosWallets = multiAptoskeyPairs.map((pair) => new AptosSigner(pair.private, pair.public));
const multiAptosPublicKey = Buffer.alloc(32 * 32 + 1);
multiAptosWallets.forEach((w, i) => {
  multiAptosPublicKey.set(w.publicKey, i * 32);
});
multiAptosPublicKey.set(Buffer.from("2"), 1024);

const ethersWallet = new Wallet("0x37929fc21ab44ace162318acbbf4d24a41270b2aee18fd1cfb22e3fc3f4b4024");

const targetTestVariations = [
  {
    description: "undefined",
    target: undefined,
  },
  {
    description: "defined",
    target: "OXcT1sVRSA5eGwt2k6Yuz8-3e3g9WJi5uSE99CWqsBs",
  },
];

const anchorTestVariation = [
  {
    description: "undefined",
    anchor: undefined,
  },
  {
    description: "defined",
    anchor: "Math.apt'#]gng(36).substring(30)",
  },
];

const tagsTestVariations = [
  {
    description: "undefined",
    tags: undefined,
  },
  {
    description: "empty",
    tags: [],
  },
  {
    description: "singe",
    tags: [{ name: "Content-Type", value: "image/png" }],
  },
  {
    description: "multiple",
    tags: [
      { name: "Content-Type", value: "image/png" },
      { name: "hello", value: "world" },
      { name: "lorem", value: "ipsum" },
    ],
  },
];

const dataTestVariations = [
  {
    description: "emptyString",
    data: "",
  },
  {
    description: "smallString",
    data: "hello world",
  },
  {
    description: "largeString",
    data: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};':\",./<>?`~",
  },
  {
    description: "buffer",
    data: Buffer.from("some buffer data"),
  },
  {
    description: "empty buffer",
    data: Buffer.alloc(0),
  },
];

const signerTestVariations: {
  description: string;
  signer: any;
  ownerEncoding: string;
  signatureType: number;
}[] = [
  {
    description: "polygon",
    signer: new PolygonSigner("a62a05de6cd346c85cbdf5281532c38fff972558fd02e2cc1d447e435de10f18"),
    ownerEncoding: "hex",
    signatureType: 3,
  },
  {
    description: "solana",
    signer: new SolanaSigner("rUC3u5oz8W1Y2b8b2tq1K5AUWnXMiVV5o9Fx29yTJepFqFPfYPdwjainQhUvxfNuuhMJAGoawA3qYWzo8QhC5pj"),
    ownerEncoding: "base58",
    signatureType: 2,
  },
  {
    description: "hexsolanasigner",
    signer: new HexSolanaSigner("rUC3u5oz8W1Y2b8b2tq1K5AUWnXMiVV5o9Fx29yTJepFqFPfYPdwjainQhUvxfNuuhMJAGoawA3qYWzo8QhC5pj"),
    ownerEncoding: "base58",
    signatureType: 4,
  },
  {
    description: "ethereum",
    signer: new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f"),
    ownerEncoding: "hex",
    signatureType: 3,
  },
  {
    description: "aptos",
    signer: new AptosSigner(
      "0x389d91f729532f0d39ec48ac94e1e10f54bfc39f53bf59a1ff768892c9d4f1c8",
      "0x040b99ae55a3d3384943f638ed5f8eb1f4556feb86e6d082e658f8085b410f6a",
    ),
    ownerEncoding: "hex",
    signatureType: 2,
  },
  {
    description: "algorand",
    signer: new AlgorandSigner(
      Buffer.from([
        56, 94, 222, 123, 216, 159, 231, 137, 157, 220, 95, 82, 0, 147, 230, 221, 66, 221, 41, 63, 222, 222, 233, 216, 86, 14, 191, 239, 45, 249, 190,
        36, 104, 41, 242, 32, 164, 254, 124, 196, 60, 217, 120, 100, 169, 244, 183, 210, 5, 126, 24, 170, 27, 113, 169, 129, 129, 211, 44, 21, 119,
        215, 194, 22,
      ]),
      Buffer.from([
        56, 94, 222, 123, 216, 159, 231, 137, 157, 220, 95, 82, 0, 147, 230, 221, 66, 221, 41, 63, 222, 222, 233, 216, 86, 14, 191, 239, 45, 249, 190,
        36, 104, 41, 242, 32, 164, 254, 124, 196, 60, 217, 120, 100, 169, 244, 183, 210, 5, 126, 24, 170, 27, 113, 169, 129, 129, 211, 44, 21, 119,
        215, 194, 22,
      ]).slice(32),
    ),
    ownerEncoding: "hex",
    signatureType: 2,
  },
  {
    description: "arweave",
    signer: new ArweaveSigner(arweaveTestKey),
    ownerEncoding: "hex",
    signatureType: 1,
  },
  {
    description: "nearsigner",
    signer: new NearSigner("ed25519:rUC3u5oz8W1Y2b8b2tq1K5AUWnXMiVV5o9Fx29yTJepFqFPfYPdwjainQhUvxfNuuhMJAGoawA3qYWzo8QhC5pj"),
    ownerEncoding: "base58",
    signatureType: 2,
  },
  {
    description: "typedether",
    signer: new TypedEthereumSigner(ethersWallet.privateKey.slice(2)),
    ownerEncoding: "hex",
    signatureType: 7,
  },
  //    {
  //      description: "multiaptos",
  //      signer: (() => {
  //        return new MultiSignatureAptosSigner(multiAptosPublicKey,
  //          (() => {
  //            return async (message: Uint8Array) => {
  //              const signedMessage = [
  //                Buffer.from(await multiAptosWallets[0].sign(message)),
  //                Buffer.from(await multiAptosWallets[2].sign(message))
  //              ];
  //              return { signatures: signedMessage, bitmap: [0, 2] };
  //            };
  //          })());
  //      })(),
  //      ownerEncoding: "hex",
  //      signatureType: 6
  //    }
];

describe("Signers()", function () {
  describe("given we use ordinary data", () => {
    describe.each(signerTestVariations)("given we have a $description signer", (signerTestVariation) => {
      const signer = signerTestVariation.signer;
      describe.each(dataTestVariations)("and given we have $description data", (dataTestVariation) => {
        const data = dataTestVariation.data;
        describe.each(tagsTestVariations)("and given we have $description tags", (tagsTestVariation) => {
          describe.each(targetTestVariations)("and given we have a $description target", (targetTestVariation) => {
            describe.each(anchorTestVariation)("and given we have an $description anchor", (anchorTestVariation) => {
              describe("and given everything is valid", () => {
                const tags = tagsTestVariation.tags;
                const options: DataItemCreateOptions = {
                  target: targetTestVariation.target,
                  anchor: anchorTestVariation.anchor,
                  tags,
                };

                it.concurrent("should sign the dataItem", async function () {
                  const dataItem = createData(data, signer, options);
                  await dataItem.sign(signer);
                  expect(await dataItem.isValid()).toBe(true);
                });

                it.concurrent("should give the dataItem the required meta information", async () => {
                  const dataItem = createData(data, signer, options);
                  await dataItem.sign(signer);
                  let encodedOwner: string | Buffer =
                    signerTestVariation.ownerEncoding === "base58" ? base58.encode(dataItem.rawOwner) : dataItem.rawOwner.toString("hex");
                  switch (signerTestVariation.description) {
                    // aptos adds 0x before the hex string
                    case "aptos":
                      encodedOwner = "0x" + encodedOwner;
                      break;
                    // algorand signer stores Buffer internally
                    case "algorand":
                      encodedOwner = Buffer.from(encodedOwner as string, "hex");
                      break;
                    // arweave owner is stored in n
                    case "arweave":
                      encodedOwner = arweaveTestKey.n;
                      break;
                  }

                  let publicKey = signer.pk;
                  switch (signerTestVariation.description) {
                    // aptos multi signer doesnt contain .pk
                    // TODO: Multi signer doesn't work right
                    case "multiaptos":
                      publicKey = multiAptosPublicKey.toString("hex");
                      break;
                    // typed ether doesn't store in pk a usable comparable format,thus we need to use this solution
                    // TODO: Not comparable to normal public key, investigate it
                    case "typedether":
                      publicKey = "307861386463393037346439613131643562313635393063623665626635303334396433386436626531";
                      break;
                  }
                  expect(encodedOwner).toEqual(publicKey);
                  expect(dataItem.signatureType).toEqual(signerTestVariation.signatureType);
                  expect(dataItem.target).toEqual(targetTestVariation.target ?? "");
                  expect(dataItem.anchor).toEqual(base64url.encode(anchorTestVariation.anchor ?? ""));
                  expect(dataItem.tags).toEqual(tags ?? []);
                });

                it.concurrent("should let the dataItem contain the data", async () => {
                  const dataItem = createData(data, signer, options);
                  await dataItem.sign(signer);
                  expect(dataItem.rawData).toEqual(Buffer.from(data));
                });

                it.concurrent("should be correctly verifiable using DataItem.verify", async () => {
                  const dataItem = createData(data, signer, options);
                  await dataItem.sign(signer);
                  expect(await DataItem.verify(dataItem.getRaw())).toEqual(true);
                });
              });
            });
          });
        });
      });
    });
  });

  describe("given we use a file ", () => {
    describe.each(signerTestVariations)("given we have a $description signer", (signerTestVariation) => {
      if (signerTestVariation.description !== "nearsigner") {
        return;
      }

      const signer = signerTestVariation.signer;
      describe.each(dataTestVariations)("and given we have $description data", (dataTestVariation) => {
        const data = dataTestVariation.data;
        describe.each(tagsTestVariations)("and given we have $description tags", (tagsTestVariation) => {
          describe.each(targetTestVariations)("and given we have a $description target", (targetTestVariation) => {
            describe.each(anchorTestVariation)("and given we have an $description anchor", (anchorTestVariation) => {
              describe("and given everything is valid", () => {
                const tags = tagsTestVariation.tags;
                const options: DataItemCreateOptions = {
                  target: targetTestVariation.target,
                  anchor: anchorTestVariation.anchor,
                  tags,
                };

                it.concurrent("should sign the dataItem", async function () {
                  const dataItem = await createFileData(data, signer, options);
                  await dataItem.sign(signer);
                  expect(await dataItem.isValid()).toBe(true);
                });

                it("should give the dataItem the required meta information", async () => {
                  const dataItem = await createFileData(data, signer, options);
                  await dataItem.sign(signer);
                  let encodedOwner: string | Buffer =
                    signerTestVariation.ownerEncoding === "base58"
                      ? base58.encode(await dataItem.rawOwner())
                      : (await dataItem.rawOwner()).toString("hex");
                  switch (signerTestVariation.description) {
                    // aptos adds 0x before the hex string
                    case "aptos":
                      encodedOwner = "0x" + encodedOwner;
                      break;
                    // algorand signer stores Buffer internally
                    case "algorand":
                      encodedOwner = Buffer.from(encodedOwner as string, "hex");
                      break;
                    // arweave owner is stored in n
                    case "arweave":
                      encodedOwner = arweaveTestKey.n;
                      break;
                  }

                  let publicKey = signer.pk;
                  switch (signerTestVariation.description) {
                    // aptos multi signer doesnt contain .pk
                    case "multiaptos":
                      publicKey = multiAptosPublicKey.toString("hex");
                      break;
                    // typed ether doesn't store in pk a usable comparable format,thus we need to use this solution
                    // TODO: Not comparable to normal public key, investigate it
                    case "typedether":
                      publicKey = "MHhhOGRjOTA3NGQ5YTExZDViMTY1OTBjYjZlYmY1MDM0OWQzOGQ2YmUx";
                      break;
                  }
                  expect(encodedOwner).toEqual(publicKey);
                  expect(await dataItem.signatureType()).toEqual(signerTestVariation.signatureType);
                  expect(await dataItem.target()).toEqual(targetTestVariation.target ?? "");
                  expect(await dataItem.anchor()).toEqual(base64url.encode(anchorTestVariation.anchor ?? ""));
                  expect(await dataItem.tags()).toEqual(tags ?? []);
                });

                it.concurrent("should let the dataItem contain the data", async () => {
                  const dataItem = await createFileData(data, signer, options);
                  await dataItem.sign(signer);
                  expect(await dataItem.rawData()).toEqual(Buffer.from(data));
                });

                it.concurrent("should be correctly verifiable using DataItem.verify", async () => {
                  const dataItem = createData(data, signer, options);
                  await dataItem.sign(signer);
                  expect(await DataItem.verify(dataItem.getRaw())).toEqual(true);
                });
              });
            });
          });
        });
      });
    });
  });
  describe("given the ownerLength.bytelength doesn't match the signer.ownerLength", () => {
    it.concurrent("should throw an error", async () => {
      const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");
      // @ts-expect-error intentional mismatch
      signer.ownerLength = 10;
      expect(() => createData(Buffer.from("loremIpsum"), signer)).toThrowError("Owner must be 10 bytes, but was incorrectly 65");
    });
  });
});

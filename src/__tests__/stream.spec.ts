import { createReadStream, readFileSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import { processStream, streamSigner, streamExportForTesting } from "../../index";
import { Readable } from "stream";
import type { DataItemCreateOptions } from "../../index";
import { DataItem } from "../../index";
import { bundleAndSignData } from "../../index";
import {
  createData,
  PolygonSigner,
  SolanaSigner,
  ArweaveSigner,
  EthereumSigner,
  AlgorandSigner,
  AptosSigner,
  NearSigner,
  HexSolanaSigner,
} from "../../index";
import { tmpName } from "tmp-promise";
// import arweaveTestKey from "./test_key0.json";
// import fs from "fs";

const wallet0 = JSON.parse(readFileSync(path.join(__dirname, "test_key0.json")).toString());

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
    description: "smallString",
    data: "hello world",
  },
  {
    description: "largeString",
    data: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};':\",./<>?`~",
  },
];

const signerTestVariations: {
  description: string;
  signer: any;
  ownerEncoding: string;
  signerType: string;
}[] = [
  {
    description: "polygon",
    signer: new PolygonSigner("a62a05de6cd346c85cbdf5281532c38fff972558fd02e2cc1d447e435de10f18"),
    ownerEncoding: "hex",
    signerType: "ethereum",
  },
  {
    description: "solana",
    signer: new SolanaSigner("rUC3u5oz8W1Y2b8b2tq1K5AUWnXMiVV5o9Fx29yTJepFqFPfYPdwjainQhUvxfNuuhMJAGoawA3qYWzo8QhC5pj"),
    ownerEncoding: "base58",
    signerType: "ed25519",
  },
  {
    description: "hexsolanasigner",
    signer: new HexSolanaSigner("rUC3u5oz8W1Y2b8b2tq1K5AUWnXMiVV5o9Fx29yTJepFqFPfYPdwjainQhUvxfNuuhMJAGoawA3qYWzo8QhC5pj"),
    ownerEncoding: "base58",
    signerType: "solana",
  },
  {
    description: "ethereum",
    signer: new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f"),
    ownerEncoding: "hex",
    signerType: "ethereum",
  },
  {
    description: "aptos",
    signer: new AptosSigner(
      "0x389d91f729532f0d39ec48ac94e1e10f54bfc39f53bf59a1ff768892c9d4f1c8",
      "0x040b99ae55a3d3384943f638ed5f8eb1f4556feb86e6d082e658f8085b410f6a",
    ),
    ownerEncoding: "hex",
    signerType: "ed25519",
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
    signerType: "ed25519",
  },
  {
    description: "arweave",
    signer: new ArweaveSigner(wallet0),
    ownerEncoding: "hex",
    signerType: "arweave",
  },
  {
    description: "nearsigner",
    signer: new NearSigner("ed25519:rUC3u5oz8W1Y2b8b2tq1K5AUWnXMiVV5o9Fx29yTJepFqFPfYPdwjainQhUvxfNuuhMJAGoawA3qYWzo8QhC5pj"),
    ownerEncoding: "base58",
    signerType: "ed25519",
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

                it.concurrent("should give the dataItem the required information", async () => {
                  const dataItem = createData(data, signer, options);
                  const bundle = await bundleAndSignData([dataItem], signer);

                  const stream = Readable.from(bundle.getRaw());
                  for await (const dataItem of await processStream(stream)) {
                    expect(dataItem.sigName).toEqual(signerTestVariation.signerType);
                    expect(dataItem.anchor).toBeDefined();
                    expect(dataItem.target).toEqual(targetTestVariation.target ?? "");
                    expect(dataItem.tags).toEqual(tags ?? []);
                    expect(dataItem.id).toBeDefined();
                  }
                });
              });
            });
          });
        });
      });
    });
  });
});

describe("streamSigner", () => {
  describe("given we have a stream", () => {
    it("should return a signed stream", async () => {
      const tmpPath = await tmpName();
      writeFileSync(tmpPath, Buffer.from("102030405060708090a0", "hex"));
      const signer = signerTestVariations[0].signer;
      const signedStream = await streamSigner(createReadStream(tmpPath), createReadStream(tmpPath), signer);
      const data = new Promise<Buffer>((res, rej) => {
        const bufs: Buffer[] = [];
        signedStream.on("data", (chunk: Buffer) => bufs.push(chunk));
        signedStream.on("end", () => res(Buffer.concat(bufs)));
        signedStream.on("error", (err) => rej(`error converting stream - ${err}`));
      });
      await expect(data).resolves.toBeDefined();
      const item = new DataItem(await data);
      await expect(item.isValid()).resolves.toBe(true);
      unlinkSync(tmpPath);
    });
  });
  // afterAll(() => {
  //   if (existsSync("test.txt")) {
  //     unlinkSync("test.txt");
  //   }
  // });
});

const expectedOwner =
  "wpJ2SmgofIMmxC1UX5d6FPa3LVXbgPZsW5RIhDmYorQjeriATWQkpY9ma2JnDrKCwy1YTao2ADnQjJC0MH6YMrFJg4BV7bFHWaY4RSLF-IVgPjm1GMRSCQnn9tHIBkArrzRWbXS3BRtAj_b719c4-Um9Flq72vv8Z71Nbe3bPA9NTMhYif0XRIKTHgz5t2yz2tYgS6woWMvry2QSwV5SE6kegiUpJSN_u1ulrWHyzULP3tHhanm5qem6F8EiZuraDu6p-OrRZ5pafP4X6d7ErNRZ7Il869aF5THPx65W-3fC3DUo_B57h8R_50LOiyw4dJqb101M_7Y5SjNS0Q1ESQJxbsoOxhmelN6rznkiASNH_mO0bqVqhIy_TvYMWGo7WEPOQDuoob8j4hXLajeH70WZ-Sl6QGOc95bRtNT7F3KqO8uF99Hp3ONGJb5qpnDu7iimPlTYnG1CFHVKVnqzCViIn9viKgsAIrZifjrxE7Zj79lEBwxxsV8KWR3mPIVXnvmHPOe0FXjr056_G5YlCxdIRUxsV4X9GOKmW-GgbHmFOXLO7GV5kI-alEhmIHLH-0MP_Q51MK87VphoiIINc8SlUlOQBXBXLwVCTPerKp9axtdjYHUVLNO2zWONqzbLpAObyQ7Ats0N13S60MwyDVVWcBfyZvjRL2u5hVIGNuU";

/**
 * Processed bundle stream expectations with id and signature
 * removed as those are non-deterministic when using ArweaveSigner
 */
const dataItemExpectations = [
  {
    sigName: "arweave",
    target: "",
    anchor: "",
    owner: expectedOwner,
    tags: [],
    dataOffset: 1204,
    dataSize: 5,
  },
  {
    sigName: "arweave",
    target: "",
    anchor: "",
    owner: expectedOwner,
    tags: [],
    dataOffset: 2253,
    dataSize: 0,
  },
];

describe("Process Stream", function () {
  it("should read out a bundle correctly", async function () {
    const signer = new ArweaveSigner(wallet0);

    const helloItem = createData("hello", signer);
    const emptyItem = createData("", signer);

    const bundle = await bundleAndSignData([helloItem, emptyItem], signer);

    const stream = Readable.from(bundle.getRaw());
    const processedBundleStream = await processStream(stream);

    for (let i = 0; i < processedBundleStream.length; i++) {
      const dataItem = processedBundleStream[i];

      // We expect the processStream function to give us the same id and signature as the bundleAndSignData function
      expect(dataItem.id).toEqual(bundle.items[i].id);
      expect(dataItem.signature).toEqual(bundle.items[i].signature);

      // Remove non-deterministic fields from data item
      delete dataItem.id, delete dataItem.signature;
      expect(dataItem).toStrictEqual(dataItemExpectations[i]);
    }
  });
});

describe("getReader", () => {
  describe("given we have a stream", () => {
    it("should return a reader", () => {
      const reader = streamExportForTesting.getReader(new Readable());
      expect(reader).toBeDefined();
    });
  });
});

describe("readBytes", () => {
  describe("given we have a reader, a buffer and a length", () => {
    it("should read the bytes", async () => {
      const tmpPath = await tmpName();
      writeFileSync(tmpPath, Buffer.from("102030405060708090a0", "hex"));
      const reader = streamExportForTesting.getReader(createReadStream(tmpPath));
      const result = await streamExportForTesting.readBytes(reader, Buffer.allocUnsafe(0), 10);
      expect(Buffer.from(result).toString("hex")).toEqual("102030405060708090a0");
      unlinkSync(tmpPath);
    });

    // afterAll(() => {
    //   if (existsSync("test.txt")) {
    //     unlinkSync("test.txt");
    //   }
    // });
  });
});

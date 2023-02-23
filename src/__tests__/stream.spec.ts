import { bundleAndSignData } from "../../index";
import processStream from "../../stream";
import { Readable } from "stream";
import { createData, PolygonSigner, DataItemCreateOptions, SolanaSigner, ArweaveSigner, EthereumSigner, AlgorandSigner, AptosSigner, NearSigner, HexSolanaSigner } from "../../index";
import arweaveTestKey from "./test_key0.json";



const multiAptoskeyPairs = [{
  public: '0xd27d65f2649ac514ea9be961e51669ea8295613553db172d3bac72622b601801',
  private: '0xd878bed0e86252d296d7f5275b5aac46046a03906372831fad0f9bf764d69fe2'
}, {
  public: '0xd3c22056623f7a18ee7bc9604c57e63e395693b32a339e37ae5fcda77289532a',
  private: '0x3ec81992bdc4db449a96006ff17afab4a63ecc256bee61efd5b414ec0c670e93'
}, {
  public: '0x0270469f86a0dd56c7537dc26372c5afa15fa024be20becc147bd794cf90989c',
  private: '0x2c1106806f574a145e07efb7dd5ffb1886ef5ebac2f263117d1d0c4eea6e1b5b'
}];
const multiAptosWallets = multiAptoskeyPairs.map(pair => new AptosSigner(pair.private, pair.public));
const multiAptosPublicKey = Buffer.alloc(32 * 32 + 1);
multiAptosWallets.forEach((w, i) => {
  multiAptosPublicKey.set(w.publicKey, i * 32);
});
multiAptosPublicKey.set(Buffer.from("2"), 1024);


const targetTestVariations = [
  {
    description: "undefined", target: undefined,
  },
  {
    description: "defined", target: "OXcT1sVRSA5eGwt2k6Yuz8-3e3g9WJi5uSE99CWqsBs"
  },
];

const anchorTestVariation = [
  {
    description: "undefined", anchor: undefined,
  },
  {
    description: "defined", anchor: "Math.apt'#]gng(36).substring(30)",
  }
];

const tagsTestVariations = [
  {
    description: "undefined", tags: undefined
  },
  {
    description: "empty", tags: []
  },
  {
    description: "singe", tags: [{ name: "Content-Type", value: "image/png" }],
  },
  {
    description: "multiple", tags: [{ name: "Content-Type", value: "image/png" }, { name: "hello", value: "world" }, { name: "lorem", value: "ipsum" }],
  },
];

const dataTestVariations = [
  {
    description: "smallString", data: "hello world",
  },
  {
    description: "largeString", data: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};':\",./<>?`~",
  },
];

const signerTestVariations: {
  description: string,
  signer: any,
  ownerEncoding: string,
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
        "0x040b99ae55a3d3384943f638ed5f8eb1f4556feb86e6d082e658f8085b410f6a"),
      ownerEncoding: "hex",
      signerType: "ed25519"
    },
    {
      description: "algorand",
      signer: new AlgorandSigner(
        Buffer.from([56, 94, 222, 123, 216, 159, 231, 137, 157, 220, 95, 82, 0, 147, 230, 221, 66, 221, 41, 63, 222, 222, 233, 216, 86, 14, 191, 239, 45, 249, 190, 36, 104, 41, 242, 32, 164, 254, 124, 196, 60, 217, 120, 100, 169, 244, 183, 210, 5, 126, 24, 170, 27, 113, 169, 129, 129, 211, 44, 21, 119, 215, 194, 22]),
        Buffer.from([56, 94, 222, 123, 216, 159, 231, 137, 157, 220, 95, 82, 0, 147, 230, 221, 66, 221, 41, 63, 222, 222, 233, 216, 86, 14, 191, 239, 45, 249, 190, 36, 104, 41, 242, 32, 164, 254, 124, 196, 60, 217, 120, 100, 169, 244, 183, 210, 5, 126, 24, 170, 27, 113, 169, 129, 129, 211, 44, 21, 119, 215, 194, 22]).slice(32)),
      ownerEncoding: "hex",
      signerType: "ed25519"
    },
    {
      description: "arweave",
      signer: new ArweaveSigner(arweaveTestKey),
      ownerEncoding: "hex",
      signerType: "arweave"
    },
    {
      description: "nearsigner",
      signer: new NearSigner("ed25519:rUC3u5oz8W1Y2b8b2tq1K5AUWnXMiVV5o9Fx29yTJepFqFPfYPdwjainQhUvxfNuuhMJAGoawA3qYWzo8QhC5pj"),
      ownerEncoding: "base58",
      signerType : "ed25519"
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
                  tags
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


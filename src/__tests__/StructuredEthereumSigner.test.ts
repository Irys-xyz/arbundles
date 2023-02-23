import { ethers } from "ethers";
import { createData, TypedEthereumSigner } from "../../index";
import Crypto from "crypto";
const wallet = new ethers.Wallet(
  "0x37929fc21ab44ace162318acbbf4d24a41270b2aee18fd1cfb22e3fc3f4b4024",
);
const randWallet = ethers.Wallet.createRandom({});


const tagsTestVariations = [
  { description: "no tags", tags: undefined },
  { description: "empty tags", tags: [] },
  { description: "single tag", tags: [{ name: "Content-Type", value: "image/png" }] },
  { description: "multiple tags", tags: [{ name: "Content-Type", value: "image/png" }, { name: "hello", value: "world" }, { name: "lorem", value: "ipsum" }] },
];

const dataTestVariations = [
  { description: "empty string", data: "" },
  { description: "small string", data: "hello world" },
  { description: "large string", data: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};':\",./<>?`~" },
  { description: "empty buffer", data: Buffer.from([]) },
  { description: "small buffer", data: Buffer.from("hello world") },
  { description: "large buffer", data: Buffer.from("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};':\",./<>?`~") },
];



describe("Typed ethereum signer", function () {
  describe("given we have a signer", () => {
    const signer = new TypedEthereumSigner(wallet.privateKey.slice(2));

    describe("with known data and a fitting signature", () => {
      const data = Buffer.from("Hello, Bundlr!");
      const expectedSignature = Buffer.from([
        140, 2, 138, 150, 122, 68, 199, 26, 198, 74, 47, 114, 99, 135, 108, 240,
        113, 245, 239, 194, 227, 143, 162, 3, 206, 88, 222, 55, 208, 180, 209,
        146, 118, 34, 185, 134, 92, 159, 217, 48, 178, 160, 59, 180, 55, 233, 35,
        130, 109, 130, 150, 138, 151, 191, 101, 102, 180, 85, 50, 185, 151, 105,
        52, 121, 28,
      ]);

      it("should sign a known value ", async () => {
        const signature = await signer.sign(data);
        expect(signature).toEqual(expectedSignature);
      });

      it("should verify a known value", async () => {
        const isValid = await TypedEthereumSigner.verify(
          wallet.address,
          data,
          expectedSignature,
        );
        expect(isValid).toEqual(true);
      });


      it("should sign & verify an unknown value", async () => {
        const randData = Crypto.randomBytes(256);
        const signature = await signer.sign(randData);
        const isValid = await TypedEthereumSigner.verify(
          wallet.address,
          randData,
          signature,
        );
        expect(isValid).toEqual(true);
      });
    });

    describe("With an unknown wallet", () => {
      it("should sign & verify an unknown value", async () => {
        const randSigner = new TypedEthereumSigner(
          randWallet.privateKey.slice(2),
        );
        const randData = Crypto.randomBytes(256);
        const signature = await randSigner.sign(randData);
        const isValid = await TypedEthereumSigner.verify(
          randWallet.address,
          randData,
          signature,
        );
        expect(isValid).toEqual(true);
      });
    });
  });

  describe("and given we want to create a dataItem", () => {
    describe.each(tagsTestVariations)("with $description tags", ({ tags }) => {
      describe.each(dataTestVariations)("and with $description data", ({ data }) => {
        it("should create a valid dataItem", async () => {
          const signer = new TypedEthereumSigner(wallet.privateKey.slice(2));
          const item = createData(data, signer, { tags });
          await item.sign(signer);
          expect(await item.isValid()).toBe(true);
        });
        it("should set the correct tags", async () => {
          const signer = new TypedEthereumSigner(wallet.privateKey.slice(2));
          const item = createData(data, signer, { tags });
          await item.sign(signer);
          expect(item.tags).toEqual(tags ?? []);
        });
        it("should set the correct data", async () => {
          const signer = new TypedEthereumSigner(wallet.privateKey.slice(2));
          const item = createData(data, signer, { tags });
          await item.sign(signer);
          expect(item.rawData).toEqual(Buffer.from(data));
        });
      });
    });
  });
});



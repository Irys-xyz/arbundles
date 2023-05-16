import { Wallet } from "@ethersproject/wallet";
import { createData, TypedEthereumSigner } from "../../index";
import Crypto from "crypto";
import { createData as createFileData } from "../file";

const wallet = new Wallet("0x37929fc21ab44ace162318acbbf4d24a41270b2aee18fd1cfb22e3fc3f4b4024");
const randWallet = Wallet.createRandom({});

const tagsTestVariations = [
  { description: "no tags", tags: undefined },
  { description: "empty tags", tags: [] },
  { description: "single tag", tags: [{ name: "Content-Type", value: "image/png" }] },
  {
    description: "multiple tags",
    tags: [
      { name: "Content-Type", value: "image/png" },
      { name: "hello", value: "world" },
      { name: "lorem", value: "ipsum" },
    ],
  },
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
  const signer = new TypedEthereumSigner(wallet.privateKey.slice(2));
  describe("given we have a signer", () => {
    const data = Buffer.from("Hello, Bundlr!");
    const expectedSignature = Buffer.from([
      53, 205, 197, 211, 191, 21, 250, 235, 11, 155, 110, 133, 112, 16, 67, 233, 178, 149, 181, 238, 178, 158, 117, 92, 228, 192, 235, 219, 213, 150,
      184, 210, 55, 107, 171, 6, 92, 95, 1, 3, 160, 100, 244, 150, 48, 229, 179, 241, 126, 163, 89, 194, 141, 244, 17, 84, 254, 95, 194, 167, 12, 39,
      243, 237, 27,
    ]);

    describe("with a known wallet", () => {
      it("should sign a known value ", async () => {
        const signature = await signer.sign(data);
        expect(signature).toEqual(expectedSignature);
      });

      it("should verify a known value", async () => {
        const isValid = await TypedEthereumSigner.verify(wallet.address, data, expectedSignature);
        expect(isValid).toEqual(true);
        6;
      });
      it("should sign & verify an unknown value", async () => {
        const randData = Crypto.randomBytes(256);
        const signature = await signer.sign(randData);
        const isValid = await TypedEthereumSigner.verify(wallet.address, randData, signature);
        expect(isValid).toEqual(true);
      });
    });

    describe("With an unknown wallet", () => {
      it("should sign & verify an unknown value", async () => {
        const randSigner = new TypedEthereumSigner(randWallet.privateKey.slice(2));
        const randData = Crypto.randomBytes(256);
        const signature = await randSigner.sign(randData);
        const isValid = await TypedEthereumSigner.verify(randWallet.address, randData, signature);
        expect(isValid).toEqual(true);
      });
    });
  });

  describe("Create & Validate DataItems", () => {
    it("should create a valid dataItem", async () => {
      const signer = new TypedEthereumSigner(wallet.privateKey.slice(2));
      const data = "Hello, Bundlr!";
      const tags = [{ name: "Hello", value: "Bundlr" }];
      const item = createData(data, signer, { tags });
      await item.sign(signer);
      expect(await item.isValid()).toBe(true);
    });

    describe("With an unknown wallet", () => {
      it("should sign & verify an unknown value", async () => {
        const randSigner = new TypedEthereumSigner(randWallet.privateKey.slice(2));
        const randData = Crypto.randomBytes(256);
        const signature = await randSigner.sign(randData);
        const isValid = await TypedEthereumSigner.verify(randWallet.address, randData, signature);
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

  describe("and given we want to create a file data item", () => {
    describe.each(tagsTestVariations)("with $description tags", ({ tags }) => {
      describe.each(dataTestVariations)("and with $description data", ({ data }) => {
        it("should create a valid dataItem", async () => {
          const signer = new TypedEthereumSigner(wallet.privateKey.slice(2));
          const item = await createFileData(data, signer, { tags });
          await item.sign(signer);
          expect(await item.isValid()).toBe(true);
        });
        it("should set the correct tags", async () => {
          const signer = new TypedEthereumSigner(wallet.privateKey.slice(2));
          const item = await createFileData(data, signer, { tags });
          await item.sign(signer);
          expect(await item.tags()).toEqual(tags ?? []);
        });
        it("should set the correct data", async () => {
          const signer = new TypedEthereumSigner(wallet.privateKey.slice(2));
          const item = await createFileData(data, signer, { tags });
          await item.sign(signer);
          expect(await item.rawData()).toEqual(Buffer.from(data));
        });
      });
    });
  });
});

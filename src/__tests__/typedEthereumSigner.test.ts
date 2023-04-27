import { createData, TypedEthereumSigner } from "../../index";
import Crypto from "crypto";
import { Wallet } from "@ethersproject/wallet";
const wallet = new Wallet("0x37929fc21ab44ace162318acbbf4d24a41270b2aee18fd1cfb22e3fc3f4b4024");
const randWallet = Wallet.createRandom();

describe("Typed ethereum signer", function () {
  describe("sign & verify", () => {
    const signer = new TypedEthereumSigner(wallet.privateKey.slice(2));
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
  });
});

import { ethers } from "ethers";
import { createData, TypedEthereumSigner } from "../../index";
import Crypto from "crypto";
const wallet = new ethers.Wallet(
  "0x37929fc21ab44ace162318acbbf4d24a41270b2aee18fd1cfb22e3fc3f4b4024",
);
const randWallet = ethers.Wallet.createRandom();

describe("Typed ethereum signer", function () {
  describe("sign & verify", () => {
    const signer = new TypedEthereumSigner(wallet.privateKey.slice(2));
    const data = Buffer.from("Hello, Bundlr!");
    const expectedSignature = Buffer.from([188, 220, 82, 226, 88, 27, 234, 197, 186, 241, 99, 91, 39, 11, 49, 110, 190, 209, 73, 2, 55, 56, 113, 55, 216, 249, 133, 108, 249, 31, 207, 114, 57, 248, 2, 141, 253, 15, 18, 172, 231, 158, 25, 228, 188, 25, 157, 199, 118, 215, 74, 242, 12, 245, 218, 203, 83, 135, 231, 11, 184, 20, 0, 56, 28])

    describe("with a known wallet", () => {
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
        6;
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

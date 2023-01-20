import { ethers } from "ethers";
import { TypedEthereumSigner } from "../signing";
const wallet = new ethers.Wallet(
  "0x37929fc21ab44ace162318acbbf4d24a41270b2aee18fd1cfb22e3fc3f4b4024",
);
const randWallet = ethers.Wallet.createRandom();
import Crypto from "crypto";
import { createData } from "../ar-data-create";

describe("Typed ethereum signer", function () {
  describe("sign & verify", () => {
    const signer = new TypedEthereumSigner(wallet.privateKey.slice(2));
    const data = Buffer.from("Hello, Bundlr!");
    const expectedSignature = Buffer.from([
      140, 2, 138, 150, 122, 68, 199, 26, 198, 74, 47, 114, 99, 135, 108, 240,
      113, 245, 239, 194, 227, 143, 162, 3, 206, 88, 222, 55, 208, 180, 209,
      146, 118, 34, 185, 134, 92, 159, 217, 48, 178, 160, 59, 180, 55, 233, 35,
      130, 109, 130, 150, 138, 151, 191, 101, 102, 180, 85, 50, 185, 151, 105,
      52, 121, 28,
    ]);

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

  describe("Create & Validate DataItems", async () => {
    it("should create a valid dataItem", async () => {
      const signer = new TypedEthereumSigner(wallet.privateKey.slice(2));
      const data = "Hello, Bundlr!";
      const tags = [{ name: "Hello", value: "Bundlr" }];
      const item = createData(data, signer);
    });
  });
});

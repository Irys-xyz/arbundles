import getSignatureData from "../ar-data-base";
import { createData, EthereumSigner } from "../../index";

describe("getSignatureData", () => {
  describe("given we have a DataItem", () => {
    it("should return the signature", async () => {
      const testString = "test";
      const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");
      const item = createData(testString, signer);
      const result = await getSignatureData(item);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result).toEqual(Buffer.from("b21a5aa9dfb043fd68ed8558b8a2588d4140ffbdabadfab8fe27ae27bcbce7bc73dcfaf770dc96fd251055301100bdf1", "hex"));
    });
  });
});

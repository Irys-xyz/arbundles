import { unbundleData, bundleAndSignData, getSignatureAndId, sign } from "../ar-data-bundle";
import { createData } from "../ar-data-create";
import Bundle from "../Bundle";
import { EthereumSigner } from "../signing";

const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");

describe("bundleAndSignData", () => {
  describe("given we have DataItems", () => {
    const data1 = createData("loremIpsum", signer);
    const data2 = createData("helloWorld", signer);
    it("should return a Bundle", async () => {
      const result = await bundleAndSignData([data1, data2], signer);
      expect(result).toBeInstanceOf(Bundle);
    });
    it("should contain the proper data", async () => {
      const result = await bundleAndSignData([data1, data2], signer);
      expect(result.length).toEqual(2);
      expect(result.getSizes()).toEqual([data1.getRaw().length, data2.getRaw().length]);
      expect(result.items[0].getRaw()).toEqual(data1.getRaw());
      expect(result.items[1].getRaw()).toEqual(data2.getRaw());
    });
    it("should be verifiable", async () => {
      const result = await bundleAndSignData([data1, data2], signer);
      expect(await result.verify()).toBeTruthy();
    });
  });

  describe("given we dont have DataItems", () => {
    it("should return a bundle", async () => {
      const result = await bundleAndSignData([], signer);
      expect(result).toBeInstanceOf(Bundle);
    });
    it("should contain the proper data", async () => {
      const result = await bundleAndSignData([], signer);
      expect(result.length).toEqual(0);
      expect(result.getSizes()).toEqual([]);
    });
    it("should be verifiable", async () => {
      const result = await bundleAndSignData([], signer);
      expect(await result.verify()).toBeTruthy();
    });
  });
});

describe("sign", () => {
  describe("given we have a dataItem", () => {
    it("should sign and return item id", async () => {
      const dataItem = createData("loremIpsum", signer);
      expect(dataItem.isSigned()).toBeFalsy();
      const id = await sign(dataItem, signer);
      expect(dataItem.isSigned()).toBeTruthy();
      expect(id).toBeDefined();
    });
  });
});

describe.only("getSignatureAndId", () => {
  describe("given we have a dataItem", () => {
    it("should return the signature and id", async () => {
      const dataItem = createData("loremIpsum", signer);
      const { signature, id } = await getSignatureAndId(dataItem, signer);
      expect(signature.toString("hex")).toEqual(
        "e8565eaa672daa07a6526aa807acefd8ed36aceac3ae8e1dc1f3ab26f05af14b0342f65b6aca051fa18a373031d4f67f2ec14680caa3cbdd3cfe0aef149e68f91c",
      );
      expect(id.toString("hex")).toEqual("870a5e8ce1de391d904377c735402031e5bfd2362ebb6daace799a3ac76aaed6");
    });
  });
});

// TODO: This causes an overflow
describe.skip("unbundleData", () => {
  describe("given we have a Buffer", () => {
    it("should return a Bundle", () => {
      const testString = "test";
      const buffer = Buffer.from(testString);
      const result = unbundleData(buffer);
      expect(result).toBeInstanceOf(Bundle);
    });
  });
  describe("given we have a number", () => {
    it("should throw", () => {
      // @ts-expect-error invalid argument
      expect(() => unbundleData(5)).toThrow();
    });
  });
});

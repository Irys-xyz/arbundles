import type { DeepHashChunks } from "../deepHash";
import { deepHash, deepHashChunks, hashStream } from "../deepHash";

describe("deepHash", () => {
  describe("given a Uint8Array", () => {
    it("should return a Uint8Array", async () => {
      const data = new Uint8Array([1, 2, 3]);
      const result = await deepHash(data);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toEqual(48);
    });
    it("should return the correct hash", async () => {
      const data = new Uint8Array([1, 2, 3]);
      const result = await deepHash(data);
      expect(result).toEqual(Buffer.from("41300af79285f856e833164518c7ec4974f5869ec77ca3458113fe6c587680d050f9f6864fd77f9eb62bd4e2faea9ae8", "hex"));
    });
  });
  describe("given a uin8array with no data", () => {
    it("should return the correct hash", async () => {
      const data = new Uint8Array([]);
      const result = await deepHash(data);
      expect(result).toEqual(Buffer.from("fbf00cc444f5fea9dc3bedf62a13fba8ae87e7445fc910567a23bec4eb82fadb1143c433069314d8362983dc3c2e4a38", "hex"));
    });
  });

  describe("given a AsyncIterable<Buffer>", () => {
    it("should return a Uint8Array", async () => {
      const data = (async function* (): AsyncGenerator<Buffer, void> {
        yield Buffer.from([1, 2, 3]);
      })();
      const result = await deepHash(data);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toEqual(48);
    });
    it("should return the correct hash", async () => {
      const data = (async function* (): AsyncGenerator<Buffer, void> {
        yield Buffer.from([1, 2, 3]);
      })();
      const result = await deepHash(data);
      expect(result).toEqual(Buffer.from("41300af79285f856e833164518c7ec4974f5869ec77ca3458113fe6c587680d050f9f6864fd77f9eb62bd4e2faea9ae8", "hex"));
    });
  });

  describe("given DeepHashChunks", () => {
    it("should return a Uint8Array", async () => {
      const data: DeepHashChunks = [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])];
      const result = await deepHash(data);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toEqual(48);
    });
    it("should return the correct hash", async () => {
      const data: DeepHashChunks = [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])];
      const result = await deepHash(data);
      expect(result).toEqual(Buffer.from("4dacdcc81acd09f38c77a07a2a7ae81f77c61e6b97ee5cc7b92f3a7f258e8d5ba69d14d7d66070797b083873717c9896", "hex"));
    });
  });
});

describe("deepHashChunks", () => {
  describe("given  DeepHashChunks", () => {
    it("should return a Uint8Array", async () => {
      const data: DeepHashChunks = [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])];
      const result = await deepHashChunks(data, Buffer.from("test"));
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toEqual(48);
    });
    it("should return the correct hash", async () => {
      const data: DeepHashChunks = [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])];

      const result = await deepHashChunks(data, Buffer.from("test"));
      expect(result).toEqual(Buffer.from("2241894113b88da6daac09ef227a26e51423083c8d033fcc4f143a2a30f92ed3d163b2a66fcdf9ecc39da5a045ed9afc", "hex"));
    });
  });
});

describe("hashStream", () => {
  describe("given a stream", () => {
    it("should return a Uint8Array", async () => {
      const data = (async function* (): AsyncGenerator<Buffer, void> {
        yield Buffer.from([1, 2, 3]);
      })();
      const result = await hashStream(data);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toEqual(48);
    });
    it("should return the correct hash", async () => {
      const data = (async function* (): AsyncGenerator<Buffer, void> {
        yield Buffer.from([1, 2, 3]);
      })();
      const result = await hashStream(data);
      expect(result).toEqual(Buffer.from("86229dc6d2ffbeac7380744154aa700291c064352a0dbdc77b9ed3f2c8e1dac4dc325867d39ddff1d2629b7a393d47f6", "hex"));
    });
  });
});

import { byteArrayToLong, longTo8ByteArray, shortTo2ByteArray, longTo16ByteArray, longTo32ByteArray } from "../utils";

describe("utils", () => {
  describe("longTo8ByteArray", () => {
    describe("given a small number", () => {
      it("should return a Uint8Array", () => {
        const long = 123;
        const result = longTo8ByteArray(long);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toEqual(8);
        expect(result[0]).toEqual(123);
      });
    });
    describe("given a large number", () => {
      it("should return a Uint8Array", () => {
        const long = 123456789;
        const result = longTo8ByteArray(long);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toEqual(8);
        expect(result[0]).toEqual(0x15);
        expect(result[1]).toEqual(0xcd);
        expect(result[2]).toEqual(0x5b);
        expect(result[3]).toEqual(0x07);
        expect(result[4]).toEqual(0);
        expect(result[5]).toEqual(0);
        expect(result[6]).toEqual(0);
        expect(result[7]).toEqual(0);
      });
    });
  });

  describe("shortTo2ByteArray", () => {
    describe("given a small number", () => {
      it("should return a Uint8Array", () => {
        const long = 123;
        const result = shortTo2ByteArray(long);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toEqual(2);
        expect(result[0]).toEqual(123);
      });
    });
    describe("given a large number", () => {
      it("should throw an error", () => {
        const long = 123456789;
        expect(() => shortTo2ByteArray(long)).toThrow();
      });
    });
  });

  describe("longTo16ByteArray", () => {
    describe("given a small number", () => {
      it("should return a Uint8Array", () => {
        const long = 123;
        const result = longTo16ByteArray(long);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toEqual(16);
        expect(result[0]).toEqual(123);
      });
    });
    describe("given a large number", () => {
      it("should return a Uint8Array", () => {
        const long = 123456789;
        const result = longTo16ByteArray(long);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toEqual(16);
        expect(result[0]).toEqual(0x15);
        expect(result[1]).toEqual(0xcd);
        expect(result[2]).toEqual(0x5b);
        expect(result[3]).toEqual(0x07);
        expect(result[4]).toEqual(0);
        expect(result[5]).toEqual(0);
        expect(result[6]).toEqual(0);
        expect(result[7]).toEqual(0);
        expect(result[8]).toEqual(0);
        expect(result[9]).toEqual(0);
        expect(result[10]).toEqual(0);
        expect(result[11]).toEqual(0);
        expect(result[12]).toEqual(0);
        expect(result[13]).toEqual(0);
        expect(result[14]).toEqual(0);
        expect(result[15]).toEqual(0);
      });
    });
  });

  describe("longTo32ByteArray", () => {
    describe("given a small number", () => {
      it("should return a Uint8Array", () => {
        const long = 123;
        const result = longTo32ByteArray(long);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toEqual(32);
        expect(result[0]).toEqual(123);
      });
    });
    describe("given a large number", () => {
      it("should return a Uint8Array", () => {
        const long = 9876543210;
        // 9876543210 in hex is 0x24 0x61 0x54 0x22
        const result = longTo32ByteArray(long);
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toEqual(32);
        expect(result[0]).toEqual(0xea);
        expect(result[1]).toEqual(0x16);
        expect(result[2]).toEqual(0xb0);
        expect(result[3]).toEqual(0x4c);
        expect(result[4]).toEqual(0x02);
        expect(result[5]).toEqual(0);
        expect(result[6]).toEqual(0);
        expect(result[7]).toEqual(0);
        expect(result[8]).toEqual(0);
        expect(result[9]).toEqual(0);
        expect(result[10]).toEqual(0);
        expect(result[11]).toEqual(0);
        expect(result[12]).toEqual(0);
        expect(result[13]).toEqual(0);
        expect(result[14]).toEqual(0);
        expect(result[15]).toEqual(0);
        expect(result[16]).toEqual(0);
        expect(result[17]).toEqual(0);
        expect(result[18]).toEqual(0);
        expect(result[19]).toEqual(0);
        expect(result[20]).toEqual(0);
        expect(result[21]).toEqual(0);
        expect(result[22]).toEqual(0);
        expect(result[23]).toEqual(0);
        expect(result[24]).toEqual(0);
        expect(result[25]).toEqual(0);
        expect(result[26]).toEqual(0);
        expect(result[27]).toEqual(0);
        expect(result[28]).toEqual(0);
        expect(result[29]).toEqual(0);
        expect(result[30]).toEqual(0);
        expect(result[31]).toEqual(0);
      });
    });
  });

  describe("byteArrayToLong", () => {
    describe("given a small number", () => {
      it("should return a number", () => {
        const byteArray = new Uint8Array([123]);
        const result = byteArrayToLong(byteArray);
        expect(result).toEqual(123);
      });
    });
    describe("given a large number", () => {
      it("should return a number", () => {
        const byteArray = new Uint8Array([0xea, 0x16, 0xb0, 0x4c, 0x02]);
        const result = byteArrayToLong(byteArray);
        expect(result).toEqual(9876543210);
      });
    });
  });
});

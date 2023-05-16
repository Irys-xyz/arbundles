/* eslint-disable no-fallthrough */
/* eslint-disable no-case-declarations */
import { byteArrayToLong, longTo16ByteArray, longTo32ByteArray, longTo8ByteArray, shortTo2ByteArray } from "../utils";

const byteArrays = {
  2: { 12: [12, 0], 65535: [255, 255] },
  8: { 65535: [255, 255, 0, 0, 0, 0, 0, 0], 995234558: [254, 18, 82, 59, 0, 0, 0, 0], 281474976710655: [255, 255, 255, 255, 255, 255, 0, 0] },
  16: { 281474976710655: [255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  32: {
    281474976710655: [255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    34566888345923: [67, 209, 25, 59, 112, 31, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
};

function randomNumber(min, max): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe("Utility functions", () => {
  describe("With known values", () => {
    describe("toNByteArray", () => {
      //   test.each(Object.keys(byteArrays))("%s bytes", (key) => {
      Object.keys(byteArrays).forEach((key) => {
        const set = byteArrays[key];
        test.each(Object.keys(set))(`${key} bytes %s`, (k) => {
          const arr = set[k];
          const v = byteArrayToLong(arr);
          expect(v).toEqual(Number(k));
        });
      });
    });

    describe("byteArrayToLong", () => {
      Object.keys(byteArrays).forEach((key) => {
        const set = byteArrays[key];
        test.each(Object.keys(set))(`${key} bytes %s`, (k) => {
          const arr = set[k];
          const v = byteArrayToLong(arr);
          expect(v).toEqual(Number(k));
        });
      });
    });
  });

  describe("With random values", () => {
    const numbers = Array.from({ length: randomNumber(1024, 99_999) }, (_) => randomNumber(0, Number.MAX_SAFE_INTEGER));
    it(`Should convert to an array of length ${numbers.length} and back`, () => {
      // generate random values

      for (const number of numbers) {
        const bytesRequired = Math.ceil(Math.log2(number + 1) / 8);
        let b: Uint8Array, v: number;
        switch (true) {
          // @ts-expect-error fallthrough
          case bytesRequired <= 2:
            b = shortTo2ByteArray(number);
            v = byteArrayToLong(b);
            expect(v).toEqual(number);
          // @ts-expect-error fallthrough
          case bytesRequired <= 8:
            b = longTo8ByteArray(number);
            v = byteArrayToLong(b);
            expect(v).toEqual(number);
          // @ts-expect-error fallthrough
          case bytesRequired <= 16:
            b = longTo16ByteArray(number);
            v = byteArrayToLong(b);
            expect(v).toEqual(number);
          case bytesRequired <= 32:
            b = longTo32ByteArray(number);
            v = byteArrayToLong(b);
            expect(v).toEqual(number);
        }
      }
    });
  });

  describe("with values that are too large", () => {
    expect(() => shortTo2ByteArray(70_000)).toThrow();
    expect(() => shortTo2ByteArray(-1)).toThrow();
  });
});

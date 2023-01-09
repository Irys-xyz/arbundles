export function longTo8ByteArray(long: number): Uint8Array {
  // we want to represent the input as a 8-bytes array
  const byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

  for (let index = 0; index < byteArray.length; index++) {
    const byte = long & 0xff;
    byteArray[index] = byte;
    long = (long - byte) / 256;
  }

  return Uint8Array.from(byteArray);
}

export function shortTo2ByteArray(long: number): Uint8Array {
  if (long > (2 ^ (32 - 1))) throw new Error("Short too long");
  // we want to represent the input as a 8-bytes array
  const byteArray = [0, 0];

  for (let index = 0; index < byteArray.length; index++) {
    const byte = long & 0xff;
    byteArray[index] = byte;
    long = (long - byte) / 256;
  }

  return Uint8Array.from(byteArray);
}

export function longTo16ByteArray(long: number): number[] {
  // we want to represent the input as a 8-bytes array
  const byteArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (let index = 0; index < byteArray.length; index++) {
    const byte = long & 0xff;
    byteArray[index] = byte;
    long = (long - byte) / 256;
  }

  return byteArray;
}

export function longTo32ByteArray(long: number): Uint8Array {
  // we want to represent the input as a 8-bytes array
  const byteArray = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
  ];

  for (let index = 0; index < byteArray.length; index++) {
    const byte = long & 0xff;
    byteArray[index] = byte;
    long = (long - byte) / 256;
  }

  return Uint8Array.from(byteArray);
}

export function byteArrayToLong(byteArray: Uint8Array): number {
  let value = 0;
  for (let i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i];
  }
  return value;
}
// this is bugged for comparing buffers
// export function arraybufferEqual(buf1: Uint8Array, buf2: Uint8Array): boolean {
//   const _buf1 = buf1.buffer;
//   const _buf2 = buf2.buffer;

//   if (_buf1 === _buf2) {
//     return true;
//   }

//   if (_buf1.byteLength !== _buf2.byteLength) {
//     return false;
//   }

//   const view1 = new DataView(_buf1);
//   const view2 = new DataView(_buf2);

//   let i = _buf1.byteLength;
//   while (i--) {
//     if (view1.getUint8(i) !== view2.getUint8(i)) {
//       return false;
//     }
//   }

//   return true;
// }

// @ts-expect-error These variables are defined in extension environments
const isExtension = typeof browser !== "undefined" || typeof chrome !== "undefined";

export const isBrowser =
  (typeof window !== "undefined" && typeof window.document !== "undefined") ||
  isExtension;

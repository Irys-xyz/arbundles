// taken from AVSC - Tap.prototype.writeLong
function encodeLong(n: number): Buffer {
  let buf = Buffer.alloc(0);
  let f, m;
  let offset = 0;

  if (n >= -1073741824 && n < 1073741824) {
    // Won't overflow, we can use integer arithmetic.
    m = n >= 0 ? n << 1 : (~n << 1) | 1;
    do {
      buf = Buffer.concat([buf, Buffer.alloc(1)]);
      buf[offset] = m & 0x7f;
      m >>= 7;
    } while (m && (buf[offset++] |= 0x80));
  } else {
    // We have to use slower floating arithmetic.
    f = n >= 0 ? n * 2 : -n * 2 - 1;
    do {
      buf = Buffer.concat([buf, Buffer.alloc(1)]);
      buf[offset] = f & 0x7f;
      f /= 128;
    } while (f >= 1 && (buf[offset++] |= 0x80));
  }
  return buf;
}

export function serializeTags(tags: { name: string; value: string }[]): Buffer {
  let byt = Buffer.from("");
  if (!tags) return byt;
  // number of tags
  byt = Buffer.concat([byt, encodeLong(tags.length)]);
  for (const tag of tags) {
    if (!tag?.name || !tag?.value)
      throw new Error(
        `Invalid tag format for ${tag}, expected {name:string, value: string}`,
      );
    const name = Buffer.from(tag.name);
    const value = Buffer.from(tag.value);
    // encode the length of the field using variable integer encoding
    byt = Buffer.concat([byt, encodeLong(name.byteLength)]);
    // then the value
    byt = Buffer.concat([byt, name]);
    byt = Buffer.concat([byt, encodeLong(value.byteLength)]);
    byt = Buffer.concat([byt, value]);
  }
  // 0 terminator
  byt = Buffer.concat([byt, encodeLong(0)]);
  return byt;
}

export function deserializeTags(
  bTags: Buffer,
): { name: string; value: string }[] {
  if (bTags.length === 0) return [];
  const tags = [];
  let offset = 0;
  let length = 0;
  // Taken from AVSC - Tap.prototype.readLong
  const decodeLong = (buf: Buffer): number => {
    let n = 0;
    let k = 0;
    let b, h, f, fk;

    do {
      b = buf[offset++];
      h = b & 0x80;
      n |= (b & 0x7f) << k;
      k += 7;
    } while (h && k < 28);

    if (h) {
      // Switch to float arithmetic, otherwise we might overflow.
      f = n;
      fk = 268435456; // 2 ** 28.
      do {
        b = buf[offset++];
        f += (b & 0x7f) * fk;
        fk *= 128;
      } while (b & 0x80);
      return (f % 2 ? -(f + 1) : f) / 2;
    }

    return (n >> 1) ^ -(n & 1);
  };
  // while there are still tags to read...
  while ((length = decodeLong(bTags)) > 0) {
    for (let i = 0; i < length; i++) {
      // decode length
      const nameLength = decodeLong(bTags);
      // decode value
      const name = bTags.slice(offset, (offset += nameLength)).toString();
      const valueLength = decodeLong(bTags);
      const value = bTags.slice(offset, (offset += valueLength)).toString();
      // reconstruct tag object
      tags.push({ name, value });
    }
  }
  return tags;
}

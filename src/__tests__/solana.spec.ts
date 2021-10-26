import { DataItemCreateOptions } from '../ar-data-base';
import { createData } from '..';
import fs from 'fs';
import SolanaSigner from '../signing/chains/solana/SolanaSigner';

describe("Solana signing tests", function() {
  it('should sign and verify', async function() {
    const _d: DataItemCreateOptions = {
      tags: [
        { name: "Content-Type", value: "image/png" }
      ]
    };

    const signer = new SolanaSigner("rUC3u5oz8W1Y2b8b2tq1K5AUWnXMiVV5o9Fx29yTJepFqFPfYPdwjainQhUvxfNuuhMJAGoawA3qYWzo8QhC5pj");

    const d = createData(fs.readFileSync("large_llama.png"), signer, _d);
    await d.sign(signer);

    expect(d.signatureType).toEqual(2);
    expect(d.tags).toEqual([{ name: "Content-Type", value: "image/png" }]);
    expect(await d.isValid()).toBe(true);
  });
})

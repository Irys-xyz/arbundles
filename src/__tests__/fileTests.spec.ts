import { bundleAndSignData, createData } from '../file';
import { readFileSync } from 'fs';
import path from 'path';
import ArweaveSigner from '../signing/chains/arweave/ArweaveSigner';
import sizeof from 'object-sizeof';
import * as fs from 'fs';
import DataItem from '../DataItem';

const wallet0 = JSON.parse(
  readFileSync(path.join(__dirname, 'test_key0.json')).toString(),
);

describe("file tests", function() {
  it("should get all correct data", async function() {
    const signer = new ArweaveSigner(wallet0);
    const d = { data: "hi" };

    const data = await createData(d, signer);
    expect(data.signatureType).toEqual(1);
    expect(data.owner).toEqual(wallet0.n);
    expect(data.anchor).toEqual("");
    expect(data.tags).toEqual([]);
    expect(data.target).toEqual("");
    expect(data.rawData.toString()).toEqual("hi");
  });

  it("should bundle correctly", async function() {
    const signer = new ArweaveSigner(wallet0);
    const tags = [{
      name: "Content-Type",
      value: "image/png"
    }];
    const data = { data: await fs.promises.readFile("large_llama.png").then(r => Buffer.from(r.buffer)), tags };
    const d = new Array(3).fill(data);
    const bundle = await bundleAndSignData(d, signer);
    console.log(sizeof(bundle));

    const first = await bundle.get(0);
    const second = await bundle.get(1);
    const third = await bundle.get(2);

    expect(await DataItem.verify(fs.readFileSync(first.filename))).toBe(true);
    expect(await DataItem.verify(fs.readFileSync(second.filename))).toBe(true);
    expect(await DataItem.verify(fs.readFileSync(third.filename))).toBe(true);
    expect(first.owner).toEqual(wallet0.n);
    expect(second.owner).toEqual(wallet0.n);
    expect(third.owner).toEqual(wallet0.n);
  }, 1000000000);
})

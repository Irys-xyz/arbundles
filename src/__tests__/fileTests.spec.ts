import { bundleAndSignData, createData } from '../file';
import { readFileSync } from 'fs';
import path from 'path';
import ArweaveSigner from '../signing/chains/arweave/ArweaveSigner';

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
    const d = [{ data: "hi" }];
    const bundle = await bundleAndSignData(d, signer);
    console.log(bundle);
  });
})

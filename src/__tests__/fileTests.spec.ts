import { bundleAndSignData, createData, FileDataItem } from '../file';
import { createData as cd } from "../ar-data-create";
import { readFileSync } from 'fs';
import path from 'path';
import ArweaveSigner from '../signing/chains/arweave/ArweaveSigner';
import sizeof from 'object-sizeof';
import * as fs from 'fs';
import DataItem from '../DataItem';
import Arweave from 'arweave';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  logging: false
});

const wallet0 = JSON.parse(
  readFileSync(path.join(__dirname, 'test_key0.json')).toString(),
);

arweave.wallets.getAddress(wallet0)
  .then(async (address) => {
    return address;
  })
  .then(async (address) => console.log(await arweave.wallets.getBalance(address)))


describe("file tests", function() {
  it("should verify ts file", async function() {
    const signer = new ArweaveSigner(wallet0);
    const d = { data: fs.readFileSync("Archive/bundler.d.ts") };
    const data = await createData(d, signer);
    await data.sign(signer);

    expect(await FileDataItem.verify(data.filename)).toBe(true);
  });

  it("should get all correct data", async function() {
    const signer = new ArweaveSigner(wallet0);
    const d = {
      data: 'tasty',
    }

    const data = await createData(d, signer);
    await data.sign(signer);

    console.log(await data.owner());

    console.log(await DataItem.verify(fs.readFileSync(data.filename)));

    const im = await cd(d, signer);
    await im.sign(signer);

    expect(fs.readFileSync(data.filename).slice(514)).toEqual(im.getRaw().slice(514));

    expect(await data.isValid()).toBe(true);
    console.log(await data.signature());
    expect(await data.signatureType()).toEqual(1);
    expect(await data.owner()).toEqual(wallet0.n);
    expect(await data.anchor()).toEqual("");
    expect(await data.tags()).toEqual([]);
    expect(await data.target()).toEqual("");
    expect((await data.rawData()).toString()).toEqual("tasty");
    expect(await FileDataItem.verify(data.filename)).toEqual(true);
  });

  it("should bundle correctly", async function() {
    const signer = new ArweaveSigner(wallet0);
    const tags = [{
      name: "Content-Type",
      value: "image/png"
    }];
    const data = { data: await fs.promises.readFile("large_llama.png").then(r => Buffer.from(r.buffer)), tags };
    const d = new Array(5).fill(data);
    const bundle = await bundleAndSignData(d, signer);
    console.log(sizeof(bundle));

    const tx = await bundle.toTransaction(arweave, wallet0);

    console.log(tx.data_size);

    console.log(await bundle.getIds());
    const first = await bundle.get(0);
    const second = await bundle.get(1);
    const third = await bundle.get(2);

    expect(await DataItem.verify(fs.readFileSync(first.filename))).toBe(true);
    expect(await DataItem.verify(fs.readFileSync(second.filename))).toBe(true);
    expect(await DataItem.verify(fs.readFileSync(third.filename))).toBe(true);
    expect(await first.owner()).toEqual(wallet0.n);
    expect(await second.owner()).toEqual(wallet0.n);
    expect(await third.owner()).toEqual(wallet0.n);
  }, 1000000000);

  it("Should post correctly", async function() {
    const signer = new ArweaveSigner(wallet0);
    const tags = [{
      name: "Content-Type",
      value: "image/png"
    }];
    const data = { data: await fs.promises.readFile("large_llama.png").then(r => Buffer.from(r.buffer)), tags };
    const d = new Array(3).fill(data);
    const bundle = await bundleAndSignData(d, signer);
    const tx = await bundle.toTransaction(arweave, wallet0);
    await arweave.transactions.sign(tx, wallet0);
    console.log(tx.id);
    const response = await arweave.transactions.post(tx);

    expect(response.status).toEqual(200);
    console.log(response.statusText);
    console.log(response.status);
    console.log(await bundle.getRaw());
  });

  it("Test posted tx", async function() {
    const tx = await arweave.transactions.getData("viUi_gCJyL2Wgjd0AcBtHjkNw0Vgj7v-HshQF8NRcBY");
    console.log(tx);
  }, 10000000)

  it("Test unbundle", async function() {
    const signer = new ArweaveSigner(wallet0);
    const tags = [{
      name: "Content-Type",
      value: "image/png"
    }];
    const data = { data: await fs.promises.readFile("large_llama.png").then(r => Buffer.from(r.buffer)), tags };

    const num = 100;
    const items = new Array(num);

    for (let i = 0; i < num; i++) {
      items[i] = await createData(data, signer);

    }

    const bundle = await bundleAndSignData(items, signer);
    const tx = await bundle.signAndSubmit(arweave, wallet0);

    console.log(tx.id);
    console.log(await bundle.getIds());
  }, 1000000)

  it("Small test", async function() {
    const signer = new ArweaveSigner(wallet0);
    const tags = [{
      name: "Content-Type",
      value: "image/png"
    }];
    const data = { data: await fs.promises.readFile("large_llama.png").then(r => Buffer.from(r.buffer)), tags };

    const d = await createData(data, signer);
    await d.sign(signer);

    const bundle = await bundleAndSignData([d], signer);

    const _tx = await bundle.toTransaction(arweave, wallet0);

    _tx.reward = (+_tx.reward * 2).toString();

    await arweave.transactions.sign(_tx, wallet0);

  })
})

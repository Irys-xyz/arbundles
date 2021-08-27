import { readFileSync } from 'fs';
import path from 'path';
import { Buffer } from 'buffer';
import { DataItemCreateOptions } from '../ar-data-base';
import { bundleAndSignData, createData, DataItem } from '..';
import * as fs from 'fs';
import ArweaveSigner from '../signing/chains/arweave/ArweaveSigner';
import sizeof from 'object-sizeof';
import { performance } from 'perf_hooks';
import base64url from 'base64url';
import Arweave from 'arweave';

const wallet0 = JSON.parse(
  readFileSync(path.join(__dirname, 'test_key0.json')).toString(),
);

const arweave = Arweave.init({
  host: 'arweave.dev',
  port: 443,
  protocol: 'https'
});

arweave.wallets.ownerToAddress(wallet0.n)
  .then(r => {
    arweave.wallets.getBalance(r)
      .then(console.log)
  });

describe('Creating and indexing a data item', function() {
  it('should create with all and get', async function() {
    await arweave.wallets.ownerToAddress(wallet0.n)
      .then(async (r) => {
        await arweave.wallets.getBalance(r)
          .then(w => console.log(arweave.ar.winstonToAr(w)))
      });

    const _d: DataItemCreateOptions = {
      data: 'tasty',
      target: 'pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A',
      anchor: 'Math.apt\'#]gng(36).substring(30)',
      tags: [{
        name: "testname",
        value: "testvalue"
      }]
    };

    const signer = new ArweaveSigner(wallet0);

    const d = await createData(_d, signer);
    await d.sign(signer);
    expect(Buffer.from(d.rawData).toString()).toBe('tasty');
    expect(d.owner).toBe(wallet0.n);
    expect(d.target).toBe('pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A');
    expect(d.anchor).toEqual('Math.apt\'#]gng(36).substring(30)');
    expect(d.tags).toEqual([{
      name: "testname",
      value: "testvalue"
    }]);
    expect(await DataItem.verify(d.getRaw(), { pk: wallet0.n })).toEqual(true);
  });

  it('should create with no target and get', async function() {
    const _d: DataItemCreateOptions = {
      data: 'tasty',
      anchor: 'Math.apt\'#]gng(36).substring(30)',
      tags: [{
        name: "testname",
        value: "testvalue"
      }]
    };

    const signer = new ArweaveSigner(wallet0);

    const d = await createData(_d, signer);
    await d.sign(signer);
    expect(Buffer.from(d.rawData).toString()).toBe('tasty');
    expect(d.owner).toBe(wallet0.n);
    expect(d.target).toBe('');
    expect(d.anchor).toEqual('Math.apt\'#]gng(36).substring(30)');
    expect(d.tags).toEqual([{
      name: "testname",
      value: "testvalue"
    }]);
    expect(await DataItem.verify(d.getRaw(), { pk: wallet0.n })).toEqual(true);
  });

  it('should create with no anchor and get', async function() {
    const _d: DataItemCreateOptions = {
      data: 'tasty',
      target: 'pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A',
      tags: [{
        name: "testname",
        value: "testvalue"
      }]
    };

    const signer = new ArweaveSigner(wallet0);

    const d = await createData(_d, signer);
    await d.sign(signer);
    expect(Buffer.from(d.rawData).toString()).toBe('tasty');
    expect(d.owner).toBe(wallet0.n);
    expect(d.target).toBe('pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A');
    expect(d.anchor).toEqual('');
    expect(d.tags).toEqual([{
      name: "testname",
      value: "testvalue"
    }]);
    expect(await DataItem.verify(d.getRaw(), { pk: wallet0.n })).toEqual(true);
  });

  it('should create with no target or anchor and get', async function() {
    const _d: DataItemCreateOptions = {
      data: 'tasty',
      tags: [{
        name: "testname",
        value: "testvalue"
      }]
    };

    const signer = new ArweaveSigner(wallet0);

    const d = await createData(_d, signer);
    await d.sign(signer);
    expect(Buffer.from(d.rawData).toString()).toBe('tasty');
    expect(d.owner).toBe(wallet0.n);
    expect(d.target).toBe('');
    expect(d.anchor).toEqual('');
    expect(d.tags).toEqual([{
      name: "testname",
      value: "testvalue"
    }]);
    expect(await DataItem.verify(d.getRaw(), { pk: wallet0.n })).toEqual(true);
  });


  it('Test Bundle', async function() {
    const signer = new ArweaveSigner(wallet0);
    const _dataItems: DataItemCreateOptions[] = [{
      data: 'tasty',
      target: 'pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A',
      anchor: 'Math.randomgng(36).substring(30)',
      tags: [{ name: 'x', value: 'y' }],
    }];

    const bundle = await bundleAndSignData(_dataItems, signer);
    const dataItems = bundle.items;

    expect(bundle.length).toEqual(1);
    expect(dataItems.length).toEqual(1);
    expect(Buffer.from(dataItems[0].rawData).toString()).toBe('tasty');
    expect(dataItems[0].owner).toBe(wallet0.n);
    expect(Buffer.from(dataItems[0].target).toString()).toBe('pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A');
    expect(dataItems[0].anchor).toEqual('Math.randomgng(36).substring(30)');
    expect(dataItems[0].tags).toEqual([{ name: 'x', value: 'y' }]);
    expect(await DataItem.verify(dataItems[0].getRaw())).toEqual(true);
  });

  it('Test bugs', async function() {
    const signer = new ArweaveSigner(wallet0);
    const bundle = await bundleAndSignData([
      { data: '1984' },
      { data: '4242' },
    ], signer);

    expect(bundle.get(1).rawData).toEqual(Buffer.from('4242'));
  });

  it('Test file verification', async function() {
    const signer = new ArweaveSigner(wallet0);
    const _d: DataItemCreateOptions = {
      data: 'tasty',
      anchor: 'Math.apt\'#]gng(36).substring(30)',
      tags: [{
        name: "test",
        value: "hbjhjh"
      }]
    };

    const d = await createData(_d, signer);
    await d.sign(signer);
    const binary = d.getRaw();
    fs.writeFileSync('test', binary);
    const fileBinary = fs.readFileSync('test');
    expect(fileBinary).toEqual(binary);
  });

  it('Test failed file verification', async function() {
    fs.writeFileSync('test', Buffer.from('hi'));
    const fileBinary = fs.readFileSync('test');
    expect(await DataItem.verify(fileBinary)).toEqual(false);
  });

  it('should verify', async function() {
    const signer = new ArweaveSigner(wallet0);
    const bundle = await bundleAndSignData([
      { data: '1984', tags: [{ name: "gdf", value: "gfgdf" }] },
      { data: '4242' },
    ], signer);

    expect(bundle.verify()).toEqual(true);
  });

  it("should bundle in loop", async function() {
    const signer = new ArweaveSigner(wallet0);
    const tags = [{
      name: "Content-Type",
      value: "image/png"
    }];
    const data = { data: await fs.promises.readFile("large_llama.png").then(r => Buffer.from(r.buffer)), tags };
    const items = new Array(25_000).fill(data);
    let now = performance.now();
    const ids = [];
    for (let i = 0; i < 3000; i++) {
      if (i % 1000 === 0) {
        const now2 = performance.now();
        console.log(`${i} - ${now2 - now}ms`);
        now = now2;
      }      const item = await createData(data, signer);
      const id = base64url(await item.sign(signer));
      ids.push(id);
      items[i] = item;
    }
    console.log(sizeof(items));

    const bundle = await bundleAndSignData(items, signer);

    const tx = await bundle.toTransaction(arweave, wallet0);

    await arweave.transactions.sign(tx, wallet0);

    const uploader = await arweave.transactions.getUploader(tx);

    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
    }

    console.log(ids.slice(0, 10));
  }, 1000000000);

  it("should get all correct data", async function() {
    const signer = new ArweaveSigner(wallet0);
    const d = { data: "hi", tags: [{name: "", value: ""}] };

    const data = await createData(d, signer);
    console.log(data.getRaw().length);
    await data.sign(signer);
    expect(data.signatureType).toEqual(1);
    expect(data.owner).toEqual(wallet0.n);
    expect(data.anchor).toEqual("");
    expect(data.tags).toEqual([{name: "", value: ""}]);
    expect(data.target).toEqual("");
    expect(data.rawData.toString()).toEqual("hi");
    expect(await DataItem.verify(data.getRaw(), { pk: data.owner })).toEqual(true);
  });

  it("Test unbundle", async function() {
    const signer = new ArweaveSigner(wallet0);
    const tags = [{
      name: "Content-Type",
      value: "image/png"
    }];
    const data = { data: await fs.promises.readFile("large_llama.png").then(r => r.buffer) as Buffer, tags };

    const num = 10;
    const items = new Array(num);

    for (let i = 0; i < num; i++) {
      items[i] = await createData(data, signer);
    }
    const bundle = await bundleAndSignData(items, signer);

    console.log(bundle.verify());

    const tx = await bundle.toTransaction(arweave, wallet0);

    await arweave.transactions.sign(tx, wallet0);

    console.log(tx.id);

    const uploader = await arweave.transactions.getUploader(tx);

    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
    }

  }, 1000000)
});

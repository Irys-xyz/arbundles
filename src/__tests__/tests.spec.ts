import { readFileSync } from "fs";
import path from "path";
import { Buffer } from "buffer";
import { DataItemCreateOptions } from "../ar-data-base";
import { bundleAndSignData, createData, DataItem } from "..";
import * as fs from "fs";
import ArweaveSigner from "../signing/chains/arweave/ArweaveSigner";
import sizeof from "object-sizeof";
import { performance } from "perf_hooks";
import base64url from "base64url";
import Arweave from "arweave";
import { FileDataItem } from '../file';

const wallet0 = JSON.parse(
  readFileSync(path.join(__dirname, "test_key0.json")).toString()
);

const arweave = Arweave.init({
  host: "arweave.dev",
  port: 443,
  protocol: "https",
});

arweave.wallets.ownerToAddress(wallet0.n).then((r) => {
  arweave.wallets.getBalance(r).then(console.log);
});

describe("Creating and indexing a data item", function () {
  it("should create with all and get", async function () {
    // await arweave.wallets.ownerToAddress(wallet0.n)
    //   .then(async (r) => {
    //     await arweave.wallets.getBalance(r)
    //       .then(w => console.log(arweave.ar.winstonToAr(w)))
    //   });

    const _d: DataItemCreateOptions = {
      anchor: "Math.apt'#]gng(36).substring(30)",
      tags: [
        { name: "Content-Type", value: "image/png" }
      ]
    };

    const signer = new ArweaveSigner(wallet0);

    const d = await createData(fs.readFileSync("large_llama.png"), signer, _d);
    await d.sign(signer);

    console.log(d.id);
    const response = await d.sendToBundler("http://localhost:10000");
    // const response = await d.sendToBundler().catch(console.log);
    // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // // @ts-ignore
    // console.log(response.status);

    const file = "test";
    fs.writeFileSync(file, d.getRaw());
    const fileItem = new FileDataItem(file);
    console.log((await fileItem.rawAnchor()).toString());
    console.log(await fileItem.target());
    console.log(await fileItem.owner());
    console.log(await fileItem.tags());
    console.log(await fileItem.rawData());



    expect(d.rawData).toStrictEqual(fs.readFileSync("large_llama.png"));
    expect(d.owner).toBe(wallet0.n);
    expect(d.target).toBe("");
    expect(d.anchor).toEqual("Math.apt'#]gng(36).substring(30)");
    expect(d.tags).toEqual([
      { name: "Content-Type", value: "image/png" }
    ]);
    expect(await DataItem.verify(d.getRaw())).toEqual(true);

    console.log(response.status);
  }, 5000000);

  it("should create with no target and get", async function () {
    const _d: DataItemCreateOptions = {
      anchor: "Math.apt'#]gng(36).substring(30)",
      tags: [
        {
          name: "testname",
          value: "testvalue",
        },
      ],
    };

    const signer = new ArweaveSigner(wallet0);

    const d = await createData("tasty", signer, _d);
    await d.sign(signer);
    expect(Buffer.from(d.rawData).toString()).toBe("tasty");
    expect(d.owner).toBe(wallet0.n);
    expect(d.target).toBe("");
    expect(d.anchor).toEqual("Math.apt'#]gng(36).substring(30)");
    expect(d.tags).toEqual([
      {
        name: "testname",
        value: "testvalue",
      },
    ]);
    expect(await DataItem.verify(d.getRaw())).toEqual(true);
  });

  it("should create with no anchor and get", async function () {
    const _d: DataItemCreateOptions = {
      target: "pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A",
      tags: [
        {
          name: "testname",
          value: "testvalue",
        },
      ],
    };

    const signer = new ArweaveSigner(wallet0);

    const d = await createData("tasty", signer, _d);
    await d.sign(signer);
    expect(Buffer.from(d.rawData).toString()).toBe("tasty");
    expect(d.owner).toBe(wallet0.n);
    expect(d.target).toBe("pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A");
    expect(d.anchor).toEqual("");
    expect(d.tags).toEqual([
      {
        name: "testname",
        value: "testvalue",
      },
    ]);
    expect(await DataItem.verify(d.getRaw())).toEqual(true);
  });

  it("should create with no target or anchor and get", async function () {
    const _d: DataItemCreateOptions = {
      tags: [
        {
          name: "testname",
          value: "testvalue",
        },
      ],
    };

    const signer = new ArweaveSigner(wallet0);

    const d = await createData("tasty", signer, _d);
    await d.sign(signer);
    expect(Buffer.from(d.rawData).toString()).toBe("tasty");
    expect(d.owner).toBe(wallet0.n);
    expect(d.target).toBe("");
    expect(d.anchor).toEqual("");
    expect(d.tags).toEqual([
      {
        name: "testname",
        value: "testvalue",
      },
    ]);
    expect(await DataItem.verify(d.getRaw())).toEqual(true);
  });

  it("Test Bundle", async function () {
    const signer = new ArweaveSigner(wallet0);
    const _dataItems = [
      createData(
        "tasty",
        signer,
        {
        target: "pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A",
        anchor: "Math.randomgng(36).substring(30)",
        tags: [{ name: "x", value: "y" }],
      }),
    ];

    const bundle = await bundleAndSignData(_dataItems, signer);
    const dataItems = bundle.items;

    expect(bundle.length).toEqual(1);
    expect(dataItems.length).toEqual(1);
    expect(Buffer.from(dataItems[0].rawData).toString()).toBe("tasty");
    expect(dataItems[0].owner).toBe(wallet0.n);
    expect(Buffer.from(dataItems[0].target).toString()).toBe(
      "pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A"
    );
    expect(dataItems[0].anchor).toEqual("Math.randomgng(36).substring(30)");
    expect(dataItems[0].tags).toEqual([{ name: "x", value: "y" }]);
    expect(await DataItem.verify(dataItems[0].getRaw())).toEqual(true);
  });

  it("Test bugs", async function () {
    const signer = new ArweaveSigner(wallet0);
    const bundle = await bundleAndSignData(
      [createData("1894", signer), createData("4242", signer)],
      signer
    );

    expect(bundle.get(1).rawData).toEqual(Buffer.from("4242"));
  });

  it("Test file verification", async function () {
    const signer = new ArweaveSigner(wallet0);
    const _d: DataItemCreateOptions = {
      anchor: "Math.apt'#]gng(36).substring(30)",
      tags: [
        {
          name: "test",
          value: "hbjhjh",
        },
      ],
    };

    const d = await createData("tasty", signer, _d);
    await d.sign(signer);
    const binary = d.getRaw();
    fs.writeFileSync("test", binary);
    const fileBinary = fs.readFileSync("test");
    expect(fileBinary).toEqual(binary);
  });

  it("Test failed file verification", async function () {
    fs.writeFileSync("test", Buffer.from("hi"));
    const fileBinary = fs.readFileSync("test");
    expect(await DataItem.verify(fileBinary)).toEqual(false);
  });

  it("should verify", async function () {
    const signer = new ArweaveSigner(wallet0);

    const tags = [{ name: "gdf", value: "gfgdf" }];

    const items = [
      createData("1984", signer, { tags }),
      createData("4242", signer)
    ]
    const bundle = await bundleAndSignData(
      items,
      signer
    );

    console.log(bundle.getIds());
    expect(await bundle.verify()).toEqual(true);
  });

  it("should bundle in loop", async function () {
    const signer = new ArweaveSigner(wallet0);
    const tags = [
      {
        name: "Content-Type",
        value: "image/png",
      },
    ];
    const data = {
      tags,
    };
    const items = new Array(25_000).fill(data);
    let now = performance.now();
    const ids = [];
    for (let i = 0; i < 3000; i++) {
      if (i % 1000 === 0) {
        const now2 = performance.now();
        console.log(`${i} - ${now2 - now}ms`);
        now = now2;
      }
      const item = await createData(
        await fs.promises
          .readFile("large_llama.png")
          .then((r) => Buffer.from(r.buffer)),
        signer,
        data
      );

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
      console.log(
        `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
      );
    }

    console.log(ids.slice(0, 10));
  }, 1000000000);

  it("should get all correct data", async function () {
    const signer = new ArweaveSigner(wallet0);
    const d = { tags: [{ name: "", value: "" }] };

    const data = await createData("hi", signer, d);
    console.log(data.getRaw().length);
    await data.sign(signer);
    expect(data.signatureType).toEqual(1);
    expect(data.owner).toEqual(wallet0.n);
    expect(data.anchor).toEqual("");
    expect(data.tags).toEqual([{ name: "", value: "" }]);
    expect(data.target).toEqual("");
    expect(data.rawData.toString()).toEqual("hi");
    expect(await DataItem.verify(data.getRaw())).toEqual(true);
  });

  it("Test unbundle", async function () {
    const signer = new ArweaveSigner(wallet0);
    const tags = [
      {
        name: "Content-Type",
        value: "text/html",
      },
    ];
    const data = { tags };

    const num = 1;
    const items = new Array(num);

    for (let i = 0; i < num; i++) {
      items[i] = await createData("hello", signer, data);
    }
    const bundle = await bundleAndSignData(items, signer);

    console.log(bundle.verify());

    const tx = await bundle.toTransaction(arweave, wallet0);

    await arweave.transactions.sign(tx, wallet0);

    console.log(tx.id);
    console.log(bundle.getIds());

    const uploader = await arweave.transactions.getUploader(tx);

    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(
        `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
      );
    }
  }, 1000000);

  it("should not leak", function() {

    const myTags = [
      { name: 'App-Name', value: 'myApp' },
      { name: 'App-Version', value: '1.0.0' }
    ];

    const signer = new ArweaveSigner(wallet0);

    for (let i = 0; i < 300000000; i++) {
      const opts = { tags: myTags };
      const data = new Uint8Array(1_000_000_000).fill(10);
      const item = createData(data, signer, opts);
      const used = process.memoryUsage();
      console.log(used);
      console.log(item);
    }
  });

  it("should send loads", async function() {
    const signer = new ArweaveSigner(wallet0);
    const tags = [{ name: "Content-Type", value: "image/png" }];
    const data = createData(fs.readFileSync("large_llama.png"), signer, { tags });

    await data.sign(signer);
    for (let i = 0; i < 2; i++) {
      console.log(data.id);
      await data.sendToBundler("http://bundler.arweave.net:10000");
    }
  }, 50000)
});

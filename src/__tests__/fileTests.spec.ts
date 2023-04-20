import { DataItem, ArweaveSigner } from "../../index";
import { bundleAndSignData, createData, FileDataItem } from "../../src/file/index";
import { readFileSync } from "fs";
import path from "path";
import * as fs from "fs";
// import Arweave from "arweave";

// const arweave = Arweave.init({
//   host: "arweave.net",
//   port: 443,
//   protocol: "https",
//   logging: false,
// });

const wallet0 = JSON.parse(
  readFileSync(path.join(__dirname, "test_key0.json")).toString(),
);

describe("file tests", function () {
  it("should verify ts file", async function () {
    const signer = new ArweaveSigner(wallet0);
    // const d = fs.readFileSync("test");
    const data = await createData(fs.createReadStream("test"), signer);
    await data.sign(signer);

    expect(await FileDataItem.verify(data.filename)).toBe(true);
  });

  it("should get all correct data", async function () {
    const signer = new ArweaveSigner(wallet0);
    const opts = {
      anchor: "fgggggggggggggggggggggggggllllll",
    };

    const data = await createData("tasty", signer, opts);
    await data.sign(signer);

    expect(await data.isValid()).toBe(true);
    expect(await data.signatureType()).toEqual(1);
    expect(await data.owner()).toEqual(wallet0.n);
    expect(await data.rawAnchor().then((r) => r.toString())).toEqual(
      "fgggggggggggggggggggggggggllllll",
    );
    expect(await data.tags()).toEqual([]);
    expect(await data.target()).toEqual("");
    expect((await data.rawData()).toString()).toEqual("tasty");
    expect(await FileDataItem.verify(data.filename)).toEqual(true);
  }, 10000000);

  it("should bundle correctly", async function () {
    const signer = new ArweaveSigner(wallet0);
    const tags = [
      {
        name: "Content-Type",
        value: "image/png",
      },
    ];
    const data = "hello";
    const d = [
      await createData(data, signer, { tags }),
      await createData(data, signer, { tags }),
      await createData(data, signer, { tags }),
    ];
    const bundle = await bundleAndSignData(d, signer);

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

  // it("Should post correctly", async function () {
  //   const signer = new ArweaveSigner(wallet0);
  //   const tags = [
  //     {
  //       name: "Content-Type",
  //       value: "image/png",
  //     },
  //   ];

  //   const d = [await createData("", signer, { tags })];

  //   const bundle = await bundleAndSignData(d, signer);
  //   const tx = await bundle.toTransaction({}, arweave, wallet0);
  //   await arweave.transactions.sign(tx, wallet0);
  //   const response = await arweave.transactions.post(tx);

  //   expect(response.status).toEqual(200);
  // });

  // it("Test posted tx", async function () {
  //   const tx = await arweave.transactions.getData(
  //     "viUi_gCJyL2Wgjd0AcBtHjkNw0Vgj7v-HshQF8NRcBY"
  //   );
  //   console.log(tx);
  // }, 10000000);
  //
  // it("Test unbundle", async function () {
  //   const signer = new ArweaveSigner(wallet0);
  //   const tags = [
  //     {
  //       name: "Content-Type",
  //       value: "image/png",
  //     },
  //   ];
  //   const data = await fs.promises
  //       .readFile("test")
  //       .then((r) => Buffer.from(r.buffer)) as never;
  //
  //   const num = 100;
  //   const items = new Array(num);
  //
  //   for (let i = 0; i < num; i++) {
  //     items[i] = await createData(data, signer, { tags });
  //   }
  //
  //   const bundle = await bundleAndSignData(items, signer);
  //   const tx = await bundle.signAndSubmit(arweave, wallet0);
  //
  //   console.log(tx.id);
  //   console.log(await bundle.getIds());
  // }, 1000000);
  //
  // it("Small test", async function () {
  //   const signer = new ArweaveSigner(wallet0);
  //   const tags = [
  //     {
  //       name: "Content-Type",
  //       value: "image/png",
  //     },
  //   ];
  //   const data = await fs.promises
  //       .readFile("test")
  //       .then((r) => Buffer.from(r.buffer)) as never;
  //
  //   const d = await createData(data, signer, { tags });
  //   await d.sign(signer);
  //
  //   const bundle = await bundleAndSignData([d], signer);
  //
  //   const _tx = await bundle.toTransaction(arweave, wallet0);
  //
  //   _tx.reward = (+_tx.reward * 2).toString();
  //
  //   await arweave.transactions.sign(_tx, wallet0);
  // });

  // it("should get 200", async function() {
  //   const signer = new ArweaveSigner(wallet0);
  //   const tags = [
  //     {
  //       name: "Content-Type",
  //       value: "image/png",
  //     },
  //   ];
  //   const data = await fs.promises
  //       .readFile("test")
  //       .then((r) => Buffer.from(r.buffer)) as never;
  //
  //   const d = await createData(data, signer, { tags });
  //   await d.sign(signer);
  //
  //   const response = await d.sendToBundler("http://bundler.arweave.net");
  //   expect(response.status).toBe(200);
  // });

  // it("should index item from S3", async function() {
  //   console.log(await DataItem.verify(fs.readFileSync(path.join(__dirname, "./.e5f55c2424dbaf806a15ea722881cea2.part.minio"))));
  //   const item = new FileDataItem(path.join(__dirname, "./.e5f55c2424dbaf806a15ea722881cea2.part.minio"));
  //   console.log(base64url.encode(crypto.createHash("sha256").update(await item.rawOwner()).digest()));
  //   expect(await item.isValid()).toBe(true);
  // });
});

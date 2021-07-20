import { readFileSync } from "fs";
import path from "path";
import { Buffer } from "buffer";
import { DataItemCreateOptions } from "../ar-data-base";
import { bundleAndSignData, createData, DataItem } from '..';
import * as fs from 'fs';
import { verifyFile } from '../ar-data-verify';

const wallet0 = JSON.parse(
  readFileSync(path.join(__dirname, "test_key0.json")).toString()
);

describe("Creating and indexing a data item", function() {
  it("Create and get", async function() {
    const _d: DataItemCreateOptions = {
      data: "tasty",
      target: "pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A",
      anchor: "Math.apt'#]gng(36).substring(30)"
    };

    const d = await createData(_d, wallet0);
    expect(Buffer.from(d.getData()).toString()).toBe("tasty");
    expect(d.getOwner()).toBe(wallet0.n);
    expect(d.getTarget()).toBe("pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A");
    expect(d.getAnchor()).toEqual("Math.apt'#]gng(36).substring(30)");
    expect(d.getTags()).toEqual([]);
    expect(DataItem.verify(d.getRaw())).toEqual(true);
  });

  it("Test Bundle", async function() {
    const _dataItems: DataItemCreateOptions[] = [{
      data: "tasty",
      target: "pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A",
      anchor: "Math.randomgng(36).substring(30)",
      tags: [{ name: "x", value: "y" }]
    }];

    const bundle = await bundleAndSignData(_dataItems, wallet0);
    const dataItems = bundle.getAll();

    expect(bundle.length).toEqual(1);
    expect(dataItems.length).toEqual(1);
    expect(Buffer.from(dataItems[0].getData()).toString()).toBe("tasty");
    expect(dataItems[0].getOwner()).toBe(wallet0.n);
    expect(Buffer.from(dataItems[0].getTarget()).toString()).toBe("pFwvlpz1x_nebBPxkK35NZm522XPnvUSveGf4Pz8y4A");
    expect(dataItems[0].getAnchor()).toEqual("Math.randomgng(36).substring(30)");
    expect(dataItems[0].getTags()).toEqual([{ name: "x", value: "y" }]);
    expect(DataItem.verify(dataItems[0].getRaw())).toEqual(true);
  });

  it("Test bugs", async function() {
    const bundle = await bundleAndSignData([
      { data: "1984" },
      { data: "4242" },
    ], wallet0);

    console.log(bundle.get(1).getData());
    expect(bundle.get(1).getData()).toEqual(Buffer.from("4242"));
  });

  it("Test file verification", async function() {
    const _d: DataItemCreateOptions = {
      data: "tasty",
      anchor: "Math.apt'#]gng(36).substring(30)"
    };

    const d = await createData(_d, wallet0);
    const binary = d.getRaw();
    fs.writeFileSync("test", binary);
    const fileBinary = fs.readFileSync("test");
    expect(fileBinary).toEqual(binary);
    expect(DataItem.verify(fileBinary)).toEqual(true);
    expect(await verifyFile("test")).toEqual(true)
  });

  it("Test failed file verification", async function() {
    fs.writeFileSync("test", Buffer.from("hi"));
    const fileBinary = fs.readFileSync("test");
    expect(DataItem.verify(fileBinary)).toEqual(false);
    expect(await verifyFile("test")).toEqual(false)
  });
});

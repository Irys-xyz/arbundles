import * as ArweaveBundles from "..";
import { readFileSync } from "fs";
import path from "path";
import { Buffer } from "buffer";
import { DataItemCreateOptions } from "../ar-data-base";

const wallet0 = JSON.parse(
  readFileSync(path.join(__dirname, "test_key0.json")).toString()
);

describe("Creating and indexing a data item", function() {
  it("Create and get", async function() {
    const _d: DataItemCreateOptions = {
      data: "tasty",
      target: "Math.randomgng(36).substring(30)",
      anchor: "Math.apt'#]gng(36).substring(30)",
      tags: [{ name: "x", value: "y" }]
    };

    const d = await ArweaveBundles.createData(_d, wallet0);
    expect(Buffer.from(d.getData()).toString()).toBe("tasty");
    expect(d.getOwner()).toBe(wallet0.n);
    expect(d.getTarget()).toBe("Math.randomgng(36).substring(30)");
    expect(d.getAnchor()).toEqual("Math.apt'#]gng(36).substring(30)");
    expect(d.getTags()).toEqual([{ name: "x", value: "y" }]);
  });

  it("Test Bundle", async function() {
    const _dataItems: DataItemCreateOptions[] = [{
      data: "tasty",
      target: "Math.randomgng(36).substring(30)",
      anchor: "Math.randomgng(36).substring(30)",
      tags: [{ name: "x", value: "y" }]
    }];

    const bundle = await ArweaveBundles.bundleAndSignData(_dataItems, wallet0);
    const dataItems = bundle.getAll();

    expect(bundle.length).toEqual(1);
    expect(dataItems.length).toEqual(1);
    expect(Buffer.from(dataItems[0].getData()).toString()).toBe("tasty");
    expect(dataItems[0].getOwner()).toBe(wallet0.n);
    expect(Buffer.from(dataItems[0].getTarget()).toString()).toBe("Math.randomgng(36).substring(30)");
    expect(dataItems[0].getAnchor()).toEqual("Math.randomgng(36).substring(30)");
    expect(dataItems[0].getTags()).toEqual([{ name: "x", value: "y" }]);
  });
});

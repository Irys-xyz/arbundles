import { DataItemCreateOptions } from "../ar-data-base";
import { createData } from "..";
import { PolygonSigner } from "..";
import DataItem from "../DataItem";
import * as fs from "fs";

describe("Polygon signing tests", function () {
  it("should sign and verify", async function () {
    const _d: DataItemCreateOptions = {
      target: "OXcT1sVRSA5eGwt2k6Yuz8-3e3g9WJi5uSE99CWqsBs",
      anchor: "Math.apt'#]gng(36).substring(30)",
      tags: [{ name: "Content-Type", value: "image/png" }],
    };

    const signer = new PolygonSigner(
      "a62a05de6cd346c85cbdf5281532c38fff972558fd02e2cc1d447e435de10f18",
    );

    const d = createData("hello", signer, _d);
    await d.sign(signer);
    expect(await d.isValid()).toBe(true);

    expect(d.rawOwner.toString("hex")).toEqual(signer.pk);
    expect(d.signatureType).toEqual(3);
    expect(d.target).toEqual("OXcT1sVRSA5eGwt2k6Yuz8-3e3g9WJi5uSE99CWqsBs");
    expect(d.anchor).toEqual("Math.apt'#]gng(36).substring(30)");
    expect(d.tags).toEqual([{ name: "Content-Type", value: "image/png" }]);
    expect(d.rawData.toString()).toEqual("hello");
  });

  it("should verify file", async function () {
    const data = fs.readFileSync(
      "/home/josh/Downloads/jCn54Fbjagz-gnnpJ2uITSGBmONTowUs6mfJw2TAfwg",
    );
    data.set(Buffer.from([3, 0]), 0);
    const item = new DataItem(data);

    expect(await item.isValid()).toEqual(true);
  });
});

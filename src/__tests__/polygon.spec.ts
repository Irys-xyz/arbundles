import base64url from "base64url";
import { createData, PolygonSigner } from "../../index";
import type { DataItemCreateOptions } from "../ar-data-base";

describe("Polygon signing tests", function () {
  it("should sign and verify", async function () {
    const _d: DataItemCreateOptions = {
      target: "OXcT1sVRSA5eGwt2k6Yuz8-3e3g9WJi5uSE99CWqsBs",
      anchor: "Math.apt'#]gng(36).substring(30)",
      tags: [{ name: "Content-Type", value: "image/png" }],
    };

    const signer = new PolygonSigner("a62a05de6cd346c85cbdf5281532c38fff972558fd02e2cc1d447e435de10f18");

    const d = createData("hello", signer, _d);
    await d.sign(signer);
    expect(await d.isValid()).toBe(true);

    expect(d.rawOwner.toString("hex")).toEqual(signer.pk);
    expect(d.signatureType).toEqual(3);
    expect(d.target).toEqual("OXcT1sVRSA5eGwt2k6Yuz8-3e3g9WJi5uSE99CWqsBs");
    expect(d.anchor).toEqual(base64url.encode("Math.apt'#]gng(36).substring(30)"));
    expect(d.tags).toEqual([{ name: "Content-Type", value: "image/png" }]);
    expect(d.rawData.toString()).toEqual("hello");
  });

  // it("should verify file", async function () {
  //   const data = fs.readFileSync(
  //     "/home/josh/Downloads/jCn54Fbjagz-gnnpJ2uITSGBmONTowUs6mfJw2TAfwg",
  //   );
  //   const item = new DataItem(data);
  //
  //   const signer = new PolygonSigner(
  //     "29c17feb590ef5471d4f1d203e3525cbcb3073ccbdc593cd39a9cfff2415eeb0",
  //   );
  //
  //   const d = createData(
  //     fs.readFileSync("/home/josh/Documents/photo_2021-11-15_17-18-34.jpg"),
  //     signer,
  //     { tags: [{ name: "Content-Type", value: "image/png" }] },
  //   );
  //   await d.sign(signer);
  //
  //   console.log({ ...d.toJSON(), data: undefined });
  //
  //   expect(await item.isValid()).toEqual(true);
  // });
});

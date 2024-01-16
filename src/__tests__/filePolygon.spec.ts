import { PolygonSigner, createData } from "../../index";
import type { DataItemCreateOptions } from "../ar-data-base";
import { createData as createFileData } from "../../src/file/index";
import base64url from "base64url";

describe("Polygon signing tests", function () {
  it("should sign and verify using non file", async function () {
    const _d: DataItemCreateOptions = {
      target: "OXcT1sVRSA5eGwt2k6Yuz8-3e3g9WJi5uSE99CWqsBs",
      anchor: "Math.apt'#]gng(36).substring(30)",
      tags: [{ name: "Content-Type", value: "image/png" }],
    };

    const signer = new PolygonSigner("a62a05de6cd346c85cbdf5281532c38fff972558fd02e2cc1d447e435de10f18");

    const d = await createFileData("hello", signer, _d);
    // const test = new DataItem(fs.readFileSync(d.filename));
    // await test.sign(signer);
    // console.log(await test.isValid());
    const dd = createData("hello", signer, _d);
    await d.sign(signer);
    await dd.sign(signer);
    expect(await d.signatureType()).toEqual(dd.signatureType);
    expect(await d.owner()).toEqual(dd.owner);
    expect(await d.dataStart()).toEqual(dd.getStartOfData());
    expect(await d.rawData()).toEqual(dd.rawData);
    expect(await d.target()).toEqual(dd.target);
    expect(await d.anchor()).toEqual(dd.anchor);
    expect(await d.rawTags()).toEqual(dd.rawTags);
    expect(await d.tags()).toEqual(dd.tags);
    expect(await d.isValid()).toEqual(true);
  });

  it("should sign and verify", async function () {
    const _d: DataItemCreateOptions = {
      target: "OXcT1sVRSA5eGwt2k6Yuz8-3e3g9WJi5uSE99CWqsBs",
      anchor: "Math.apt'#]gng(36).substring(30)",
      tags: [{ name: "Content-Type", value: "image/png" }],
    };

    const signer = new PolygonSigner("a62a05de6cd346c85cbdf5281532c38fff972558fd02e2cc1d447e435de10f18");

    const d = await createFileData("hello", signer, _d);
    await d.sign(signer);
    expect(await d.isValid()).toBe(true);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect((await d.rawOwner()).toString("hex")).toEqual(signer.pk);
    expect(await d.signatureType()).toEqual(3);
    expect(await d.target()).toEqual("OXcT1sVRSA5eGwt2k6Yuz8-3e3g9WJi5uSE99CWqsBs");
    expect(await d.anchor()).toEqual(base64url.encode("Math.apt'#]gng(36).substring(30)"));
    expect(await d.tags()).toEqual([{ name: "Content-Type", value: "image/png" }]);
    expect(Buffer.compare(Buffer.from("hello"), await d.rawData())).toEqual(0);
  });
});

import base64url from "base64url";
import { SolanaSigner, createData } from "../../index";
import type { DataItemCreateOptions } from "../ar-data-base";
import base58 from "bs58";

describe("Solana signing tests", function () {
  it("should sign and verify", async function () {
    const _d: DataItemCreateOptions = {
      target: "OXcT1sVRSA5eGwt2k6Yuz8-3e3g9WJi5uSE99CWqsBs",
      anchor: "Math.apt'#]gng(36).substring(30)",
      tags: [{ name: "Content-Type", value: "image/png" }],
    };

    const signer = new SolanaSigner("rUC3u5oz8W1Y2b8b2tq1K5AUWnXMiVV5o9Fx29yTJepFqFPfYPdwjainQhUvxfNuuhMJAGoawA3qYWzo8QhC5pj");

    const d = createData("hello", signer, _d);
    await d.sign(signer);
    expect(await d.isValid()).toBe(true);
    expect(base58.encode(d.rawOwner)).toEqual(signer.pk);
    expect(d.signatureType).toEqual(2);
    expect(d.target).toEqual("OXcT1sVRSA5eGwt2k6Yuz8-3e3g9WJi5uSE99CWqsBs");
    expect(d.anchor).toEqual(base64url.encode("Math.apt'#]gng(36).substring(30)"));
    expect(d.tags).toEqual([{ name: "Content-Type", value: "image/png" }]);
    expect(d.rawData.toString()).toEqual("hello");
  });
});

import { bundleAndSignData, createData } from "../index";
import { readFileSync } from "fs";
import path from "path";
import { ArweaveSigner } from "../signing";
import { verifyAndIndexStream } from "../stream";
import { Readable } from "stream";

const wallet0 = JSON.parse(
  readFileSync(path.join(__dirname, "test_key0.json")).toString(),
);

describe("stream tests", function () {
  it("test", async function () {
    const signer = new ArweaveSigner(wallet0);
    const item = createData("hello", signer);
    const bundle = await bundleAndSignData([item], signer);

    const stream = Readable.from(bundle.getRaw());
    for await (const item of await verifyAndIndexStream(stream)) {
      console.log(item);
    }
  });
});

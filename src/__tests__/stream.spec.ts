import { readFileSync } from "fs";
import path from "path";
import { bundleAndSignData, createData, ArweaveSigner } from "../../index.js";
import processStream from "../../src/stream/index.js";
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
    for await (const item of await processStream(stream)) {
      console.log(item);
    }
  });
});

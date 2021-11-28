import { bundleAndSignData, createData } from "../index";
import { readFileSync } from "fs";
import path from "path";
import { ArweaveSigner } from "../signing";
import { verifyAndIndexStream } from "../stream";
import * as fs from "fs";

const wallet0 = JSON.parse(
  readFileSync(path.join(__dirname, "test_key0.json")).toString(),
);

describe("stream tests", function () {
  it("test", async function () {
    const signer = new ArweaveSigner(wallet0);
    const item = createData(
      fs.readFileSync("/media/josh/Extra/large/large.jpg"),
      signer,
    );
    const bundle = await bundleAndSignData([item], signer);

    fs.writeFileSync("test", bundle.getRaw());

    console.log(
      await verifyAndIndexStream(
        fs.createReadStream("test", { highWaterMark: 1024 * 10 }),
      ),
    );
    for await (const item of await verifyAndIndexStream(
      fs.createReadStream("test", { highWaterMark: 1024 * 10 }),
    )) {
      console.log(item);
    }
  });
});

import { readFileSync } from "fs";
import path from "path";
import { bundleAndSignData, createData, ArweaveSigner } from "../../index";
import processStream from "../../src/stream/index";
import { Readable } from "stream";

const wallet0 = JSON.parse(readFileSync(path.join(__dirname, "test_key0.json")).toString());

const dataItemExpectations = [
  // Processed bundle stream expectations with id and signature removed as those are non-deterministic
  {
    sigName: "arweave",
    target: "",
    anchor: "",
    owner:
      "wpJ2SmgofIMmxC1UX5d6FPa3LVXbgPZsW5RIhDmYorQjeriATWQkpY9ma2JnDrKCwy1YTao2ADnQjJC0MH6YMrFJg4BV7bFHWaY4RSLF-IVgPjm1GMRSCQnn9tHIBkArrzRWbXS3BRtAj_b719c4-Um9Flq72vv8Z71Nbe3bPA9NTMhYif0XRIKTHgz5t2yz2tYgS6woWMvry2QSwV5SE6kegiUpJSN_u1ulrWHyzULP3tHhanm5qem6F8EiZuraDu6p-OrRZ5pafP4X6d7ErNRZ7Il869aF5THPx65W-3fC3DUo_B57h8R_50LOiyw4dJqb101M_7Y5SjNS0Q1ESQJxbsoOxhmelN6rznkiASNH_mO0bqVqhIy_TvYMWGo7WEPOQDuoob8j4hXLajeH70WZ-Sl6QGOc95bRtNT7F3KqO8uF99Hp3ONGJb5qpnDu7iimPlTYnG1CFHVKVnqzCViIn9viKgsAIrZifjrxE7Zj79lEBwxxsV8KWR3mPIVXnvmHPOe0FXjr056_G5YlCxdIRUxsV4X9GOKmW-GgbHmFOXLO7GV5kI-alEhmIHLH-0MP_Q51MK87VphoiIINc8SlUlOQBXBXLwVCTPerKp9axtdjYHUVLNO2zWONqzbLpAObyQ7Ats0N13S60MwyDVVWcBfyZvjRL2u5hVIGNuU",
    tags: [],
    dataOffset: 1204,
    dataSize: 5,
  },
  {
    sigName: "arweave",
    target: "",
    anchor: "",
    owner:
      "wpJ2SmgofIMmxC1UX5d6FPa3LVXbgPZsW5RIhDmYorQjeriATWQkpY9ma2JnDrKCwy1YTao2ADnQjJC0MH6YMrFJg4BV7bFHWaY4RSLF-IVgPjm1GMRSCQnn9tHIBkArrzRWbXS3BRtAj_b719c4-Um9Flq72vv8Z71Nbe3bPA9NTMhYif0XRIKTHgz5t2yz2tYgS6woWMvry2QSwV5SE6kegiUpJSN_u1ulrWHyzULP3tHhanm5qem6F8EiZuraDu6p-OrRZ5pafP4X6d7ErNRZ7Il869aF5THPx65W-3fC3DUo_B57h8R_50LOiyw4dJqb101M_7Y5SjNS0Q1ESQJxbsoOxhmelN6rznkiASNH_mO0bqVqhIy_TvYMWGo7WEPOQDuoob8j4hXLajeH70WZ-Sl6QGOc95bRtNT7F3KqO8uF99Hp3ONGJb5qpnDu7iimPlTYnG1CFHVKVnqzCViIn9viKgsAIrZifjrxE7Zj79lEBwxxsV8KWR3mPIVXnvmHPOe0FXjr056_G5YlCxdIRUxsV4X9GOKmW-GgbHmFOXLO7GV5kI-alEhmIHLH-0MP_Q51MK87VphoiIINc8SlUlOQBXBXLwVCTPerKp9axtdjYHUVLNO2zWONqzbLpAObyQ7Ats0N13S60MwyDVVWcBfyZvjRL2u5hVIGNuU",
    tags: [],
    dataOffset: 2253,
    dataSize: 0,
  },
];

describe("stream tests", function () {
  it("test", async function () {
    const signer = new ArweaveSigner(wallet0);
    const helloItem = createData("hello", signer);
    const emptyItem = createData("", signer);
    const bundle = await bundleAndSignData([helloItem, emptyItem], signer);

    const stream = Readable.from(bundle.getRaw());

    const processedBundleStream = await processStream(stream);

    for (let i = 0; i < processedBundleStream.length; i++) {
      const dataItem = processedBundleStream[i];

      expect(dataItem.id).toHaveLength(43);
      expect(dataItem.signature).toHaveLength(683);

      // Remove non-deterministic fields from data item
      delete dataItem.id, delete dataItem.signature;
      expect(dataItem).toStrictEqual(dataItemExpectations[i]);
    }
  });
});

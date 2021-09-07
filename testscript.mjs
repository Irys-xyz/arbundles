import fs from "fs";
import { ArweaveSigner, createData } from './build/index.js';

const jwk = JSON.parse(fs.readFileSync("src/__tests__/test_key0.json").toString());

const myTags = [
  { name: 'App-Name', value: 'myApp' },
  { name: 'App-Version', value: '1.0.0' }
];

const signer = new ArweaveSigner(jwk);

for (let i = 0; i < 300000000; i++) {
  const opts = { tags: myTags };
  const data = new Uint8Array(1_000_000_000).fill(10);
  const item = createData(data, signer, opts);
  const used = process.memoryUsage();
  console.log(used);
  console.log(item);
}

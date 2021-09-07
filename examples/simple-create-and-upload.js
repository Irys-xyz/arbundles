import Arweave from 'arweave';
import fs from "fs";
import { ArweaveSigner, bundleAndSignData } from "arbundles";

const jwk = JSON.parse(fs.readFileSync("keyfile.json").toString());

const arweave = Arweave.init({
    host: 'arweave.dev',
    port: 443,
    protocol: 'https'
});

const myTags = [
    { name: 'App-Name', value: 'myApp' },
    { name: 'App-Version', value: '1.0.0' }
];

const signer = new ArweaveSigner(jwk);

const d = [
  createData("hello", signer, { tags: myTags }),
  createData("world", signer),
]

const myBundle = await bundleAndSignData(d, signer);

const tx = await myBundle.toTransaction(arweave, jwk);

await arweave.transactions.sign(tx, jwk);

console.log(`Posted bundle with tx id: ${tx.id}`);

console.log(await arweave.transactions.post(tx));

import fs from "fs";
import { ArweaveSigner, createData } from "arbundles";

const jwk = JSON.parse(fs.readFileSync("wallet.json").toString());

const signer = new ArweaveSigner(jwk);

const directory = "Archive";

const files = fs.readdirSync(directory);

for (const file of files) {
  const data = {
    data: fs.readFileSync(`${directory}/${file}`)
  };

  const item = await createData(data, signer);

  await item.sign(signer);

  const response = await item.sendToBundler();

  console.log(`Sent ${file} bundler with response: ${response.status} / ${response.statusText}`);
}

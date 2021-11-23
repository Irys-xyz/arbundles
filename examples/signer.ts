import { PolygonSigner, createData } from "../src";
import { ethers } from "ethers";

const main = async () => {
  const wallet = ethers.Wallet.fromMnemonic(
    "force lens embark fire chalk remember elevator waste quantum truck shed chair",
  );
  const signer = new PolygonSigner(wallet.privateKey.slice(2));
  console.log(signer.publicKey.toString("hex"));
  const d = await createData("hello world", signer);
  d.sign(signer);
  console.log(await d.isValid());
};
main();

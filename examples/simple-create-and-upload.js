import Arweave from 'arweave';
import { ArweaveSigner, bundleAndSignData, createData } from "arbundles";
import fs from 'fs'

const jwk = JSON.parse(	
	fs.readFileSync('src/secrets/jwk.json', {encoding: 'utf8'})
)

const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

const main = async()=>{

	const myTags = [
			{ name: 'App-Name', value: 'myApp' },
			{ name: 'App-Version', value: '1.0.0' }
	];

	const signer = new ArweaveSigner(jwk);
  
	const d = [
		await createData("hello", signer, { tags: myTags }),
		await createData("world", signer),
	]

	const myBundle = await bundleAndSignData(d, signer);

	const tx = await myBundle.toTransaction(arweave, jwk);

	await arweave.transactions.sign(tx, jwk);

	console.log(`Posted bundle with tx id: ${tx.id}`);

	console.log(await arweave.transactions.post(tx));

	console.log(await arweave.transactions.getStatus(tx.id))

} 
main();

# ANS-104 Bundles

**If you want to use Bundlr Network head over to [this repo](https://github.com/Bundlr-Network/js-client)**

A low level library for creating, editing, reading and verifying bundles.

See [ANS-104](https://github.com/joshbenaron/arweave-standards/blob/ans104/ans/ANS-104.md) for more details.

## Installing the library

Using npm:

`npm install arbundles`

Using yarn:

`yarn add arbundles`

## Creating bundles

```ts
import { bundleAndSignData, createData } from "arbundles";

const signer = new ArweaveSigner(jwk);

const dataItems = [createData("some data", signer), createData("some other data", signer)];

const bundle = await bundleAndSignData(dataItems, signer);
```

# ANS-104 Bundles

**If you want to use Bundlr Network head over to [this repo](https://github.com/Bundlr-Network/js-client)**

A low level library for creating, editing, reading and verifying bundles.

Note: Gateways currently only index bundles up to 250mb. Creating bundles larger than this could lead to them not being indexed. The new gateway implementation will provide infinite bundle limits.
If you wish to upload a transactions >250mb submit a standard transaction via [arweave-js](https://github.com/ArweaveTeam/arweave-js).

See [ANS-104](https://github.com/joshbenaron/arweave-standards/blob/ans104/ans/ANS-104.md) for more details.

## Installing the library

Using npm:

`npm install arbundles`

Using yarn:

`yarn add arbundles`

## Creating bundles

```ts
import { bundleAndSignData, createData } from "arbundles";

const dataItems = [createData("some data"), createData("some other data")];

const signer = new ArweaveSigner(jwk);

const bundle = await bundleAndSignData(dataItems, jwk);
```

# File API

This API is _experimental_ so avoid use in production. There's one issue that exists that may affect it's overall
functionality and could lead to breaking changes.

The file API stores the items in the filesystem meaning you can bundle more items without hitting the NodeJS memory
limit.

Docs coming soon...

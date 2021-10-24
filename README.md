# Arweave Bundles

A library for creating, editing, reading and verifying bundles.

Note: Gateways currently only index bundles up to 250mb. Creating bundles larger than this could lead to them not being indexed. The new gateway implementation will provide infinite bundle limits.
If you wish to upload a transactions >250mb submit a standard transaction via [arweave-js](https://github.com/ArweaveTeam/arweave-js).

See [ANS-104](https://github.com/joshbenaron/arweave-standards/blob/ans104/ans/ANS-104.md) for more details.

## Installing the library

Using npm:

```npm install arbundles```

Using yarn:

```yarn add arbundles```

## Creating bundles

```ts
import { bundleAndSignData, createData } from "arbundles";

const dataItems = [
  createData("some data"),
  createData("some other data")
];

const signer = new ArweaveSigner(jwk);

const bundle = await bundleAndSignData(dataItems, jwk);
```

It's as simple as that! All the binary encoding is handled for you.

## Creating and sending data to a Bundler

```ts
import { createData } from "arbundles";

const signer = new ArweaveSigner(jwk);

const dataItem = createData("some message", signer);

// Get owner in base64url encoded string
const owner = dataItem.owner;

// Sign a single DataItem 
await dataItem.sign(jwk);

const response = dataItem.sendToBundler();
```

## Get a DataItem in a bundle

```ts
const bundle = await bundleAndSignData(dataItems, jwk);

// Get by index
const byIndex = bundle.get(0);

// Get by transaction id
const byId = bundle.get("hKMMPNh_emBf8v_at1tFzNYACisyMQNcKzeeE1QE9p8");

// Get all DataItems
const all = bundle.items;
```

## Submit a transaction

```ts
const bundle = await bundleAndSignData(dataItems, jwk);

// Convert bundle to Arweave transaction
const tx = await bundle.toTransaction(arweave, jwk);

// Add some more tags after creation.
tx.addTag('MyTag', 'value1');
tx.addTag('MyTag', 'value2');

await arweave.transactions.sign(tx, jwk);
await arweave.transactions.post(tx);
```

## Parse a bundle binary

```ts
import { Bundle } from "arbundles";

const data = await arweave.transactions.getData("hKMMPNh_emBf8v_at1tFzNYACisyMQNcKzeeE1QE9p8", { decode: true });

const bundle = new Bundle(Buffer.from(data));
```

# File API

This API is *experimental* so avoid use in production. There's one issue that exists that may affect it's overall
functionality and could lead to breaking changes.

The file API stores the items in the filesystem meaning you can bundle more items without hitting the NodeJS memory
limit.

Docs coming soon...

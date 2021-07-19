# ANS-104 Bundler-js

**This is currently in** ***ALPHA*** **so do not use until finalized**

A library for creating, editing, reading and verifying bundles.

See [ANS-104](https://github.com/joshbenaron/arweave-standards/blob/ans104/ans/ANS-104.md) for more details.

## Installing the library

Using npm:

```npm install ans104```

Using yarn:

```yarn add ans104```

## Creating bundles
```ts
import { bundleAndSignData } from "ans104";

const dataItems = [
  { data: "some data" },
  { data: "some other data" },
];

const bundle = bundleAndSignData(dataItems, jwk);
```
It's as simple as that! All the binary encoding is handled for you.

## Creating and using a DataItem

```ts
import { createData } from "ans104";

const data = { data: "some data" };

const dataItem = createData(data, jwk);

// Get owner in base64url encoded string
const owner = dataItem.getOwner();

// Sign a single DataItem
await dataItem.sign(jwk);

assert(owner == jwk.n);
```

## Get a DataItem in a bundle

```ts
const bundle = bundleAndSignData(dataItems, jwk);

// Get by index
const byIndex = bundle.get(0);

// Get by transaction id
const byId = bundle.get("hKMMPNh_emBf8v_at1tFzNYACisyMQNcKzeeE1QE9p8");

// Get all DataItems
const all = bundle.getAll();
```

## Submit a transaction

```ts
const bundle = bundleAndSignData(dataItems, jwk);

// Convert bundle to Arweave transaction
const tx = await bundle.toTransaction(arweave);

// Add some more tags after creation.
tx.addTag('MyTag', 'value1');
tx.addTag('MyTag', 'value2');

await arweave.transactions.sign(tx);
await arweave.transactions.post(tx);
```

## Parse a bundle binary

```ts
import { unbundleData } from "ans104";

const tx = await arweave.transactions.get("hKMMPNh_emBf8v_at1tFzNYACisyMQNcKzeeE1QE9p8");

const bundle = unbundleData(tx.data);
```

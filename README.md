# ANS-104 Bundler-js

A library for creating, editing, reading and verifying bundles.

See [ANS-104](https://github.com/joshbenaron/arweave-standards/blob/ans104/ans/ANS-104.md) for more details.

## Installing the library

You need to first have NodeJS.

Using npm:

```npm install ans104```

Using yarn:

```yarn add ans104```

## Creating bundles
```ts
import { bundleAndSignData, Bundle } from "ans104";

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

const dataItem = createData(data);

// Get owner in base64url encoded string
const owner = dataItem.getOwner();

assert(owner == jwk.n);
```

## Get a DataItem in a bundle

```ts
const bundle = bundleAndSignData(dataItems, jwk);

// Get my index
const byIndex = bundle.get(0);

// Get my transaction id
const byId = bundle.get("");

// Get all DataItems
const all = bundle.getAll();
```

## Submit a transaction

```ts
import Arweave from "arweave";

const arweave = Arweave.init();

const bundle = bundleAndSignData(dataItems, jwk);
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

const tx = await arweave.get("some_tx_id");

const bundle = unbundleData(tx.data);
```
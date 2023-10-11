# STAMPS JS

> Note: This library is intended for browser use only.

STAMPS JS is the Software Development Kit (SDK) for the STAMP Protocol. Developers can use this SDK to integrate the STAMP Protocol into their applications.

## Installation

Install STAMPS JS using npm:

```sh
npm install @permaweb/stampjs
```

## Usage

Here's an example of how to use STAMPS JS:

```js
import Stamps from '@permaweb/stampjs';
import { WarpFactory } from 'warp-contracts';
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature';
import Arweave from 'arweave';

// if using ArConnect you need to make sure the following PERMISSIONS are enabled
// * SIGNATURE
// * ACCESS_PUBLIC_KEY
// the new signer plugin from warp requires these settings


const signer = new InjectedArweaveSigner(globalThis.arweaveWallet) // Required if you are using Warp v1.4.11 or greater
// also you need to make sure you set the address function
signer.getAddress = globalThis.arweaveWallet.getActiveAddress
// finally you need to setPublicKey
await signer.setPublicKey()

// Initialize STAMPS JS, passing a Warp and Arweave instance
const stamps = Stamps.init({
  warp: WarpFactory.forMainnet(), 
  arweave: Arweave.init({}),
  wallet: signer,
  dre: 'https://dre-u.warp.cc/contract', //optional
  graphql: 'https://arweave.net/graphql' //optional
});

// Stamp an asset
// SUPER STAMP: Optionally pass $STAMP quantity and tags
await stamps.stamp(TX, [qty], [tags]);

// Get stamp count for an asset
const { total } = await stamps.count(TX);

// Get counts for multiple assets
const counts = await stamps.counts(TXs);

// Check if the user has already stamped the asset
const stamped = await stamps.hasStamped(TX);
// or check if several Assets have been stamped
const results = await stamps.hasStamped([tx1, tx2, tx3])

// Get user's token balance
const balance = await stamps.balance();
```

For more information, visit the [STAMPS Protocol website](https://stamps.g8way.io).

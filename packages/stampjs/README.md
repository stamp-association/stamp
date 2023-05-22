# STAMPS JS

> Browser only library

STAMPS JS is the SDK for the STAMP Protocol 

The STAMP JS SDK is how developers can integrate the STAMPs protocol in their applications.

## Install

```sh
npm install @permaweb/stampjs
```

## Usage

```js
import Stamps from '@permaweb/stampjs'
import { WarpFactory } from 'warp-contracts'
import Arweave from 'arweave'

// initialize - passing a warp and arweave instance
const stamps = Stamps.init({
  warp: WarpFactory.forMainnet(), 
  arweave: Arweave.init({}) 
})

// stamp an Asset
// SUPER STAMP: Pass $STAMP Qty [optional]
await stamps.stamp(TX, [qty], [tags])

// get stamp count for an asset
const { total } = await stamps.count(TX)

// get counts for assets
const counts = await stamps.counts(TXs)

// has the user already stamped the asset?
const stamped = await hasStamped(TX)

// get user token balance
const balance = await stamps.balance()

```

For more information: https://stamps.g8way.io

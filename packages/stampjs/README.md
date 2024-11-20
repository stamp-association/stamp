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

// if using ArConnect you need to make sure the following PERMISSIONS are enabled
// * ACCESS_ADDRESS
// * DISPATCH
// * SIGN_TRANSACTION


// Initialize STAMPS JS, passing a process ID and delay
const stamps = Stamps.init({
  process: 'LaC2VtxqGekpRPuJh-TkI_ByAqCS2_KB3YuhMJ5yBtc', // Optional
  delay: 1000 // Optional - the length of time to wait between retries
});

// Stamp an asset
// SUPER STAMP: Optionally pass $STAMP quantity and tags
await stamps.stamp(TX, [qty], [tags]);

// Get stamp count for an asset
const { total } = await stamps.count(TX);

// Get counts for multiple assets
const counts = await stamps.counts(TXs);

> NOTE: hasStamped can take a single TX or a set of TXs

// Check if the user has already stamped the asset
const stamped = await stamps.hasStamped(TX);

or

const stampedResults = await stamps.hasStamped([TX1, TX2, TX3])

// or check if several Assets have been stamped
const results = await stamps.hasStamped([tx1, tx2, tx3])

// Get user's token balance
const balance = await stamps.balance();
```

For more information, visit the [STAMPS Protocol website](https://stamps.g8way.io).

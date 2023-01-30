# Stamp Protocol (Test)

The STAMP Protocol is a decentralized protocol to allow consumers of any asset on the permaweb to attribute value, if the consumer is VOUCHED, then that attribution of value counts towards token rewards to be distributed to the asset holders.

## Developer Integration

```sh
npm install https://client_stamps.arweave.dev
```

```js
import Stamps from '@permaweb/stamps'
import { WarpFactory } from 'warp-contracts'

const warp = WarpFactory.forMainnet()
const stamps = Stamps.init({ warp })

const result = await stamps.stamp(assetId, qty)
const { count, vouched, super } = await stamps.count()
```

## Client API

Stamps.init



> TEST Purposes only

## Features

* PST 
* embedded Order Book

This means that owners of the StampCoin can choose to sell any of their StampCoin for bAR. And holders of bAR can choose to purchase any listed StampCoin with their bAR. More to come here.

* stamp

Any `vouch-for` wallet can create a stamp for any arweave transaction. This feature would be part of any decentralized App that chooses to display the arweave transaction, this includes Atomic NFTs, dApps, and other data assets that exist on the blockweave.

* reward

This is the mechanism that distributes rewards to all of the creators that have the most stamped assets in the community. The reward system will run until 10% of the coin supply has been distributed. The reward function can only be run by the coin creator.

## Deploy

```
yarn build
yarn deploy [wallet.json]
```


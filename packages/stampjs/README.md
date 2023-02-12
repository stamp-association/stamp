# STAMPS JS

STAMPS JS is the SDK for the STAMP Protocol version 0.2 

The STAMP JS SDK is how developers can integrate the STAMPs protocol in their applications.

## Install

```sh
npm i https://stampjs-v006_stamps.g8way.io
```

## Usage

```js
import Stamps from '@permaweb/stampjs'

// initialize - passing a warp instance
const stamps = Stamps.init({warp: WarpFactory.forMainnet() })

// stamp an Asset
await stamps.stamp(TX, [qty], [tags])

// get stamp count
const { total } = await stamps.count(TX)

// get counts for assets
const counts = await stamps.counts(TXs)

// get user token balance

const balance = await stamps.balance(Address)

```

The API is short and simple:

* Stamp a TX
* Get Count for a TX
* Get Counts for a list of TXs
* Get STAMP Token balance for a wallet address

While you can STAMP any assets, the STAMP Protocol has a game, the game is to enable creators of the data to enter in a chance to get STAMP Tokens by actual humans STAMPing their content. These tokens help to provide users signal that this creator is generating some high value content. There is nothing you need to do to manage this behavior, but you may want to add some copy to your interface to encourage users to get verified by a Vouch Service, if verified they can participate in the STAMP Protocol game and support their favorite creators.

## What if I want to display a STAMP count of verified STAMPERs?

The count and counts function return an object that contains three values:

```js
{
  total: 100,
  verified: 25,
  super: 4
}
```

The total is how many users STAMPed the TX over all. The verified is how many verified VouchDAO users STAMPed the TX and Super is how many STAMPed users did a Super Stamp or sent some STAMP Tokens.

-- FUTURE --

## Developers note (coming in STAMP Protocol v0.3)

If your application is creating Atomic Tokens for users to STAMP, consider adding some copy app like:

Hey Creators, Thank you for using [YOUR APP HERE], we want to continue to improve it to support your needs, you can either pay [YOUR APP HERE] in AR or allow [YOUR APP HERE] to retain 1 - 2 percent of the token you are minting to participate in the STAMP Game and receive STAMP Tokens.

_This way you can also get value for your software._

If you implement the STAMP JS in you application and the user does a super stamp

Add some copy that says:

X percent of the Tokens being sent as a super stamp will be transferred to [YOUR APP HERE].

> But please keep in mind to be transparent about these things let users know what is happening so there are no surprises, keeping software gasless is important but allowing developers to earn too also helps.

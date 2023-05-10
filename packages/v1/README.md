# STAMP 

STAMP is a protocol that allows for any user on the permaweb to generate a proof of attribution or "Like" for any asset on the permaweb. If that asset is an "atomic asset" or "registered" with the STAMP contract, the sponsors of that asset will receive rewards in $STAMP tokens.

| Name | Description |
| ---- | ----------- |
| Signature | Sign Transaction with your private key |
| Timestamp | Record the timestamp of transaction |
| And |  |
| Metadata | Attach metadata to connect to STAMP Rewards Contract |
| Protocol | Common Pattern that works on the Permaweb |


$STAMP is a tradeable token contract that implements the [Foreign Call Protocol 2.0 (FCP)](https://specs.g8way.io/?tx=iXHbTuV7kUR6hQGwNjdnYFxxp5HBIG1b3YI2yy7ws_M) 



## Notes

Tokenomics

Token: $STAMP
Atomic Unit: amp
Divisibility: 6
Supply: 7,665,000 ($STAMP) or  7,665,000,000,000 (amp)

$STAMP Tokens have an atomic unit called `amps` each $STAMP token is equal to 1 Million `amp` units. 

Every 720 arweave block writes a mint mechanism runs to reward all permaweb digital assets that were stamped during that cycle. The reward depends on the ratio between the current supply and the max supply.

| Percent Supply | Reward        |
| -------------- | ------------- |
| 0 - 25%        | 1000 ($STAMP) |
| 25 - 50%       | 750 ($STAMP)  |
| 50 - 75%       | 500 ($STAMP)  |
| 75 - 100%      | 250 ($STAMP)  |

Once the total supply is minted, as 100 $STAMPs become available in the treasury, the reward mechanism will reward digital assets.

The treasury can be built up by individuals transfering $STAMP tokens from their account to the the treasury account.
As SUPER STAMPs are issued, the treasury will take 2%
And if there is no owner defined for the digital asset the treasury will receive the rewards for that asset

## Contract Methods

* register - registers a digital asset to be stamped
* stamp - stamps a digital asset (super stamp includes a qty)

PST 

* transfer - transfers balance from one holder to another
* balance - returns the balance of a given holder

Temporary

* evolve - updates or patches contract, this is only available for 90 Days

FCP 2.0 

* allow - a holder can create a claim for a 3rd Party with some or all of their balance
* claim - a third party can transfer the claim qty to their balance

[Documentation](https://stamps.g8way.io)
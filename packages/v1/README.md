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

# AO Stamp Protocol v2

Process ID: `bLK9hMjx3jsJ4Ldjn-tvuTB1_PHzYV6ivPkv7_D8zKg`

## Getting Started

### Create Process

```sh
aos <<PROCESS_NAME>> --tag-name Extension --tag-value WeaveDrive --tag-name Variant --tag-value weavedrive.1 --module="_wjbCuCyUTmKAseOfEj0NzrCNUgKcMqBGaSzNySzMoY"  --cron=5-blocks
```

### Load APM packages

```sh
.load-blueprint apm
apm.install('@rakis/WeaveDrive')
apm.install('@rakis/test-unit')
apm.install('@tilla/graphql')
apm.install('@tilla/graphql_server')
```

### Create Lua bundle using bundler.js

```sh
node bundler.js v2 .
```

### Load Lua bundle

```sh
.load bundle.lua
```

## Handlers

### Stamp-Write-Stamp

```txt
Tags:
  Action: "Write-Stamp"
  Data-Source: The address of the data source to stamp.
  [Super-Stamp-Quantity] The amount of balance to super stamp with.
```

Given a data source address, creates a stamp for the data source by the `From` address. If this stamp already exists, will do nothing.

If the optional `Super-Stamp-Quantity` tag is included will create a Super Stamp for the data source by the `From` address. The quantity will be removed from the stamper balance and rewarded to the data source owners. Additionally allocates credits to be claimed in one year.

### Stamp-Write-Register

Registers an asset to an owner. Currently not implemented.

### Stamp-Read-Balance

```txt
Tags:
  Action: "Read-Balance"
  [Recipient]: The address to return the balance of.
  [Target]: The address to return the balance of.
```

Reads the balance of a given wallet. Checks for `Recipient` tag, then `Target` tag, then `From` address. Returns the balance of the given address.

### Stamp-Write-Transfer

```txt
Tags:
  Action: "Write-Transfer"
  Transfer-Recipient: The address to send the balance to.
  Transfer-Quantity: The quantity to send.
```

Transfer `Transfer-Quantity` balance from the `From` address to the `Transfer-Recipient` address.

### Stamp-Write-Allow

```txt
Tags:
  Action: "Write-Allow"
  Allow-Quantity: The quantity to allow.
  Allow-Target: The address to allow to claim the balance.
```

Creates a claimable object allowing the `Allow-Target` to claim `Allow-Quantity` balance from the `From` address.

### Stamp-Write-Claim

```txt
Tags:
  Action: "Write-Claim"
  Claim-Quantity: The quantity to claim.
  Claim-TxID: The address to claim the balance from.
```

If a claimable object exists for the `From` address from the `Claim-TxID` address, claim `Claim-Quantity`.

### Stamp-Read-Stamps-By-Asset

```txt
Tags:
  Action: "Read-Stamps-By-Asset"
  [Data-Source]: The asset tx to read the stamps of.
  [Data-Sources]: The asset txs to read the stamps of.
```

Returns an array of stamps of the `Data-Source` asset. If multiple assets are specified (`Data-Sources`), returns a table with asset txs as keys and stamp arrays as values.

### Stamp-Read-Stamps-By-Address

```txt
Tags:
  Action: "Read-Stamps-By-Address"
  Data-Source: The address tx to read the stamps of.
```

Returns an array of stamps of the `Data-Source` address.

## Cron

The following functions run on a 5-block cron cycle.

### Reward

Rewards the owners of stamps assets during the current cycle. The rewards are determined as follows:

1) Total cycle reward is allocated based on current block height and and total supply.
2) Asset rewards are allocated from the total reward based on the number of unique stampers for each asset. The more unique stampers, the greater the reward.
3) Asset rewards are rewarded to asset owners. For atomic assets, this reward is split based on the `Balances` object of the info handler. For other assets, the full reward goes to the owner address. If no owner address is found, the reward goes to the AO-Stamp process.
4) Clears current stamp queue and adds to stamp history.

### Credit

Rewards credit holders credits if the target block height has been reached.

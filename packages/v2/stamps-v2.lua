-- module = _wjbCuCyUTmKAseOfEj0NzrCNUgKcMqBGaSzNySzMoY
bint = require('.bint')(256)
json = require('json')
drive = require('@rakis/WeaveDrive')
graphql = require('@tilla/graphql.init')
server = require('@tilla/graphql_server.init')
Test = require("@rakis/test-unit")
utils = {
  add = function(a, b)
    return tostring(bint(a) + bint(b))
  end,
  subtract = function(a, b)
    return tostring(bint(a) - bint(b))
  end,
  toBalanceValue = function(a)
    return tostring(bint(a))
  end,
  toNumber = function(a)
    return bint.tonumber(a)
  end,
  positive = function(a)
    return bint.__lt(bint(0), bint(a))
  end,
  divide = function(a, b)
    return bint.__div(bint(a), bint(b))
  end,
  multiply = function(a, b)
    return bint.__mul(bint(a), bint(b))
  end
}

-- Token Information
Variant = "0.0.1"
Denomination = Denomination or 12
TotalSupply = TotalSupply or utils.toBalanceValue(10000 * 10 ^ Denomination)
Name = Name or 'tSTAMP'
Ticker = Ticker or 'tSTAMP'
Logo = Logo or ''

-- Tables
Balances = Balances or CurrentBalances or { [ao.env.Process.Id] = utils.toBalanceValue(10000 * 10 ^ Denomination) }
Claimables = Claimables or {}
Credits = Credits or {}

Stamps = Stamps or {}
CycleAllocations = CycleAllocations or {}
HangingReceives = HangingReceives or {}

-- GQL Indexes
StampsByAsset = StampsByAsset or CurrentStampsByAsset or {}
StampsByAddress = StampsByAddress or CurrentStampsByAddress or {}
StampHistory = StampHistory or CurrentStampHistory or {}

-- TODO: defaults?
LastReward = LastReward or 1519192
ProcessId = ao.env.Process.Id
ANNUAL_BLOCKS = 720 * 365
MAXIMUM_STAMPS = 1000000
VouchProcessId = "ZTTO02BL2P-lseTLUgiIPD9d0CF1sc4LbMA2AQ7e9jo"


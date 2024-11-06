---------------------------------------------------
------------------- FUNCTIONS ---------------------
---------------------------------------------------

--------------------
----- REGISTER -----
--------------------
function Register(message, assets)
  local txId = message.Tags['Stamp-Register-Asset-TxID']
  local from = message.From

  if assets[txId] == nil then
    assets[txId] = {
      Balances = {}
    }
  end

  if assets[txId][from] == nil then
    assets[txId]['Balances'][from] = 1
  end
  return "Registered."
end

--------------------
------ STAMP -------
--------------------
function ValidateStamp(message, stamps, stampHistory)
  local caller = message.From
  local txID = message.Tags['Data-Source']

  if not caller or string.len(caller) ~= 43 then
    return false, 'Invalid caller'
  end

  if not txID or string.len(txID) ~= 43 then
    return false, 'Invalid txID'
  end

  if stamps and stamps[string.format("%s:%s", txID, caller)] then
    return false, 'Already stamped'
  end
  if stampHistory and stampHistory[string.format("%s:%s", txID, caller)] then
    return false, 'Already stamped'
  end

  return true, ''
end

function Stamp(message, stamps, stampsByAddress, stampsByAsset, stampHistory, isVouched)
  local validated, err = ValidateStamp(message, stamps, stampHistory)
  if not validated then
    return err
  end

  local caller = message.From
  local txID = message.Tags['Data-Source']

  local callerIsVouched = isVouched(caller)
  local stamp = {
    Asset = txID,
    Address = caller,
    Vouched = callerIsVouched
  }

  stamps[string.format("%s:%s", txID, caller)] = stamp
  AddStampIndex(stampsByAddress, caller, stamp)
  AddStampIndex(stampsByAsset, txID, stamp)

  if not callerIsVouched then
    return 'Not Vouched.'
  end
  return 'Stamped.'
end

--------------------
---- SUPERSTAMP ----
--------------------
function IsSuperStamp(message, balances) 
  local caller = message.From
  local txID = message.Tags['Data-Source']
  local quantity = message.Tags['Super-Stamp-Quantity']
  if not quantity or not utils.toNumber(quantity) or not utils.positive(quantity) then
    return false, 'Not Super Stamp'
  end

  if not txID or string.len(txID) ~= 43 then
    return false, 'Not Super Stamp'
  end

  InitializeBalance(balances, caller)

  if not utils.positive(utils.subtract(balances[caller], quantity)) then
    return false, 'Not Super Stamp'
  end

  return true, ''

end

function SuperStamp(message, balances, creditsTable, isAtomicAsset, getAtomicBalances)
  local isSuperStamp, err = IsSuperStamp(message, balances)
  if not isSuperStamp then
    return err
  end

  local blockHeight = message['BlockHeight']
  local asset = message.Tags['Data-Source']
  local quantity = bint(message.Tags['Super-Stamp-Quantity'])

  local assetIsAtomic, owner = isAtomicAsset(asset)
  local assetBalances = nil
  if assetIsAtomic then
    local atomicBalances = getAtomicBalances(blockHeight, asset)
    if atomicBalances then
      assetBalances = atomicBalances
    else
      assetBalances = { [ProcessId] = 1 }
    end
  else
    assetBalances = { [owner] = 1 }
  end

  local rewards, credits, fee = DivideQty(quantity)

  local rewardAllocation = Allocate(assetBalances, rewards)

  for key, value in pairs(rewardAllocation) do
    rewardAllocation[key] = utils.toBalanceValue(value)
  end
  for address, addressReward in pairs(rewardAllocation) do
    InitializeBalance(balances, address)
    balances[address] = utils.add(balances[address], addressReward)
  end

  InitializeBalance(balances, ProcessId)
  balances[ProcessId] = utils.add(balances[ProcessId], fee)

  local BlockHeight = message['Block-Height']
  local updatedCredits = UpdateCredits(BlockHeight, asset, creditsTable, credits, assetBalances)
  if updatedCredits then
    creditsTable = updatedCredits
  end
  return 'Super Stamped.'

end

--------------------
----- BALANCE ------
--------------------
function ValidateBalance(message)
  local from

  if message.Tags and message.Tags['Recipient'] then
    from = message.Tags['Recipient']
  elseif message.Tags and message.Tags['Target'] then
    from = message.Tags['Target']
  elseif message.From then
    from = message.From
  else
    return false, nil
  end
  return true, from
end

function Balance(message, balances)
  local validated, from = ValidateBalance(message)
  if not validated or from == nil then
    return "Not Validated."
  end
  
  return GetBalance(balances, from)
end

--------------------
----- TRANSFER -----
--------------------
function ValidateTransfer(message, balances)
  local caller = message.From
  local target = message.Tags['Transfer-Recipient']
  local quantity = message.Tags['Transfer-Quantity']

  if not quantity or not utils.toNumber(quantity) or not utils.positive(quantity) then
    return false, 'Invalid quantity'
  end

  if not caller or string.len(caller) ~= 43 then
    return false, 'Invalid caller'
  end

  if not target or string.len(target) ~= 43 then
    return false, 'Invalid target'
  end

  if caller == target then
    return false, 'Target can not be caller'
  end

  InitializeBalance(balances, caller)
  InitializeBalance(balances, target)
  if bint(balances[caller]) < bint(quantity) then
    return false, 'Not enough balance to transfer'
  end

  return true, ''
end

function Transfer(message, balances)
  local validated, err = ValidateTransfer(message, balances)
  if not validated then
    return err
  end

  local caller = message.From
  local target = message.Tags['Transfer-Recipient']
  local quantity = bint(message.Tags['Transfer-Quantity'])

  balances[caller] = utils.subtract(balances[caller], quantity)
  balances[target] = utils.add(balances[target], quantity)

  return 'Transferred.'
end


--------------------
------ ALLOW -------
--------------------
function ValidateAllow(message, balances)
  local caller = message.From
  local target = message.Tags['Allow-Target']
  local quantity = message.Tags['Allow-Quantity']

  if not quantity or not utils.toNumber(quantity) or not utils.positive(quantity) then
    return false, 'Invalid quantity'
  end

  if not caller or string.len(caller) ~= 43 then
    return false, 'Invalid caller'
  end

  if not target or string.len(target) ~= 43 then
    return false, 'Invalid target'
  end

  if caller == target then
    return false, 'Target can not be caller'
  end


  InitializeBalance(balances, caller)

  if bint(balances[caller]) < bint(quantity) then
    return false, 'Not enough balance to allow'
  end

  return true, ''
end

function Allow(message, balances, claimables)
  local validated, err = ValidateAllow(message, balances)
  if not validated then
    return err
  end

  local caller = message.From
  local target = message.Tags['Allow-Target']
  local quantity = bint(message.Tags['Allow-Quantity'])

  balances[caller] = utils.subtract(balances[caller], quantity)
  table.insert(claimables, {
    From = caller,
    To = target,
    Quantity = utils.toBalanceValue(quantity),
    TxID = message.Id
  })

  return 'Allowed.'
end

--------------------
------ CLAIM -------
--------------------

function ValidateClaim(message, claimables)
  local caller = message.From
  local quantity = message.Tags['Claim-Quantity']
  local txId = message.Tags['Claim-TxID']

  if not quantity or not utils.toNumber(quantity) or not utils.positive(quantity) then
    return false, 'Invalid quantity'
  end


  if not txId then
    return false, 'Invalid txId', nil, nil
  end

  local matchingClaimableIndex = nil
  local matchingClaimable = nil
  for i, v in pairs(claimables) do
    if (v['TxID'] == txId) then
      matchingClaimableIndex = i
      matchingClaimable = v
      break
    end
  end

  if not matchingClaimable then
    return false, 'Claimable not found', nil, nil
  end

  if matchingClaimable['Quantity'] ~= quantity then
    return false, 'Claimable quantity is not equal to claimed quantity', nil, nil
  end

  if matchingClaimable['To'] ~= caller then
    return false, 'Claimable is not addressed to caller', nil, nil
  end
  return true, '', matchingClaimable, matchingClaimableIndex
end

function Claim(message, claimables, balances)
  local validated, err, claimable, index = ValidateClaim(message, claimables)
  if not validated then
    return err
  end

  local caller = message.From
  local quantity = bint(message.Tags['Claim-Quantity'])

  InitializeBalance(balances, caller)
  balances[caller] = utils.add(balances[caller], quantity)
  table.remove(claimables, index)
  return 'Claimed.'
end
--------------------
--- READ STAMPS ----
--------------------
function ValidateReadStampsByAsset(message)
  local assetId = message.Tags['Data-Source']
  if not assetId or string.len(assetId) ~= 43 then
    return false, 'Invalid asset id'
  end

  return true, ''
end

function ReadStampsByAsset(message, resolve)
  local validated, err = ValidateReadStampsByAsset(message)
  if not validated then
    return err
  end

  local assetId = message.Tags['Data-Source']
  local operation = [[
    query GetStamp ($asset: String!) {
        stampsByAsset (asset: $asset) {
          Asset
          Address
          Vouched
      }
    }
  ]]
  local variables = { asset = assetId }
  local res = resolve(operation, variables)
  return res
end

function ValidateReadStampsByAssets(message)
  local assetIds = message.Tags['Data-Sources']
  if not assetIds then
    return false, 'Invalid asset ids'
  end

  local parsedIds = json.decode(assetIds)
  for _, id in ipairs(parsedIds) do
    if not id or string.len(id) ~= 43 then
      return false, 'Invalid asset id'
    end
  end
  return true, ''
end

function ReadStampsByAssets(message, resolve)
  local validated, err = ValidateReadStampsByAssets(message)
  if not validated then
    return err
  end

  local assetIds = message.Tags['Data-Sources']
  local parsedIds = json.decode(assetIds)
  local results = {}

  local operation = [[
    query GetStamp ($asset: String!) {
        stampsByAsset (asset: $asset) {
          Asset
          Address
          Vouched
      }
    }
  ]]
  for _, assetId in ipairs(parsedIds) do
    
    local variables = { asset = assetId }
    local res = resolve(operation, variables)
    results[assetId] = res['stampsByAsset']
  end
  return results
  -- return res
end

function ValidateReadStampsByAddress(message)
  local addressId = message.Tags['Data-Source']
  if not addressId or string.len(addressId) ~= 43 then
    return false, 'Invalid address'
  end

  return true, ''
end

function ReadStampsByAddress(message, resolve)
  local validated, err = ValidateReadStampsByAddress(message)
  if not validated then
    return err
  end

  local address = message.Tags['Data-Source']
  local operation = [[
    query GetStamp ($address: String!) {
        stampsByAddress (address: $address) {
          Asset
          Address
          Vouched
      }
    }
  ]]
  local variables = { address = address }
  local res = resolve(operation, variables)
  return res
end
---------------------------------------------------
---------------------- CRON -----------------------
---------------------------------------------------
--- Bound: Makes sure stampHistory table is within the MAXIMUM_STAMPS bound
function Bound(stampHistory, max)
  TrimTable(stampHistory, max)
  return "ok."
end

--- Credit: Distributes credits
function Credit(BlockHeight, credits, balances)
  if not credits then
    credits = {}
    return
  end
  if not balances then
    balances = {}
  end

  local filteredCredits = {}
  local newCredits = {}
  for height, credit in pairs(credits) do
    if (height < BlockHeight) then
      filteredCredits[height] = credit
    else
      newCredits[height] = credit
    end
  end

  for _, heightCredits in pairs(filteredCredits) do
    for _, credit in pairs(heightCredits) do
      if not balances[credit['Holder']] then
        balances[credit['Holder']] = 0
      end
      balances[credit['Holder']] = balances[credit['Holder']] + credit['Quantity']
    end
  end

  credits = newCredits
end

--- Reward
function Reward(BlockHeight, lastReward, balances, stamps, stampHistory, allocateAtomicAssets)
  if not utils.positive(TableLength(stamps)) then
    return 'No Stamps'
  end

  local reward = GetReward(BlockHeight, balances)
  if reward == 'Error: Not Enough Reward' then
    return 'Error: Not Enough Reward'
  end

  if lastReward + 720 > BlockHeight then
    return 'Error: Not Time to reward'
  end

  local assetRewards = Mint(stamps, reward)
  local atomicAllocations = allocateAtomicAssets(assetRewards, BlockHeight)

  UpdateRewardBalances(atomicAllocations, balances)
  ClearStampHistory(stamps, stampHistory)

  lastReward = BlockHeight
  return "Rewarded."
end


function GetReward(BlockHeight, balances)
  TOTAL_SUPPLY = 435000 * 1e12
  HALVING_SUPPLY = 315328 * 1e12
  ORIGIN_HEIGHT = 1178473
  CYCLE_INTERVAL = 1051200
  local S100 = 1 * 1e12
  local currentSumOfBalances = SumOfBalances(balances)
  if (bint.__le(bint(HALVING_SUPPLY), bint(currentSumOfBalances))) then
    InitializeBalance(balances, ProcessId)

    -- If no more reward, use contract balance as reward treasury
    if (utils.positive(utils.subtract(balances[ProcessId], S100))) then
      balances[ProcessId] = utils.subtract(balances[ProcessId], S100)
      return S100
    end
    return 'Error: Not Enough Reward'
  end

  local heightDiff = BlockHeight - ORIGIN_HEIGHT
  local currentCylcle = math.floor(heightDiff / CYCLE_INTERVAL) + 1
  local divisor = 2 ^ currentCylcle
  local reward = math.floor(math.floor(HALVING_SUPPLY / divisor) / 1.73 / 365)

  return reward
end

function Mint(stamps, reward)
  local uniqueStampers = {}
  local stampers = {}
  for _, stamp in pairs(stamps) do
    local address = stamp['Address']
    if not uniqueStampers[address] then
      uniqueStampers[address] = 1
    end

    if not stampers[address] then
        stampers[address] = {}
    end
    table.insert(stampers[address], stamp)
  end
  local totalUniqueStampers = TableLength(uniqueStampers)
  local mintRemainder = reward % totalUniqueStampers
  local rewardPerStamper = math.floor(bint(reward) / totalUniqueStampers)

  local assetRewards = {}
  for _, stamperStamps in pairs(stampers) do
    local stamperTotalReward = rewardPerStamper
    local numberOfStamps = TableLength(stamperStamps)
    if (mintRemainder > 0) then
      stamperTotalReward = stamperTotalReward + 1
      mintRemainder = mintRemainder - 1
    end
    local stamperRemainder = stamperTotalReward % numberOfStamps
    local allocationPerStamp = math.floor(stamperTotalReward / numberOfStamps)

    for _, stamp in pairs(stamperStamps) do
      local asset = stamp['Asset']
      local rewardForAsset = allocationPerStamp
      if stamperRemainder > 0 then
        rewardForAsset = rewardForAsset + 1
        stamperRemainder = stamperRemainder - 1
      end
      if not assetRewards[asset] then
        assetRewards[asset] = 0
      end
      assetRewards[asset] = assetRewards[asset] + rewardForAsset
    end
  end

  return assetRewards

end

function AllocateAtomicAssets(assetRewards, blockHeight)
  local atomicAllocations = {}
  for asset, reward in pairs(assetRewards) do
    local isAtomicAsset, owner = IsAtomicAsset(asset)
    if isAtomicAsset then
      local atomicBalances = GetAtomicBalances(asset, owner, blockHeight)
      local assetAllocations = Allocate(atomicBalances, reward)
      atomicAllocations[asset] = assetAllocations
    else
      atomicAllocations[asset] = { [owner] = reward }
    end
  end
  return atomicAllocations
end

function IsAtomicAsset(asset)
  local assetHeaders = drive.getDataItem(asset)
  if type(assetHeaders) == "string" then
    local parsedHeaders = json.decode(assetHeaders)
    local tags = parsedHeaders['tags']
    local owner = ProcessId
    if parsedHeaders['owner']['address'] then
      owner = parsedHeaders['owner']['address']
    end
    for _, tag in ipairs(tags) do
      if tag['name'] == 'Type' and tag['value'] == 'Process' then
        return true, owner
      end
    end


  end
  return false, ProcessId
end

function GetAtomicBalances(asset, owner, blockHeight)
  Send({ Target = asset, Action = "Info"})

  local nextBlockHeight = blockHeight + 5
  if not HangingReceives[nextBlockHeight] then
    HangingReceives[nextBlockHeight] = {}
  end
  HangingReceives[nextBlockHeight][Handlers.onceNonce] = owner
  local infoResponse = Receive({ From = asset })
  local decodedInfo = json.decode(infoResponse.Data)
  local assetBalances = decodedInfo['Balances']
  return assetBalances
end

function UpdateRewardBalances(atomicAllocations, balances)
  for _, allocations in pairs(atomicAllocations) do
    for address, reward in pairs(allocations) do
      InitializeBalance(balances, address)
      balances[address] = utils.add(balances[address], reward)
    end
  end
end

function ClearStampHistory(stamps, stampHistory)
  for key, _ in pairs(stamps) do
    stamps[key] = nil
    stampHistory[key] = 1
  end
end

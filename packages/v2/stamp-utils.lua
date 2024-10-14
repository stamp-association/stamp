---------------------------------------------------
--------------------- UTILS -----------------------
---------------------------------------------------
function InitializeBalance(balances, address)
  if not balances[address] then
    balances[address] = utils.toBalanceValue(0)
  end
end

function AddStampIndex(stampIndex, index, stamp)
  if not stampIndex[index] then
    stampIndex[index] = {}
  end
  table.insert(stampIndex[index], stamp)
end

function GetBalance(balances, address)
  InitializeBalance(balances, address)
  return balances[address]
end

function TableLength(T)
  local count = 0
  for _ in pairs(T) do count = count + 1 end
  return count
end

function EmptyTable(T)
  for key in pairs(T) do
    T[key] = nil
  end
end

function TrimTable(T, max)
  local size = TableLength(T)

  -- If the table exceeds 1 million entries, remove the oldest ones
  if size > max then
      local excess = size - max
      -- Remove excess entries from the start of the table
      for _ = 1, excess do
          table.remove(T, 1)
      end
  end
end

function IsVouched(tx)
  Send({ Target = VouchProcessId, Action = "Get-Vouches", ID = tx, Data = "Vouch"})
  local res = Receive({ From = VouchProcessId })
  local parsedData = json.decode(res.Data)
  local totalValue = parsedData['Total-Value']
  local isVouched = totalValue ~= '0-USD'
  return isVouched
end

function DivideQty(n)
  if bint.__lt(bint(n), bint(1)) then
    return bint(0), bint(0), bint(0)
  end
  local rewardPercent = bint(80) / bint(100)
  local creditPercent = bint(18) / bint(100)
  local feePercent = bint(2) / bint(100)
  return math.floor(n * rewardPercent), math.floor(n * creditPercent), math.floor(n * feePercent)
end

function SumOfBalances(balances)
  local total = bint(0)
  for _, value in pairs(balances) do
    if utils.positive(value) then
      total = utils.add(total, value)
    end
  end
  return total
end

function Allocate(balances, reward)
  local total = SumOfBalances(balances)

  local allocation = {}
  local addresses = {}
  for address, balance in pairs(balances) do
    table.insert(addresses, address)
    if (bint(balance) > bint(0)) then
      local percent = (balance / total)
      local coins = math.floor((reward * percent))
      allocation[address] = tonumber(coins)
    end
  end

  local allocated = 0
  for _, v in pairs(allocation) do
    if v > 0 then
      allocated = allocated + v
    end
  end

  local remainder = reward - allocated

  local index = 1
  while remainder > 0 do
    allocation[addresses[index]] = allocation[addresses[index]] + 1
    index = (index % TableLength(addresses)) + 1
    remainder = remainder - 1
  end

  return allocation
end

function UpdateCredits(BlockHeight, txId, creditsTable, credits, balances)
  local fbh = BlockHeight + ANNUAL_BLOCKS
  if not creditsTable then
    creditsTable = {}
  end
  if not creditsTable[fbh] then
    creditsTable[fbh] = {}
  end

  if utils.positive(credits) then
    local results = Allocate(balances, credits)
    for address, creditBalance in pairs(results) do
      table.insert(creditsTable[fbh], {
        Holder = address,
        Quantity = utils.toBalanceValue(creditBalance),
        Asset = txId
      })
    end
  end

  return creditsTable
end

function HandleHangingReceives(BlockHeight, hangingReceives)
  for bh, nonces in pairs(hangingReceives) do
    if (bh <= BlockHeight) then
      for nonce, owner in pairs(nonces) do
        for _, handler in ipairs(Handlers.list) do
          if (handler.name == '_once_' .. nonce) then
            handler.handle({ Data = json.encode({ Balances = { [owner] = 1 } })}, ao.env)
          end
        end
        Handlers.remove("_once_" .. nonce)
      end
      HangingReceives[bh] = nil
    end
  end
end
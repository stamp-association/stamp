StampTests = Test.new("Stamp Test Suite")

---------------------------------------------------
---------------------- TESTS ----------------------
---------------------------------------------------

--------------------
----- REGISTER -----
--------------------
function InitRegisterTests()
  StampTests:add(
    "REGISTER: Register transaction",
    function()
      local testAssets = {}
      local registerResult = Register({ Tags = { ['Stamp-Register-Asset-TxID'] = '123' }, From = 'Jack' }, testAssets)
      local registerResult2 = Register({ Tags = { ['Stamp-Register-Asset-TxID'] = '456' }, From = 'Jack' }, testAssets)

      assert(registerResult == 'Registered.', 'Unexpected register return')
      assert(registerResult2 == 'Registered.', 'Unexpected register return')
      assert(testAssets['123']['Balances']['Jack'] == 1, 'Register unsuccessful')
      assert(testAssets['456']['Balances']['Jack'] == 1, 'Register unsuccessful')
    end
  )
  StampTests:add(
    "REGISTER: Register existing transaction",
    function()
      local testAssets = { ['123'] = { Balances = { ['Jack'] = 1 }}}
      local registerResult = Register({ Tags = { ['Stamp-Register-Asset-TxID'] = '123' }, From = 'Jack' }, testAssets)

      assert(registerResult == 'Registered.', 'Unexpected register return')
      assert(testAssets['123']['Balances']['Jack'] == 1, 'Register unsuccessful')
    end
  )
end

--------------------
------ STAMP -------
--------------------
function InitStampTests()
  local function isVouched(tx)
    return true
  end
  local fromAddress = 'FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFRO'
  local targetAddress = 'TARGETTARGETTARGETTARGETTARGETTARGETTARGETT'
  StampTests:add(
    "STAMP: No Caller",
    function()
      local testStampHistory = {}
      local testStamps = {}
      local testStampsByAsset = {}
      local testStampsByAddress = {}
      local stampResult = Stamp(
        {
          Tags = { ['Data-Source'] = targetAddress }
        },
        testStamps,
        testStampsByAddress,
        testStampsByAsset,
        testStampHistory,
        isVouched
      )
      assert(stampResult == "Invalid caller", "Validation should fail!")
    end
  )

  StampTests:add(
    "STAMP: Caller not length 43",
    function()
      local testStampHistory = {}
      local testStamps = {}
      local testStampsByAsset = {}
      local testStampsByAddress = {}
      local stampResult = Stamp(
        {
          From = "Jack",
          Tags = { ['Data-Source'] = targetAddress }
        },
        
        testStamps,
        testStampsByAddress,
        testStampsByAsset,
        testStampHistory,
        isVouched
      )
      assert(stampResult == "Invalid caller", "Validation should fail!")
    end
  )

  StampTests:add(
    "STAMP: No TxID",
    function()
      local testStampHistory = {}
      local testStamps = {}
      local testStampsByAsset = {}
      local testStampsByAddress = {}
      local stampResult = Stamp(
        {
          From = fromAddress,
          Tags = { }
        },
        
        testStamps,
        testStampsByAddress,
        testStampsByAsset,
        testStampHistory,
        isVouched
      )

      assert(stampResult == "Invalid txID", "Validation should fail!")
    end
  )

  StampTests:add(
    "STAMP: TxID not length 43",
    function()
      local testStampHistory = {}
      local testStamps = {}
      local testStampsByAsset = {}
      local testStampsByAddress = {}
      local stampResult = Stamp(
        {
          From = fromAddress,
          Tags = { ['Data-Source'] = 'Tx-123' }
        },
        
        testStamps,
        testStampsByAddress,
        testStampsByAsset,
        testStampHistory,
        isVouched
      )

      assert(stampResult == "Invalid txID", "Validation should fail!")
    end
  )

  StampTests:add(
    "STAMP: Already stamped",
    function()
      local testStampHistory = {}
      local testStamps = {
        [string.format("%s:%s", targetAddress, fromAddress)] = {
          Asset = targetAddress,
          Address = fromAddress
        }
      }
      local testStampsByAsset = {}
      local testStampsByAddress = {}
      local stampResult = Stamp(
        {
          From = fromAddress,
          Tags = { ['Data-Source'] = targetAddress }
        },
        testStamps,
        testStampsByAddress,
        testStampsByAsset,
        testStampHistory,
        isVouched
      )

      assert(stampResult == "Already stamped", "Validation should fail!")
    end
  )

  StampTests:add(
    "STAMP: Already stamped history",
    function()
      local testStampHistory = {
        [string.format("%s:%s", targetAddress, fromAddress)] = {
          Asset = targetAddress,
          Address = fromAddress
        }
      }
      local testStamps = {}
      local testStampsByAsset = {}
      local testStampsByAddress = {}
      local stampResult = Stamp(
        {
          From = fromAddress,
          Tags = { ['Data-Source'] = targetAddress }
        },
        testStamps,
        testStampsByAddress,
        testStampsByAsset,
        testStampHistory,
        isVouched
      )

      assert(stampResult == "Already stamped", "Validation should fail!")
    end
  )

  StampTests:add(
    "STAMP: Successful stamp",
    function()
      local testStampHistory = {
        [string.format("%s:%s", fromAddress, targetAddress)] = {
          Asset = fromAddress,
          Address = targetAddress
        }
      }
      local testStamps = {}
      local testStampsByAddress = {}
      local testStampsByAsset = {}
      local stampResult = Stamp(
        {
          From = fromAddress,
          Tags = { ['Data-Source'] = targetAddress }
        },
        testStamps,
        testStampsByAddress,
        testStampsByAsset,
        testStampHistory,
        isVouched
      )

      assert(testStampHistory[string.format("%s:%s", fromAddress, targetAddress)]["Asset"] == fromAddress, 'Stamp history should not be removed')
      assert(testStampHistory[string.format("%s:%s", fromAddress, targetAddress)]["Address"] == targetAddress, 'Stamp history should not be removed')

      assert(testStamps[string.format("%s:%s", targetAddress, fromAddress)]["Asset"] == targetAddress, 'Stamp should be added')
      assert(testStamps[string.format("%s:%s", targetAddress, fromAddress)]["Address"] == fromAddress, 'Stamp should be added')
      assert(testStamps[string.format("%s:%s", targetAddress, fromAddress)]["Vouched"] == true, 'Stamp should be added')

      assert(testStampsByAddress[fromAddress][1]['Address'] == fromAddress, 'Stamp address index should be updated!')
      assert(testStampsByAddress[fromAddress][1]['Asset'] == targetAddress, 'Stamp address index should be updated!')
      assert(testStampsByAddress[fromAddress][1]['Vouched'] == true, 'Stamp address index should be updated!')

      assert(testStampsByAsset[targetAddress][1]['Address'] == fromAddress, 'Stamp asset index should be updated!')
      assert(testStampsByAsset[targetAddress][1]['Asset'] == targetAddress, 'Stamp asset index should be updated!')
      assert(testStampsByAsset[targetAddress][1]['Vouched'] == true, 'Stamp asset index should be updated!')

      assert(stampResult == "Stamped.", "Stamp should succeed!")
    end
  )
end

--------------------
---- READ STAMPS ---
--------------------
function InitReadStampTests()
  local fromAddress = 'FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFRO'
  local assetId = 'ASSETASSETASSETASSETASSETASSETASSETASSET000'
  local assetOperation = [[
    query GetStamp ($asset: String!) {
        stampsByAsset (asset: $asset) {
          Asset
          Address
          Vouched
      }
    }
  ]]
  local addressOperation = [[
    query GetStamp ($address: String!) {
        stampsByAddress (address: $address) {
          Asset
          Address
          Vouched
      }
    }
  ]]

  StampTests:add(
    "READ STAMPS: ASSET: Invalid asset",
    function()
      local resolve = function (operation, variables)
        assert(operation == assetOperation)
        assert(variables['asset'] == assetId)
      end
      local readStampsResult = ReadStampsByAsset(
        { From = fromAddress, Tags = { ['Data-Source'] = 'Asset-Id' } },
        resolve
      )
      assert(readStampsResult == "Invalid asset id", "Validation should fail!")
    end
  )

  StampTests:add(
    "READ STAMPS: ASSET: Successful read",
    function()
      local resolve = function (operation, variables)
        assert(operation == assetOperation)
        assert(variables['asset'] == assetId)
        return 'ok'
      end
      local readStampsResult = ReadStampsByAsset(
        { From = fromAddress, Tags = { ['Data-Source'] = assetId } },
        resolve
      )
      assert(readStampsResult == "ok", "Resolver should run!")
    end
  )

  StampTests:add(
    "READ STAMPS: ASSETS: Invalid asset",
    function()
      local resolve = function (operation, variables)
        assert(operation == assetOperation)
        assert(variables['asset'] == assetId)
      end
      local readStampsResult = ReadStampsByAssets(
        { From = fromAddress, Tags = { ['Data-Sources'] = json.encode({ assetId, 'asset' }) } },
        resolve
      )
      assert(readStampsResult == "Invalid asset id", "Validation should fail!")
    end
  )

  StampTests:add(
    "READ STAMPS: ASSETS: Successful read",
    function()
      local resolve = function (operation, variables)
        assert(operation == assetOperation)
        assert(variables['asset'] == assetId)
        return { stampsByAsset = 'ok' }
      end
      local readStampsResult = ReadStampsByAssets(
        { From = fromAddress, Tags = { ['Data-Sources'] = json.encode({ assetId }) } },
        resolve
      )
      assert(readStampsResult[assetId] == 'ok', "Resolver should run!")
    end
  )

  StampTests:add(
    "READ STAMPS: ADDRESS: Invalid address",
    function()
      local resolve = function (operation, variables)
        assert(operation == addressOperation)
        assert(variables['address'] == fromAddress)
      end
      local readStampsResult = ReadStampsByAddress(
        { From = fromAddress, Tags = { ['Data-Source'] = 'Address' } },
        resolve
      )
      assert(readStampsResult == "Invalid address", "Validation should fail!")
    end
  )

  StampTests:add(
    "READ STAMPS: ADDRESS: Successful read",
    function()
      local resolve = function (operation, variables)
        assert(operation == addressOperation)
        assert(variables['address'] == fromAddress)
        return 'ok'
      end
      local readStampsResult = ReadStampsByAddress(
        { From = fromAddress, Tags = { ['Data-Source'] = fromAddress } },
        resolve
      )
      assert(readStampsResult == "ok", "Resolver should run!")
    end
  )

end

--------------------
--- SUPER STAMP ----
--------------------
function InitSuperStampTests()
  local fromAddress = 'FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFRO'
  local fromAddress2 = 'FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFR2'
  local fromAddress3 = 'FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFR3'
  local assetAddress = 'TARGETTARGETTARGETTARGETTARGETTARGETTARGETT'
  StampTests:add(
    "SUPERSTAMP: No Quantity",
    function()
      local testBalances = {}
      local superStampResult = SuperStamp(
        {
          From = fromAddress,
          Tags = { ['Transfer-Recipient'] = assetAddress }
        },
        testBalances
      )

      assert(superStampResult == "Not Super Stamp", "Validation should fail!")
    end
  )

  StampTests:add(
    "SUPERSTAMP: Non-numeric Quantity",
    function()
      local testBalances = {}
      local superStampResult = SuperStamp(
        {
          From = fromAddress,
          Tags = { ['Transfer-Recipient'] = assetAddress, ['Super-Stamp-Quantity'] = 'Ten' }
        },
        
        testBalances
      )
      assert(superStampResult == "Not Super Stamp", "Validation should fail!")
    end
  )
  StampTests:add(
    "SUPERSTAMP: No Caller",
    function()
      local testStampHistory = {}
      local superStampResult = SuperStamp(
        {
          Tags = {['Data-Source'] = assetAddress }
        },
        
        testStampHistory
      )
      assert(superStampResult == "Not Super Stamp", "Validation should fail!")
    end
  )

  StampTests:add(
    "SUPERSTAMP: Caller not length 43",
    function()
      local testStampHistory = {}
      local superStampResult = SuperStamp(
        {
          From = "Jack",
          Tags = { ['Data-Source'] = assetAddress }
        },
        
        testStampHistory
      )
      assert(superStampResult == "Not Super Stamp", "Validation should fail!")
    end
  )

  StampTests:add(
    "SUPERSTAMP: No TxID",
    function()
      local testStampHistory = {}
      local superStampResult = SuperStamp(
        {
          From = fromAddress,
          Tags = { }
        },
        
        testStampHistory
      )

      assert(superStampResult == "Not Super Stamp", "Validation should fail!")
    end
  )

  StampTests:add(
    "SUPERSTAMP: TxID not length 43",
    function()
      local testStampHistory = {}
      local superStampResult = SuperStamp(
        {
          From = fromAddress,
          Tags = { ['Data-Source'] = 'Tx-123' }
        },
        
        testStampHistory
      )

      assert(superStampResult == "Not Super Stamp", "Validation should fail!")
    end
  )

  StampTests:add(
    "SUPERSTAMP: Successful super stamp",
    function()
      function isAtomicAsset(_)
        return true
      end

      function getAtomicBalances(blockheight, owner, asset)
        return {
          [fromAddress] = 1,
          [fromAddress2] = 1,
          [fromAddress3] = 1
        }
      end
      local testBalances = {
        [fromAddress] = "2001"
      }

      local testCredits = {}
      local superStampResult = SuperStamp(
        {
          ['Block-Height'] = 720 * 365 * 2,
          From = fromAddress,
          Tags = { ['Data-Source'] = assetAddress, ['Super-Stamp-Quantity'] = "1566" }
        },
        testBalances,
        testCredits,
        isAtomicAsset,
        getAtomicBalances
      )

      -- From Address: Starts with 2001, loses 1565 (quantity), gains 417 as reward. 1565 is added back on here as it is removed in Stamp, which we bypass for this test
      assert(testBalances[fromAddress] == utils.toBalanceValue(2001 - 1565 + 417 + 1565), 'From Address should increase balance')
      -- From Address 2: Starts with 0, gains 417 as reward. Also receives 1 as remainder correction.
      assert(testBalances[fromAddress2] == utils.toBalanceValue(0 + 417 + 1), 'From Address 2 should increase balance')
      -- From Address 3: Starts with 0, gains 417 as reward
      assert(testBalances[fromAddress3] == utils.toBalanceValue(0 + 417), 'From Address 3 should increase balance')

      local fbh = 720 * 365 * 2 + ANNUAL_BLOCKS
      local fbhCredit = testCredits[fbh]
      for _, credit in pairs(fbhCredit) do
        assert(credit['Asset'] == assetAddress, 'Asset address incorrect')
        if (credit['Holder'] == fromAddress) then
          assert(credit['Quantity'] == utils.toBalanceValue(93 + 1), 'From address should receive credits')
        elseif (credit['Holder'] == fromAddress2) then
          assert(credit['Quantity'] == utils.toBalanceValue(93 + 1), 'From address 2 should receive credits')
        elseif (credit['Holder'] == fromAddress3) then
          assert(credit['Quantity'] == utils.toBalanceValue(93), 'From address 3 should receive credits')
        end
      end

      assert(superStampResult == "Super Stamped.", "Stamp should be successful!")
    end
  )

  
end

--------------------
----- BALANCE ------
--------------------
function InitBalanceTests()
  StampTests:add(
    "BALANCE: No From or Target",
    function()
      local testBalances = {}
      local balanceResult = Balance({ },  testBalances)
      assert(balanceResult == "Not Validated.", "Validation should fail!")
    end
  )
  StampTests:add(
    "BALANCE: From only",
    function()
      local testBalances = { ['Jack'] = 10 }
      local balanceResult = Balance({ Tags = { }, From = 'Jack' },  testBalances)
      assert(balanceResult == 10, "Should retrieve balance of From!")
    end
  )
  StampTests:add(
    "BALANCE: From and target",
    function()
      local testBalances = { ['Jack'] = 10 }
      local balanceResult = Balance({ Tags = { Target = 'Jack' }, From = 'Foo' }, testBalances)
      assert(balanceResult == 10, "Should retrive balance of Target!")
    end
  )
end


--------------------
----- TRANSFER -----
--------------------
function InitTransferTests()
  local fromAddress = 'FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFRO'
  local targetAddress = 'TARGETTARGETTARGETTARGETTARGETTARGETTARGETT'
  StampTests:add(
    "TRANSFER: No Quantity",
    function()
      local testBalances = {}
      local transferResult = Transfer(
        {
          From = fromAddress, 
          Tags = { ['Transfer-Recipient'] = targetAddress }
        },
        
        testBalances
      )
      assert(transferResult == "Invalid quantity", "Validation should fail!")
    end
  )

  StampTests:add(
    "TRANSFER: Non-numeric Quantity",
    function()
      local testBalances = {}
      local transferResult = Transfer(
        {
          From = fromAddress,
          Tags = { ['Transfer-Recipient'] = targetAddress, ['Transfer-Quantity'] = 'Ten' }
        },
        
        testBalances
      )
      assert(transferResult == "Invalid quantity", "Validation should fail!")
    end
  )

  StampTests:add(
    "TRANSFER: No Caller",
    function()
      local testBalances = {}
      local transferResult = Transfer(
        {
          Tags = { ['Transfer-Recipient'] = targetAddress, ['Transfer-Quantity'] = '10' }
        },
        
        testBalances
      )
      assert(transferResult == "Invalid caller", "Validation should fail!")
    end
  )

  StampTests:add(
    "TRANSFER: Caller not length 43",
    function()
      local testBalances = {}
      local transferResult = Transfer(
        {
          From = "Jack",
          Tags = { ['Transfer-Recipient'] = targetAddress, ['Transfer-Quantity'] = '10' }
        },
        
        testBalances
      )
      assert(transferResult == "Invalid caller", "Validation should fail!")
    end
  )

  StampTests:add(
    "TRANSFER: No Target",
    function()
      local testBalances = {}
      local transferResult = Transfer(
        {
          From = fromAddress,
          Tags = { ['Transfer-Quantity'] = '10' }
        },
        
        testBalances
      )
      assert(transferResult == "Invalid target", "Validation should fail!")
    end
  )

  StampTests:add(
    "TRANSFER: Target not length 43",
    function()
      local testBalances = {}
      local transferResult = Transfer(
        {
          From = "Jack",
          Tags = { ['Transfer-Recipient'] = 'Jack', ['Transfer-Quantity'] = '10' }
        },
        
        testBalances
      )
      assert(transferResult == "Invalid caller", "Validation should fail!")
    end
  )
  StampTests:add(
    "TRANSFER: Caller can not be target",
    function()
      local testBalances = {}
      local transferResult = Transfer(
        {
          From = fromAddress,
          Tags = { ['Transfer-Recipient'] = fromAddress, ['Transfer-Quantity'] = '10' }
        },
        
        testBalances
      )

      assert(transferResult == "Target can not be caller", "Validation should fail!")
    end
  )
  StampTests:add(
    "TRANSFER: Set balance to 0 if caller has none",
    function()
      local testBalances = {
        [targetAddress] = "100"
      }
      Transfer(
        {
          From = fromAddress,
          Tags = { ['Transfer-Recipient'] = targetAddress, ['Transfer-Quantity'] = '10' }
        },
        
        testBalances
      )

      assert(testBalances[fromAddress] == "0", "Should initialize from address balance to zero!")
    end
  )

  StampTests:add(
    "TRANSFER: Set balance to 0 if target has none",
    function()
      local testBalances = {
        [fromAddress] = "100"
      }
      Transfer(
        {
          From = fromAddress,
          Tags = { ['Transfer-Recipient'] = targetAddress, ['Transfer-Quantity'] = '10' }
        },
        
        testBalances
      )
      assert(testBalances[targetAddress] == '10', "Should initialize from address balance to zero and add ten!")
    end
  )

  StampTests:add(
    "TRANSFER: Caller not enough quantity",
    function()
      local testBalances = {
        [fromAddress] = "5"
      }
      local result = Transfer(
        {
          From = fromAddress,
          Tags = { ['Transfer-Recipient'] = targetAddress, ['Transfer-Quantity'] = '10' }
        },
        
        testBalances
      )

      assert(result == 'Not enough balance to transfer', 'Validation should fail!')
      assert(testBalances[targetAddress] == "0", "Should initialize from address balance to zero!")
    end
  )

  StampTests:add(
    "TRANSFER: Successful transfer",
    function()
      local testBalances = {
        [fromAddress] = "100",
        [targetAddress] = "100"
      }
      local result = Transfer(
        {
          From = fromAddress,
          Tags = { ['Transfer-Recipient'] = targetAddress, ['Transfer-Quantity'] = '50' }
        },
        
        testBalances
      )

      assert(result == 'Transferred.', 'Transfer should succeed!')
      assert(testBalances[fromAddress] == "50", "Caller balance should decrease")
      assert(testBalances[targetAddress] == "150", "Target balance should increase")
    end
  )

end

--------------------
------ ALLOW -------
--------------------
function InitAllowTests()
  local fromAddress = 'FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFRO'
  local targetAddress = 'TARGETTARGETTARGETTARGETTARGETTARGETTARGETT'
  StampTests:add(
    "ALLOW: No Quantity",
    function()
      local testBalances = {}
      local allowResult = Allow(
        {
          From = fromAddress, 
          Tags = { ['Allow-Target'] = targetAddress }
        },
        
        testBalances
      )
      assert(allowResult == "Invalid quantity", "Validation should fail!")
    end
  )

  StampTests:add(
    "ALLOW: Non-numeric Quantity",
    function()
      local testBalances = {}
      local allowResult = Allow(
        {
          From = fromAddress,
          Tags = { ['Allow-Target'] = targetAddress, ['Allow-Quantity'] = 'Ten' }
        },
        
        testBalances
      )
      assert(allowResult == "Invalid quantity", "Validation should fail!")
    end
  )

  StampTests:add(
    "ALLOW: No Caller",
    function()
      local testBalances = {}
      local allowResult = Allow(
        {
          Tags = { ['Allow-Target'] = targetAddress, ['Allow-Quantity'] = '10' }
        },
        
        testBalances
      )
      assert(allowResult == "Invalid caller", "Validation should fail!")
    end
  )

  StampTests:add(
    "ALLOW: Caller not length 43",
    function()
      local testBalances = {}
      local allowResult = Allow(
        {
          From = "Jack",
          Tags = { ['Allow-Target'] = targetAddress, ['Allow-Quantity'] = '10' }
        },
        
        testBalances
      )
      assert(allowResult == "Invalid caller", "Validation should fail!")
    end
  )

  StampTests:add(
    "ALLOW: No Target",
    function()
      local testBalances = {}
      local allowResult = Allow(
        {
          From = fromAddress,
          Tags = { ['Allow-Quantity'] = '10' }
        },
        
        testBalances
      )
      assert(allowResult == "Invalid target", "Validation should fail!")
    end
  )

  StampTests:add(
    "ALLOW: Target not length 43",
    function()
      local testBalances = {}
      local allowResult = Allow(
        {
          From = "Jack",
          Tags = { ['Allow-Target'] = 'Jack', ['Allow-Quantity'] = '10' }
        },
        
        testBalances
      )
      assert(allowResult == "Invalid caller", "Validation should fail!")
    end
  )
  StampTests:add(
    "ALLOW: Caller can not be target",
    function()
      local testBalances = {}
      local AllowResult = Allow(
        {
          From = fromAddress,
          Tags = { ['Allow-Target'] = fromAddress, ['Allow-Quantity'] = '10' }
        },
        
        testBalances
      )

      assert(AllowResult == "Target can not be caller", "Validation should fail!")
    end
  )
  StampTests:add(
    "ALLOW: Caller not enough quantity",
    function()
      local testBalances = {
        [fromAddress] = "5"
      }
      local result = Allow(
        {
          From = fromAddress,
          Tags = { ['Allow-Target'] = targetAddress, ['Allow-Quantity'] = '10' }
        },
        
        testBalances
      )

      assert(result == 'Not enough balance to allow', 'Validation should fail!')
    end
  )

  StampTests:add(
    "ALLOW: Successful Allow",
    function()
      local testBalances = {
        [fromAddress] = "100",
        [targetAddress] = "100"
      }
      local testClaimables = {}
      local result = Allow(
        {
          Id = 'Message-Id-1',
          From = fromAddress,
          Tags = { ['Allow-Target'] = targetAddress, ['Allow-Quantity'] = '60' }
        },
        testBalances,
        testClaimables
      )

      assert(result == 'Allowed.', 'Allow should succeed!')
      assert(testBalances[fromAddress] == "40", "Caller balance should decrease")
      assert(testBalances[targetAddress] == "100", "Target balance should not increase")
      local newClaimable = table.remove(testClaimables, 1)
      assert(newClaimable.From == fromAddress, 'Invalid Claimable: From')
      assert(newClaimable.To == targetAddress, 'Invalid Claimable: To')
      assert(newClaimable.Quantity == "60", 'Invalid Claimable: Qty')
      assert(newClaimable.TxID == 'Message-Id-1', 'Invalid Claimable: TxID')
    end
  )
end

--------------------
------ CLAIM -------
--------------------
function InitClaimTests()
  local fromAddress = 'FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFRO'
  local targetAddress = 'TARGETTARGETTARGETTARGETTARGETTARGETTARGETT'
  StampTests:add(
    "CLAIM: No Quantity",
    function()
      local testClaimables = {}
      local testBalances = { }
      local claimResult = Claim(
        {
          From = fromAddress, 
          Tags = { ['Claim-Target'] = targetAddress }
        },
        
        testClaimables,
        testBalances
      )
      assert(claimResult == "Invalid quantity", "Validation should fail!")
    end
  )

  StampTests:add(
    "CLAIM: Non-numeric Quantity",
    function()
      local testClaimables = {}
      local testBalances = { }
      local claimResult = Claim(
        {
          From = fromAddress,
          Tags = { ['Claim-TxID'] = 'tx-123', ['Claim-Quantity'] = 'Ten' }
        },
        
        testClaimables,
        testBalances
      )
      assert(claimResult == "Invalid quantity", "Validation should fail!")
    end
  )

  StampTests:add(
    "CLAIM: No TxID",
    function()
      local testClaimables = {}
      local testBalances = { }
      local claimResult = Claim(
        {
          From = fromAddress,
          Tags = { ['Claim-Quantity'] = '10' }
        },
        
        testClaimables,
        testBalances
      )

      assert(claimResult == "Invalid txId", "Validation should fail!")
    end
  )

  StampTests:add(
    "CLAIM: Claimable table is empty",
    function()
      local testClaimables = { }
      local testBalances = { }
      local claimResult = Claim(
        {
          From = fromAddress,
          Tags = { ['Claim-TxID'] = 'tx-123', ['Claim-Quantity'] = '10' }
        },
        
        testClaimables,
        testBalances
      )

      assert(claimResult == "Claimable not found", "Validation should fail!")
    end
  )

  StampTests:add(
    "CLAIM: Claimable table has no match",
    function()
      local testClaimables = {
        {
          From = fromAddress,
          To = targetAddress,
          Quantity = "100",
          TxID = 'tx-456'
        }
      }
      local testBalances = { }
      local claimResult = Claim(
        {
          From = fromAddress,
          Tags = { ['Claim-TxID'] = 'tx-123', ['Claim-Quantity'] = '10' }
        },
        
        testClaimables,
        testBalances
      )

      assert(claimResult == "Claimable not found", "Validation should fail!")
    end
  )

  StampTests:add(
    "CLAIM: Claimable quantities do not match",
    function()
      local testClaimables = {
        {
          From = fromAddress,
          To = targetAddress,
          Quantity = 10,
          TxID = 'tx-123'
        }
      }
      local testBalances = { }
      local claimResult = Claim(
        {
          From = fromAddress,
          Tags = { ['Claim-TxID'] = 'tx-123', ['Claim-Quantity'] = '50' }
        },
        
        testClaimables,
        testBalances
      )

      assert(claimResult == "Claimable quantity is not equal to claimed quantity", "Validation should fail!")
    end
  )

  StampTests:add(
    "CLAIM: Claimable is not address to caller",
    function()
      local testClaimables = {
        {
          From = 'Jack',
          To = targetAddress,
          Quantity = "50",
          TxID = 'tx-123'
        }
      }
      local testBalances = { }
      local claimResult = Claim(
        {
          From = fromAddress,
          Tags = { ['Claim-TxID'] = 'tx-123', ['Claim-Quantity'] = '50' }
        },
        
        testClaimables,
        testBalances
      )

      assert(claimResult == "Claimable is not addressed to caller", "Validation should fail!")
    end
  )

  StampTests:add(
    "CLAIM: Successful claim",
    function()
      local testClaimables = {
        {
          From = targetAddress,
          To = fromAddress,
          Quantity = "50",
          TxID = 'tx-123'
        }
      }
      local testBalances = { }
      local claimResult = Claim(
        {
          From = fromAddress,
          Tags = { ['Claim-TxID'] = 'tx-123', ['Claim-Quantity'] = '50' }
        },
        
        testClaimables,
        testBalances
      )

      assert(testBalances[fromAddress] == "50", 'Caller balance should increase!')
      assert(TableLength(testClaimables) == 0, 'Claimables should be empty')
      assert(claimResult == "Claimed.", "Claim should be successful")
    end
  )

  StampTests:add(
    "CLAIM: Successful claim, multiple claimables",
    function()
      local testClaimables = {
        {
          From = targetAddress,
          To = fromAddress,
          Quantity = "50",
          TxID = 'tx-123'
        },
        {
          From = targetAddress,
          To = fromAddress,
          Quantity = "100",
          TxID = 'tx-456'
        }
      }
      local testBalances = { }
      local claimResult = Claim(
        {
          From = fromAddress,
          Tags = { ['Claim-TxID'] = 'tx-123', ['Claim-Quantity'] = '50' }
        },
        
        testClaimables,
        testBalances
      )

      assert(testBalances[fromAddress] == "50", 'Caller balance should increase!')
      assert(TableLength(testClaimables) == 1, 'Claimables should be empty')
      assert(testClaimables[1]['TxID'] == 'tx-456', 'tx-123 should be removed from claimables')
      assert(claimResult == "Claimed.", "Claim should be successful")
    end
  )

end

--------------------
----- CREDIT -------
--------------------
function InitCreditTests()
  StampTests:add(
    "CREDIT: Distribute credits",
    function()
      local testCredits = {
        [788400] = {
        {
            Asset = "TARGETTARGETTARGETTARGETTARGETTARGETTARGETT",
            Holder = "FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFR3",
            Quantity = 94
        },
        {
            Asset = "TARGETTARGETTARGETTARGETTARGETTARGETTARGETT",
            Holder = "FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFRO",
            Quantity = 94
        },
        {
            Asset = "TARGETTARGETTARGETTARGETTARGETTARGETTARGETT",
            Holder = "FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFR2",
            Quantity = 93
        }
        },
        [788500] = {
          {
            Asset = "TARGETTARGETTARGETTARGETTARGETTARGETTARGETT",
            Holder = "FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFR3",
            Quantity = 94
          },
          {
            Asset = "TARGETTARGETTARGETTARGETTARGETTARGETTARGETT",
            Holder = "FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFRO",
            Quantity = 94
          },
          {
            Asset = "TARGETTARGETTARGETTARGETTARGETTARGETTARGETT",
            Holder = "FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFR2",
            Quantity = 93
          }
        }
      }
      local testBalances = {}
      local BlockHeight = 788450
      Credit(BlockHeight, testCredits, testBalances)
    end
  )
end

--------------------
----- REWARD -------
--------------------
function InitRewardTests()
  local fromAddress = 'FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFRO'
  local fromAddress2 = 'FROMFROMFROMFROMFROMFROMFROMFROMFROMFROMFR2'
  local targetAddress = 'TARGETTARGETTARGETTARGETTARGETTARGETTARGETT'
  local assetAddress = 'ASSETASSETASSETASSETASSETASSETASSETASSET001'
  local assetAddress2 = 'ASSETASSETASSETASSETASSETASSETASSETASSET002'
  local assetAddress3 = 'ASSETASSETASSETASSETASSETASSETASSETASSET003'
  local lastReward = 788400
  StampTests:add(
    "REWARD: No stamps",
    function()
      local testBalances = {
        [fromAddress] = "1000",
        [targetAddress] = utils.toBalanceValue(315328 * 1e12),
      }
      local BlockHeight = 788450
      local testStamps = {}
      local testStampHistory = {}
      local testCycleAllocations = {}
      local rewardResult = Reward(BlockHeight, lastReward, testBalances, testStamps, testStampHistory, testCycleAllocations, HandlePreviousRewardCycle, HandleNextRewardCycle)

      assert(rewardResult == 'No Stamps', 'Should throw not enough reward error')
    end
  )
  StampTests:add(
    "REWARD: Not enough reward",
    function()
      local testBalances = {
        [fromAddress] = "1000",
        [targetAddress] = utils.toBalanceValue(315328 * 1e12),
      }
      local BlockHeight = 788450
      local testStamps = {
        [string.format('%s:%s', assetAddress, fromAddress)] = {
          Asset = assetAddress,
          Address = fromAddress
        },
        [string.format('%s:%s', assetAddress2, fromAddress)] = {
          Asset = assetAddress2,
          Address = fromAddress
        },
        [string.format('%s:%s', assetAddress, fromAddress2)] = {
          Asset = assetAddress,
          Address = fromAddress2
        }
      }
      local testStampHistory = {}
      local testCycleAllocations = {}
      local rewardResult = Reward(BlockHeight, lastReward, testBalances, testStamps, testStampHistory, testCycleAllocations, HandlePreviousRewardCycle, HandleNextRewardCycle)

      assert(rewardResult == 'Error: Not Enough Reward', 'Should throw not enough reward error')
    end
  )

  StampTests:add(
    "REWARD: Not time to reward",
    function()
      local testBalances = {
        [fromAddress] = "1000",
        [targetAddress] = utils.toBalanceValue(315328 * 1e12),
        [ProcessId] = utils.toBalanceValue(2 * 1e12)
      }
      local BlockHeight = 719
      local testStamps = {
        [string.format('%s:%s', assetAddress, fromAddress)] = {
          Asset = assetAddress,
          Address = fromAddress
        },
        [string.format('%s:%s', assetAddress2, fromAddress)] = {
          Asset = assetAddress2,
          Address = fromAddress
        },
        [string.format('%s:%s', assetAddress, fromAddress2)] = {
          Asset = assetAddress,
          Address = fromAddress2
        }
      }
      local testStampHistory = {}
      local testCycleAllocations = {}
      local rewardResult = Reward(BlockHeight, lastReward, testBalances, testStamps, testStampHistory, testCycleAllocations, HandlePreviousRewardCycle, HandleNextRewardCycle)

      assert(rewardResult == 'Error: Not Time to reward', 'Not time to reward yet')
    end
  )

  StampTests:add(
    "REWARD:  Successful reward",
    function()
      local testBalances = {
        [fromAddress] = "1000",
        [targetAddress] = "3000",
        [ProcessId] = utils.toBalanceValue(2 * 1e12)
      }
      local BlockHeight = 790450
      local testStamps = {
        [string.format('%s:%s', assetAddress, fromAddress)] = {
          Asset = assetAddress,
          Address = fromAddress
        },
        [string.format('%s:%s', assetAddress2, fromAddress)] = {
          Asset = assetAddress2,
          Address = fromAddress
        },
        [string.format('%s:%s', assetAddress, fromAddress2)] = {
          Asset = assetAddress,
          Address = fromAddress2
        },
        [string.format('%s:%s', assetAddress3, fromAddress)] = {
          Asset = assetAddress3,
          Address = fromAddress
        }
      }
      local testStampHistory = {}
      local rewardResult = Reward(BlockHeight, lastReward, testBalances, testStamps, testStampHistory)

      assert(rewardResult == 'Rewarded.', 'Should be successful reward')

      -- reward = 499371288304695
      -- Two unique stampers: 1/2 reward for each
      -- Asset 1 (stamped: from1, from2) receives 4/6 of the reward (1/3 of from1s reward + 1/1 of from2s reward) - 332914192203130
      -- Asset 2 (stamped: from1) receives 1/6 of the reward (1/3 of from1s reward) - 83228548050782
      -- Asset 3 (stamped: from1) receives 1/6 of the reward (1/3 of from1s reward) plus one remainder - 83228548050783

      assert(testBalances[assetAddress] == utils.toBalanceValue(332914192203130), 'Asset 1 should receive 4/6 of the reward')
      assert(testBalances[assetAddress2] == utils.toBalanceValue(83228548050782), 'Asset 2 should receive 1/6 of the reward')
      assert(testBalances[assetAddress3] == utils.toBalanceValue(83228548050783), 'Asset 3 should receive 1/6 of the reward plus one remainder')
      
      assert(testStampHistory[string.format('%s:%s', assetAddress, fromAddress)] == 1, 'Asset1:From1 should be in stamp history'  )
      assert(testStampHistory[string.format('%s:%s', assetAddress, fromAddress2)] == 1, 'Asset1:From2 should be in stamp history')
      assert(testStampHistory[string.format('%s:%s', assetAddress2, fromAddress)] == 1, 'Asset2:From1 should be in stamp history')
      assert(testStampHistory[string.format('%s:%s', assetAddress3, fromAddress)] == 1, 'Asset3:From1 should be in stamp history')
    end
  )

end

---------------------------------------------------
-------------------- INITIALIZE -------------------
---------------------------------------------------

local Initialized = false
function InitTests()
  -- TODO: Implement Register
  -- InitRegisterTests()
  InitStampTests()
  InitReadStampTests()
  InitSuperStampTests()
  InitBalanceTests()
  InitTransferTests()
  InitAllowTests()
  InitClaimTests()
  InitCreditTests()
  InitRewardTests()
end

if not Initialized then
  InitTests()
  Initialized = true
end

function RunTests()
  local results = StampTests:run()
  print(results)
end

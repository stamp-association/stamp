local types, _schema = graphql.types, graphql.schema


-- primary index = stampsByAsset
function findStampsByAsset(asset)
  if not StampsByAsset[asset] then
    return {}
  end
  return StampsByAsset[asset]
end
-- secondary index = stampsByAddress
function findStampsByAddress(address)
  if not StampsByAddress[address] then
    return {}
  end
  return StampsByAddress[address]
end

-- Schema
stamp = types.object({
  name = 'Stamp',
  fields = function ()
    return {
      Asset = types.string.nonNull,
      Address = types.string.nonNull,
      Vouched = types.string.nonNull
    }
  end
})

local schema = _schema.create({
  query = types.object({
    name = 'Query',
    fields = {
      stampsByAsset = {
        kind = types.list(stamp.nonNull).nonNull,
        arguments = {
          asset = {
            kind = types.string.nonNull,
          }
        },
        resolve = function (_, arguments, contextValue)
          local findStampsByAsset = contextValue.findStampsByAsset
          return findStampsByAsset(arguments.asset)
        end

      },
      -- TODO: figure out better naming
      stampsByAddress = {
        kind = types.list(stamp.nonNull).nonNull,
        arguments = {
          address = {
            kind = types.string.nonNull,
          }
        },
        resolve = function (_, arguments, contextValue)
          local findStampsByAddress = contextValue.findStampsByAddress
          return findStampsByAddress(arguments.address)
        end

      }
    }
  })
})

Server = server.new({
  schema = schema,
  context = function ()
    return {
      findStampsByAsset = findStampsByAsset,
      findStampsByAddress = findStampsByAddress
    }
  end
})
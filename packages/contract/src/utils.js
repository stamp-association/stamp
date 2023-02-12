import {
  filter, propEq, length, reduce, assoc, values,
  keys, add, mergeAll, map, pluck, prop, groupBy, toPairs,
  flatten, sum, compose, over, lensProp, lte
} from 'ramda'

export function rewardCredits(state, height) {
  Object.keys(state.credits).filter(k => k < height).forEach(k => {
    state.credits[k].forEach(c => {
      if (!state.balances[c.holder]) {
        state.balances[c.holder] = 0
      }
      state.balances[c.holder] = state.balances[c.holder] + c.qty
    })
  })

  return compose(
    over(lensProp('credits'), compose(
      reduce((a, v) => assoc(v, state.credits[v], a), {}),
      filter(lte(height)),
      keys
    ))
  )(state)
  /*
  

  state.credits = Object.keys(state.credits).filter(k => k >= height).reduce(
    (credits, height) => {
      credits[height] = state.credits[height]
      return credits
    }
    , {})
  return state
  */
}

export function mintRewards(stamps, reward) {
  const stampers = groupBy(prop('address'), stamps)
  const totalUniqueStampers = length(keys(stampers))
  var mintRemainder = reward % totalUniqueStampers
  const allocation = parseInt(reward / totalUniqueStampers)

  return flatten(map(([_, value]) => {
    var rewardsFromStamper = allocation
    if (mintRemainder > 0) {
      rewardsFromStamper++;
      mintRemainder--;
    }
    var stamperRemainder = rewardsFromStamper % value.length
    const stamperAllocation = parseInt(rewardsFromStamper / value.length)
    return map(asset => {
      var rewardsForAsset = stamperAllocation
      if (stamperRemainder > 0) {
        rewardsForAsset++
        stamperRemainder--
      }
      return { asset, rewardsForAsset }
    },
      pluck('asset', value)
    )
  },
    toPairs(stampers)
  )).reduce((a, { asset, rewardsForAsset }) => a[asset] ? assoc(asset, a[asset] + rewardsForAsset, a) : assoc(asset, rewardsForAsset, a), {})
}


export function pstAllocation(balances, reward) {
  var total = reduce(add, 0, values(balances).filter(v => v > 0))

  const allocation = mergeAll(reduce((a, s) => {
    const asset = s[0]
    const balance = s[1]

    // handle zero balance
    if (balance < 1) { return a }

    var pct = balance / total * 100
    const coins = Math.round(reward * (pct / 100))

    return [...a, { [asset]: Number(coins) }]
  }, [], Object.entries(balances)))

  // handle off by one errors :)
  var remainder = reward - sum(values(allocation))
  var iterator = keys(allocation).entries()
  while (remainder > 0) {
    allocation[iterator.next().value[1]]++
    remainder--
  }

  return allocation
}

export function divideQty(n) {
  if (n < 1) {
    return [0, 0]
  }
  return [Math.floor(n * 0.8), Math.floor(n * 0.2)]
}
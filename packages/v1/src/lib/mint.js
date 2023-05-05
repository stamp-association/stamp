import {
  length,
  assoc,
  keys,
  map,
  pluck,
  prop,
  groupBy,
  toPairs,
  flatten,
} from "ramda";

export function mint(stamps, reward) {
  const stampers = groupBy(prop("address"), stamps);
  const totalUniqueStampers = length(keys(stampers));
  var mintRemainder = reward % totalUniqueStampers;
  const allocation = parseInt(reward / totalUniqueStampers);

  return flatten(
    map(([_, value]) => {
      var rewardsFromStamper = allocation;
      if (mintRemainder > 0) {
        rewardsFromStamper++;
        mintRemainder--;
      }
      var stamperRemainder = rewardsFromStamper % value.length;
      const stamperAllocation = parseInt(rewardsFromStamper / value.length);
      return map((asset) => {
        var rewardsForAsset = stamperAllocation;
        if (stamperRemainder > 0) {
          rewardsForAsset++;
          stamperRemainder--;
        }
        return { asset, rewardsForAsset };
      }, pluck("asset", value));
    }, toPairs(stampers))
  ).reduce(
    (a, { asset, rewardsForAsset }) =>
      a[asset]
        ? assoc(asset, a[asset] + rewardsForAsset, a)
        : assoc(asset, rewardsForAsset, a),
    {}
  );
}

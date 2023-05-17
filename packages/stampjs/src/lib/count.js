export function count(env, tx) {
  const query = fromPromise(env.query)
  return of(tx)
    .map(tx => ({ query: buildQuery(), variables: { txs: [tx] } }))
    .chain()
}

function buildQuery() {
  return `query ($cursor: String, $txs: [String]) {
    transactions(tags:[
      {name: "Protocol-Name", values: ["Stamp"]},
      {name: "Data-Source", values: $txs}
    ]) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          tag {
            name
            value
          }
        }
      }
    }
  }`
}
<script>
  import { take, takeLast } from "ramda";
  import { format, fromUnixTime } from "date-fns";

  const _searchParams = new URLSearchParams(location.search);
  const tx = _searchParams.get("tx");
  const prop = (k) => (o) => o[k];
  const path = (ks) => (o) => ks.reduce((a, v) => a[v], o);
  // const arweave = window.Arweave.init(
  //   import.meta.env.DEV
  //     ? { host: "arweave.net", port: 443, protocol: "https" }
  //     : {}
  // );
  // TODO: remove dependency on arweave.net
  const arweave = window.Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  });
  const formatId = (id) => `${take(5, id)}...${takeLast(5, id)}`;

  function fetchCard() {
    return (
      arweave.api
        .post("graphql", {
          query: buildQuery(),
          variables: { tx },
        })
        .then(path(["data", "data", "transaction"]))
        .then((node) => ({
          id: node.id,
          owner: node.owner.address,
          height: node.block.height,
          ts: node.block.timestamp,
          tags: node.tags,
          avatar: "yCZMJWHprkdOHTtep2Y_uXzc_c9bmSpPvBzb8KyObWA",
          handle: "anon",
          bio: "a human that wants a better web",
        }))
        //.then((x) => (console.log("card", x), x))
        .then((card) =>
          arweave.api
            .post("graphql", {
              query: buildQuery(),
              variables: {
                tx: card.tags.find((t) => t.name === "Data-Source").value,
              },
            })
            .then(prop("data"))
            .then(path(["data", "transaction"]))
            .then((node) => ({
              ...card,
              asset: node.id,
              title: node.tags.find((t) => t.name === "Title").value,
            }))
            //.then((x) => (console.log("asset", x), x))
            .catch((e) => ({
              ...card,
              asset: "XXXXXXXXXXXXXXXXXXXXX",
              title: "No Title",
            }))
        )
        .then((card) =>
          arweave.api
            .post("graphql", {
              query: buildArProfileQuery(),
              variables: {
                owners: [card.owner],
              },
            })

            .then(prop("data"))
            //.then((x) => (console.log(x), x))
            .then(path(["data", "transactions", "edges"]))
            .then((edges) => edges[0].node)
            .then((n) => arweave.api.get(n.id))
            .then(prop("data"))
            .then(JSON.parse.bind(JSON))
            .then((profile) => ({
              ...card,
              handle: profile.handle,
              bio: profile.bio,
              avatar: profile.avatar,
            }))
            .catch((e) => card)
        )
    );
    //.then((x) => (console.log(x), x));
  }

  function buildQuery() {
    return `query($tx: ID!) {
transaction(id: $tx) {
  id
  owner { address } 
  tags {
    name
    value
  }
  block {
    height
    timestamp
  }
}}`;
  }

  function buildArProfileQuery() {
    return `query($owners: [String!]!) {
transactions(first: 1, owners: $owners, tags: {name: "Protocol-Name", values: ["Account-0.3"]}) {
  edges {
    node {
      id
    }
  }
}}`;
  }

</script>

<div class="flex items-center justify-center min-h-screen">
  {#await fetchCard()}
    <img
      class="grid items-center"
      src="https://arweave.net/IkMJRqi_0Xx_QhstK4WE3rsQqQxC07n84UagPgqGXfc"
      alt="loader"
    />
  {:then card}
    <a
      href="#"
      class="relative block overflow-hidden min-w-[400px] bg-black-400 rounded-lg border border-gray-100 p-4 sm:p-6 lg:p-8"
    >
      <span
        class="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"
      />

      <div class="sm:flex sm:justify-between sm:gap-4">
        <div>
          <h3 class="text-orange-400 text-lg font-bold font-mono sm:text-xl">
            {card.handle}
            <span class="mt-1 text-xs font-thin font-sans text-white-400">
              ({formatId(card.owner)})
            </span>
          </h3>

          <p class="max-w-[40ch] text-sm text-white-400">{card.bio}</p>
        </div>

        <div class="hidden sm:block sm:shrink-0">
          <img
            alt={card.handle}
            src="https://arweave.net/{card.avatar}"
            class="h-16 w-16 rounded-lg object-cover shadow-sm"
          />
        </div>
      </div>

      <div class="mt-4">
        <p class="max-w-[40ch] text-xl text-white-400">
          {card.title}
        </p>
        <p class="text-white-400 text-xs font-light">
          ({formatId(card.asset)})
        </p>
      </div>

      <dl class="mt-6 flex gap-4 sm:gap-6 font-sans">
        <div class="flex flex-col">
          <dt class="text-sm font-medium text-white-400">Stamped:</dt>
          <dd class="text-xs text-orange-400">
            {format(fromUnixTime(card.ts), "MMM dd, yyyy")}
          </dd>
        </div>

        <div class="flex flex-col">
          <dt class="text-sm font-medium text-white-400">Height:</dt>
          <dd class="text-xs text-orange-400">{card.height}</dd>
        </div>
      </dl>
    </a>
  {:catch}
    <div
      class="grid items-center min-h-screen text-3xl text-orange-400 font-mono"
    >
      Stamp Card Not Found!
    </div>
  {/await}
</div>

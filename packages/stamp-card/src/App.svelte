<script>
  const _searchParams = new URLSearchParams(location.search);
  const tx = _searchParams.get("tx");
  const prop = (k) => (o) => o[k];
  const path = (ks) => (o) => ks.reduce((a, v) => a[v], o);
  const arweave = window.Arweave.init(
    import.meta.env.DEV
      ? { host: "arweave.net", port: 443, protocol: "https" }
      : {}
  );

  function fetchCard() {
    return arweave.api
      .post("graphql", {
        query: buildQuery(),
        variables: { tx },
      })
      .then(path(["data", "data", "transaction"]))
      .then((card) =>
        arweave.api
          .post("graphql", {
            query: buildQuery(),
            variables: {
              tx: card.tags.find((t) => t.name === "Data-Source").value,
            },
          })
          .then(prop("data"))
          .then(path[("data", "transaction")])
          //.then((results) => results[0])

          // .then((t) => ({
          //   ...card,
          //   title: t.tags.find((_tag) => _tag.name === "Title").value,
          // }))
          .then((x) => (console.log(x), x))
      )
      .then((x) => (console.log(x), x));
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
            Rakis
            <span class="mt-1 text-xs font-thin font-sans text-white-400">
              (vh-NT...9G2JI)
            </span>
          </h3>

          <p class="max-w-[40ch] text-sm text-white-400">Permaweb Developer</p>
        </div>

        <div class="hidden sm:block sm:shrink-0">
          <img
            alt="Rakis"
            src="https://arweave.net:443/fYmFNZbRCbPhBWqmOJLNiJFoLFiFchIBSZNI6jRwWaI"
            class="h-16 w-16 rounded-lg object-cover shadow-sm"
          />
        </div>
      </div>

      <div class="mt-4">
        <p class="max-w-[40ch] text-xl text-white-400">
          Framework for Evolving Arweave
        </p>
        <p class="text-white-400 text-xs font-light">(qyAI9...9G2JI)</p>
      </div>

      <dl class="mt-6 flex gap-4 sm:gap-6 font-sans">
        <div class="flex flex-col">
          <dt class="text-sm font-medium text-white-400">Stamped:</dt>
          <dd class="text-xs text-orange-400">March 9, 2023</dd>
        </div>

        <div class="flex flex-col">
          <dt class="text-sm font-medium text-white-400">Height:</dt>
          <dd class="text-xs text-orange-400">1134137</dd>
        </div>
      </dl>
    </a>
  {/await}
</div>

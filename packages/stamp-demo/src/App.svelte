<script lang="ts">
  import { onMount } from "svelte";
  import Stamps from "@permaweb/stampjs";
  window.warp.LoggerFactory.INST.logLevel("fatal");

  const warp = window.warp.WarpFactory.forMainnet();

  const stamps = Stamps.init({ warp });
  let count = 0;

  onMount(async () => {
    stamps.count("oHB-hYNKHOSqWrxJjroXZatSEmmFYpdKpoGTXNqvSo8").then((c) => {
      count = c.total;
    });
    const result = stamps.filter(["prop", "stamps"]);
    console.log(result);
  });

  async function doStamp() {
    await arweaveWallet.connect(["SIGN_TRANSACTION"]);
    await stamps.stamp("oHB-hYNKHOSqWrxJjroXZatSEmmFYpdKpoGTXNqvSo8");
    count = (await stamps.count("oHB-hYNKHOSqWrxJjroXZatSEmmFYpdKpoGTXNqvSo8"))
      .total;
  }

</script>

<div>
  <label>Stamp</label>
  <div>{count}</div>
  <button on:click|preventDefault={doStamp}>Stamp</button>
</div>

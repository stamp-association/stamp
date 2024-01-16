<script lang="ts">
  import { onMount } from "svelte";
  import Stamps from "@permaweb/stampjs";
  import { WarpFactory, LoggerFactory } from "warp-contracts";
  import { InjectedArweaveSigner } from "warp-contracts-plugin-signature";

  LoggerFactory.INST.logLevel("debug");

  const warp = WarpFactory.forMainnet();
  const arweave = window.Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  });

  let stamps = null;

  let count = 0;

  const asset = "KJdgZt5ILzRFIIsWXpjECKcrUoLCu3DZSwvmTXtLV0I";

  onMount(async () => {
    await arweaveWallet.connect([
      "SIGN_TRANSACTION",
      "DISPATCH",
      "ACCESS_PUBLIC_KEY",
    ]);

    const signer = new InjectedArweaveSigner(globalThis.arweaveWallet);
    signer.getAddress = globalThis.arweaveWallet.getActiveAddress;
    await signer.setPublicKey();

    stamps = Stamps.init({
      warp,
      arweave,
      wallet: signer,
      dre: "https://dre-u.warp.cc/contract",
    });

    stamps.count(asset).then((c) => {
      count = c.total;
    });
    // const result = await stamps.filter([
    //   "compose",
    //   ["filter", ["propEq", "flagged", false]],
    //   ["values"],
    //   ["prop", "stamps"],
    // ]);
    //console.log(result);
  });

  async function doStamp() {
    await arweaveWallet.connect([
      "SIGN_TRANSACTION",
      "DISPATCH",
      "ACCESS_PUBLIC_KEY",
      "ACCESS_ADDRESS",
    ]);
    const result = await stamps.stamp(asset);

    count = (await stamps.count(asset)).total;
  }

</script>

<div>
  <label>Stamp</label>
  <div>{count}</div>
  <button on:click|preventDefault={doStamp}>Stamp</button>
</div>

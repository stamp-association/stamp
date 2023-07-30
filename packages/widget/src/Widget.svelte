<script>
  import Connect from "./dialogs/connect.svelte";
  import Modal from "./components/modal.svelte";
  import { onMount } from "svelte";
  import { getStampCount, hasStamped, stamp } from "./lib/passport.js";
  import StampButton from "./components/stamp-button.svelte";
  import { ArweaveWebWallet } from "arweave-wallet-connector";

  export let asset = null;

  let showConnect = false;
  let stampingDialog = false;
  let alreadyStampedDialog = false;
  let count = {
    total: 0,
    vouched: 0,
  };
  let origin = 100;

  onMount(async () => {
    if (!asset) {
      fetch(window.location.href)
        .then(
          (res) =>
            res.headers.get("x-arns-resolved-id") ||
            window.location.pathname.split("/")[1]
        )
        .then((a) => ((asset = a), a))
        .then(getStampCount)
        .then((result) => (count = result));
    } else {
      getStampCount(asset).then((result) => (count = result));
    }
  });

  function sleep(n) {
    return new Promise((resolve) => setTimeout(resolve, n));
  }

  async function doStamp() {
    if (window.arweaveWallet) {
      await window.arweaveWallet.connect([
        "ACCESS_ADDRESS",
        "SIGN_TRANSACTION",
        "SIGNATURE",
        "ACCESS_PUBLIC_KEY",
      ]);
    } else {
      const wallet = new ArweaveWebWallet({ name: "STAMPS" });
      wallet.setUrl("arweave.app");
      await wallet.connect();
    }
    const stamped = await hasStamped(asset);
    if (stamped) {
      alreadyStampedDialog = true;
      return;
    }
    stampingDialog = true;
    try {
      await stamp(asset);
      await sleep(500);
      stampingDialog = false;
      count = await getStampCount(asset);
    } catch (e) {
      stampingDialog = false;
      alert("ERROR: ", e.message);
    }
    // } else {
    //   showConnect = true;
    // }
  }
  async function connected() {
    showConnect = false;
    stampingDialog = true;
    try {
      await stamp(asset);
      count = await getStampCount(asset);
      stampingDialog = false;
    } catch (e) {
      stampingDialog = false;
    }
  }
</script>

<div class="flex justify-center">
  <StampButton on:click={doStamp} />
</div>

<div
  class="pr-8 pl-4 pt-2 pb-8 flex space-x-[4px] items-center justify-center w-full"
>
  <div class="tooltip" data-tip="Total Stamps">
    <div
      on:click={doStamp}
      class="btn btn-ghost btn-sm btn-circle flex items-center justify-center"
    >
      <svg
        fill="currentColor"
        class="h-4"
        viewBox="0 0 560 560"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xml:space="preserve"
        xmlns:serif="http://www.serif.com/"
        style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
      >
        <g transform="matrix(1,0,0,1,-73,11)">
          <g transform="matrix(1,0,0,1,40,0)">
            <path
              d="M163.36,514.56C163.36,522.369 166.462,529.857 171.985,535.38C177.505,540.9 184.993,544.001 192.801,544.001L422.001,544.001C429.81,544.001 437.298,540.9 442.817,535.38C448.34,529.857 451.442,522.368 451.442,514.56L451.442,512.001L163.442,512.001L163.36,514.56Z"
              style="fill-rule:nonzero;"
            />
          </g>
          <g transform="matrix(1,0,0,1,40,0)">
            <path
              d="M225.36,370.56C221.798,371.556 219.383,374.865 219.52,378.56L219.52,381.119L394.96,381.123L394.96,378.56C395.105,374.888 392.73,371.587 389.198,370.56C376.081,367.287 365.143,358.259 359.441,346.001C347.601,320.88 352.401,277.2 372.479,221.281C353.049,233.867 330.39,240.562 307.237,240.562C284.089,240.562 261.428,233.867 241.999,221.281C262.077,277.281 266.96,320.883 254.96,346.001C249.308,358.235 238.429,367.263 225.358,370.56L225.36,370.56Z"
              style="fill-rule:nonzero;"
            />
          </g>
          <g transform="matrix(1,0,0,1,40,0)">
            <path
              d="M307.2,224.64C334.782,224.64 361.235,213.683 380.739,194.179C400.243,174.675 411.2,148.222 411.2,120.64C411.2,93.058 400.243,66.605 380.739,47.101C361.235,27.597 334.782,16.64 307.2,16.64C279.618,16.64 253.165,27.597 233.661,47.101C214.157,66.605 203.2,93.058 203.2,120.64C203.2,148.222 214.157,174.675 233.661,194.179C253.165,213.683 279.618,224.64 307.2,224.64ZM307.2,56.64C324.177,56.64 340.454,63.382 352.454,75.386C364.458,87.386 371.2,103.667 371.2,120.64C371.2,137.613 364.458,153.89 352.454,165.894C340.454,177.898 324.177,184.64 307.2,184.64C290.227,184.64 273.95,177.898 261.946,165.894C249.942,153.89 243.2,137.613 243.2,120.64C243.028,103.554 249.696,87.113 261.72,74.972C273.74,62.827 290.115,55.999 307.2,55.999L307.2,56.64Z"
              style="fill-rule:nonzero;"
            />
          </g>
          <g transform="matrix(1,0,0,1,40,0)">
            <path
              d="M463.92,396.8L150.56,396.8C139.955,396.8 129.779,401.015 122.279,408.515C114.775,416.015 110.56,426.191 110.56,436.8L110.56,476.8C110.431,481.82 112.326,486.679 115.814,490.292C119.306,493.901 124.099,495.956 129.123,495.999L485.363,495.999C490.316,495.979 495.054,493.995 498.551,490.487C502.043,486.98 504.004,482.23 504.004,477.28L504.004,437.28C504.133,426.573 499.965,416.264 492.43,408.655C484.899,401.046 474.629,396.776 463.926,396.8L463.92,396.8Z"
              style="fill-rule:nonzero;"
            />
          </g>
        </g>
      </svg>
    </div>
  </div>
  <span class="text-sm mr-8">{count.total}</span>
  <div class="tooltip" data-tip="Vouched Stamps">
    <div
      class="btn btn-ghost btn-sm btn-circle flex items-center justify-center"
    >
      <div class="">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    </div>
  </div>
  <span class="text-sm mr-8">{count.vouched}</span>

  <!-- <div class="tooltip" data-tip="Super Stamps">
    <div
      class="btn btn-ghost btn-sm btn-circle flex items-center justify-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    </div>
  </div>
  <span class="text-sm">{count.super}</span> -->
  <!-- <div class="tooltip" data-tip="Origin Count">
    <div class="py-4 pl-2 pr-1">
      <div class="h-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
    </div>
  </div>
  <span class="text-sm">{origin}</span> -->
</div>

<Connect bind:open={showConnect} on:connected={connected} />
<Modal
  bind:open={stampingDialog}
  ok={false}
  cancel={false}
  bgColor="bg-[#f2f3f4]"
>
  <img
    class="w-full grid items-center"
    src="https://arweave.net/IkMJRqi_0Xx_QhstK4WE3rsQqQxC07n84UagPgqGXfc"
    alt="stamping"
  />
  <h3 class="text-lg text-center">Stamping Asset</h3>
</Modal>
<Modal
  bind:open={alreadyStampedDialog}
  on:cancel={() => (alreadyStampedDialog = false)}
  bgColor="bg-[#f2f3f4]"
>
  <h3 class="text-2xl font-bold">Already Stamped</h3>
  <p class="my-8 text-lg">Looks like you have already stamped this asset!</p>
</Modal>

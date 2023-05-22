<button class="btn-2 w-4/5" on:click>STAMP</button>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Martian+Mono:wght@300&display=swap");

  button.btn-2 {
    font-family: "Martian Mono", monospace;
    font-size: 12px;
    font-weight: 500;
    color: #222326;
    text-transform: uppercase;
    padding: 0.3em 0.7em;
    background: #f3f3f3;
    border: 2px solid #222326;
    border-radius: 0.75em;
    transform-style: preserve-3d;
    transition: transform 150ms cubic-bezier(0, 0, 0.58, 1),
      background 150ms cubic-bezier(0, 0, 0.58, 1);
  }
  button.btn-2::before {
    position: absolute;
    content: "";
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #bebebe;
    border-radius: inherit;
    box-shadow: 0 0 0 2px #222326, 0 0.625em 0 0 #3f3f3f;
    transform: translate3d(0, 0.75em, -1em);
    transition: transform 150ms cubic-bezier(0, 0, 0.58, 1),
      box-shadow 150ms cubic-bezier(0, 0, 0.58, 1);
  }
  button.btn-2:hover {
    background: #bebebe;
    transform: translate(0, 0.25em);
  }
  button.btn-2:hover::before {
    box-shadow: 0 0 0 2px #222326, 0 0.5em 0 0 #3f3f3f;
    transform: translate3d(0, 0.5em, -1em);
  }
  button.btn-2:active {
    background: #3f3f3f;
    transform: translate(0em, 0.75em);
  }
  button.btn-2:active::before {
    box-shadow: 0 0 0 2px #222326, 0 0 #3f3f3f;
    transform: translate3d(0, 0, -1em);
  }
</style>

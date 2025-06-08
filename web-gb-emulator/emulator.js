(async () => {
  const canvas = document.getElementById("screen");

  const wasmboy = await WasmBoy.init({
    canvas,
    rom: null
  });

  window.press = (code) => {
    const mapping = {
      ArrowUp: wasmboy.BUTTONS.UP,
      ArrowDown: wasmboy.BUTTONS.DOWN,
      ArrowLeft: wasmboy.BUTTONS.LEFT,
      ArrowRight: wasmboy.BUTTONS.RIGHT,
      KeyZ: wasmboy.BUTTONS.A,
      KeyX: wasmboy.BUTTONS.B,
      Enter: wasmboy.BUTTONS.START,
      ShiftRight: wasmboy.BUTTONS.SELECT,
    };
    const btn = mapping[code];
    if (!btn) return;
    wasmboy.setButtonPressed(btn);
    setTimeout(() => wasmboy.setButtonReleased(btn), 100);
  };

  window.addEventListener("keydown", e => window.press(e.code));

  // ROM by URL
  const urlParams = new URLSearchParams(window.location.search);
  const romURL = urlParams.get("rom");
  if (romURL) {
    try {
      const res = await fetch(romURL);
      const buffer = await res.arrayBuffer();
      await wasmboy.loadROM(new Uint8Array(buffer));
      wasmboy.start();
    } catch (e) {
      console.error("ROM load failed:", e);
    }
  }

  const loader = document.getElementById("rom-loader");
  loader?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    wasmboy.loadROM(new Uint8Array(buffer));
    wasmboy.start();
  });

})();

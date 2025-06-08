(async () => {
  const romLoader = document.getElementById("rom-loader");
  const canvas = document.getElementById("screen");

  // Initialize WasmBoy Worker
  const wasmboyWorker = await WasmBoy.initWorker({});

  // Attach canvas renderer plugin
  const plugin = await WasmBoy.Plugins.createCanvasRendererPlugin({
    canvas,
    frequency: 60
  });
  wasmboyWorker.attachPlugin(plugin);

  // Button mapping (keyboard/controller)
  window.addEventListener("keydown", e => wasmboyWorker.send({ type: "KEYDOWN", key: e.code }));
  window.addEventListener("keyup", e => wasmboyWorker.send({ type: "KEYUP", key: e.code }));

  // Load ROM either via URL parameter or file input
  const loadAndPlay = async (buffer) => {
    await wasmboyWorker.loadROMFile(buffer, { auto_start: true });
  };

  // Via URL: ?rom=https://.../game.gb
  const params = new URLSearchParams(window.location.search);
  if (params.get("rom")) {
    const resp = await fetch(params.get("rom"));
    const buf = await resp.arrayBuffer();
    await loadAndPlay(new File([buf], "url-rom.gb"));
  }

  // Or via file picker
  romLoader.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (file) {
      await loadAndPlay(file);
    }
  });
})();

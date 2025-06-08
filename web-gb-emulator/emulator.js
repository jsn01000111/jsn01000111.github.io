(async () => {
  const romLoader = document.getElementById("rom-loader");
  const canvas = document.getElementById("screen");

  // Initialize WasmBoy Worker
  const wasmboyWorker = await WasmBoy.initWorker({});
  console.log("WasmBoy Worker initialized");

  // Attach canvas renderer plugin
  const plugin = await WasmBoy.Plugins.createCanvasRendererPlugin({
    canvas,
    frequency: 60
  });
  wasmboyWorker.attachPlugin(plugin);
  console.log("Canvas renderer attached");

  // Button mapping for touch and click events
  const buttonMap = {
    "btn-up": "ArrowUp",
    "btn-left": "ArrowLeft",
    "btn-down": "ArrowDown",
    "btn-right": "ArrowRight",
    "btn-a": "KeyZ",
    "btn-b": "KeyX",
    "btn-start": "Enter",
    "btn-select": "ShiftRight"
  };

  // Handle button press and release
  Object.keys(buttonMap).forEach(id => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener("touchstart", () => wasmboyWorker.send({ type: "KEYDOWN", key: buttonMap[id] }), { passive: true });
      button.addEventListener("touchend", () => wasmboyWorker.send({ type: "KEYUP", key: buttonMap[id] }), { passive: true });
      button.addEventListener("mousedown", () => wasmboyWorker.send({ type: "KEYDOWN", key: buttonMap[id] }));
      button.addEventListener("mouseup", () => wasmboyWorker.send({ type: "KEYUP", key: buttonMap[id] }));
      button.addEventListener("mouseout", () => wasmboyWorker.send({ type: "KEYUP", key: buttonMap[id] })); // Handle mouse leaving button
    }
  });

  // Keyboard support
  window.addEventListener("keydown", e => {
    if (buttonMap[e.code]) {
      e.preventDefault();
      wasmboyWorker.send({ type: "KEYDOWN", key: e.code });
    }
  });
  window.addEventListener("keyup", e => {
    if (buttonMap[e.code]) {
      e.preventDefault();
      wasmboyWorker.send({ type: "KEYUP", key: e.code });
    }
  });

  // Load ROM via file picker
  const loadAndPlay = async (buffer) => {
    try {
      await wasmboyWorker.loadROMFile(buffer, { auto_start: true });
      console.log("ROM loaded and playing");
    } catch (error) {
      console.error("Error loading ROM:", error);
      alert("Failed to load ROM. Ensure it’s a valid .GB or .GBC file.");
    }
  };

  romLoader.addEventListener("change", async (

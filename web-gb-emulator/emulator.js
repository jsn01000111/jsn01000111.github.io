// Initialize WasmBoy
let wasmboyInstance = null;
const canvas = document.getElementById('screen');
const romLoader = document.getElementById('rom-loader');
const debugDiv = document.getElementById('debug');
let savedState = null;

function logDebug(message) {
  if (debugDiv) debugDiv.textContent = message;
  console.log(message);
}

// Input state tracking
const inputState = {
  ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
  KeyZ: false, KeyX: false, Enter: false, ShiftRight: false
};

const keyMap = {
  ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
  KeyZ: 'A', KeyX: 'B', Enter: 'START', ShiftRight: 'SELECT'
};

window.press = function(key) {
  if (inputState[key] !== undefined) {
    inputState[key] = true;
    updateInputs();
  }
};

window.release = function(key) {
  if (inputState[key] !== undefined) {
    inputState[key] = false;
    updateInputs();
  }
};

function updateInputs() {
  if (!wasmboyInstance) return;
  const gameboyInputs = {
    UP: inputState.ArrowUp, DOWN: inputState.ArrowDown,
    LEFT: inputState.ArrowLeft, RIGHT: inputState.ArrowRight,
    A: inputState.KeyZ, B: inputState.KeyX,
    START: inputState.Enter, SELECT: inputState.ShiftRight
  };
  wasmboyInstance.setJoypadState(gameboyInputs);
}

window.saveState = function() {
  if (!wasmboyInstance) {
    alert('No game is running!');
    return;
  }
  savedState = wasmboyInstance.saveState();
  alert('Game state saved!');
};

window.loadState = function() {
  if (!wasmboyInstance || !savedState) {
    alert('No saved state or game running!');
    return;
  }
  wasmboyInstance.loadState(savedState).then(() => {
    alert('Game state loaded!');
  }).catch((error) => {
    console.error('Error loading state:', error);
    alert('Failed to load state.');
  });
};

window.toggleFullscreen = function() {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen().catch((err) => {
      console.error('Fullscreen error:', err);
      alert('Fullscreen not supported.');
    });
  } else {
    document.exitFullscreen();
  }
};

document.addEventListener('keydown', (e) => {
  if (keyMap[e.code]) {
    e.preventDefault();
    press(e.code);
  }
});

document.addEventListener('keyup', (e) => {
  if (keyMap[e.code]) {
    e.preventDefault();
    release(e.code);
  }
});

romLoader.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) {
    logDebug('No file selected.');
    return;
  }
  logDebug('Loading ROM...');
  const reader = new FileReader();
  reader.onload = (e) => {
    const romData = new Uint8Array(e.target.result);
    WasmBoy.loadROM(romData).then(() => {
      wasmboyInstance = WasmBoy;
      WasmBoy.enableDefaultJoypadSound();
      WasmBoy.play(canvas);
      logDebug('ROM loaded and running!');
    }).catch((error) => {
      console.error('Error loading ROM:', error);
      logDebug('Failed to load ROM.');
      alert('Failed to load ROM. Ensure it’s a valid .GB or .GBC file.');
    });
  };
  reader.readAsArrayBuffer(file);
});

document.addEventListener('touchstart', (e) => {
  if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
    e.preventDefault();
  }
}, { passive: false });

// Check if WasmBoy is loaded
if (typeof WasmBoy === 'undefined') {
  logDebug('WasmBoy library failed to load. Check the URL or network.');
  console.error('WasmBoy not found. Using URL:', 'https://cdn.jsdelivr.net/npm/wasmboy@0.7.1/dist/wasmboy.wasm.umd.js');
}

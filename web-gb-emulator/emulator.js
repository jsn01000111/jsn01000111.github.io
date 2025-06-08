// Initialize WasmBoy
let wasmboyInstance = null;
const canvas = document.getElementById('screen');
const romLoader = document.getElementById('rom-loader');

// Input state tracking
const inputState = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  KeyZ: false, // A
  KeyX: false, // B
  Enter: false, // Start
  ShiftRight: false // Select
};

// Map keys to Game Boy inputs
const keyMap = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  KeyZ: 'A',
  KeyX: 'B',
  Enter: 'START',
  ShiftRight: 'SELECT'
};

// Handle button press
window.press = function(key) {
  inputState[key] = true;
  updateInputs();
};

// Handle button release
window.release = function(key) {
  inputState[key] = false;
  updateInputs();
};

// Update emulator inputs
function updateInputs() {
  if (!wasmboyInstance) return;
  const gamedeclarative gameboyInputs = {
    UP: inputState.ArrowUp,
    DOWN: inputState.ArrowDown,
    LEFT: inputState.ArrowLeft,
    RIGHT: inputState.ArrowRight,
    A: inputState.KeyZ,
    B: inputState.KeyX,
    START: inputState.Enter,
    SELECT: inputState.ShiftRight
  };
  wasmboyInstance.setJoypadState(gameboyInputs);
}

// Keyboard support
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

// Load and start ROM
romLoader.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const romData = new Uint8Array(e.target.result);
    WasmBoy.loadROM(romData).then(() => {
      wasmboyInstance = WasmBoy;
      WasmBoy.play(canvas);
      console.log('ROM loaded and running!');
    }).catch((error) => {
      console.error('Error loading ROM:', error);
      alert('Failed to load ROM. Ensure it’s a valid .GB or .GBC file.');
    });
  };
  reader.readAsArrayBuffer(file);
});

// Prevent default touch behaviors
document.addEventListener('touchstart', (e) => {
  if (e.target.tagName === 'BUTTON') {
    e.preventDefault();
  }
}, { passive: false });

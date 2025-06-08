// Initialize WasmBoy (will be set after WasmBoy.init())
let wasmboyInstance = null;
const canvas = document.getElementById('screen');
const romLoader = document.getElementById('rom-loader');
const gameboyContainer = document.getElementById('gameboy');
const introScreen = document.getElementById('intro-screen');
const continueButton = document.getElementById('continue-button');

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

// --- Mobile Detection and Intro Screen Logic ---
function isMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  // Check for common mobile user agents or touch support and screen size
  return /android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent) ||
         (navigator.maxTouchPoints > 0 && (window.innerWidth <= 768 || window.innerHeight <= 768));
}

function showEmulator() {
  introScreen.style.display = 'none';
  gameboyContainer.style.display = 'flex';
}

function showIntroScreen() {
  introScreen.style.display = 'flex';
  gameboyContainer.style.display = 'none';
}

// Initial check on page load and on resize
function handleDisplayMode() {
  if (isMobile()) {
    showEmulator();
  } else {
    showIntroScreen();
    continueButton.style.display = 'block'; // Always show continue on desktop
  }
}

// --- End Mobile Detection and Intro Screen Logic ---


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
  if (!wasmboyInstance) {
    console.warn('WasmBoy instance not ready for input updates.');
    return;
  }
  const gameboyInputs = {
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
  // Only process keyboard input if the emulator is visible
  if (gameboyContainer.style.display === 'flex' && keyMap[e.code]) {
    e.preventDefault();
    press(e.code);
  }
});

document.addEventListener('keyup', (e) => {
  // Only process keyboard input if the emulator is visible
  if (gameboyContainer.style.display === 'flex' && keyMap[e.code]) {
    e.preventDefault();
    release(e.code);
  }
});

// --- Main execution flow ---

// 1. Initial WasmBoy setup: Call init() once when the script loads
// This ensures WasmBoy is ready before a ROM is loaded.
// It also sets up the canvas for rendering.
WasmBoy.init({
    headless: false,
    canvas: canvas
}).then(instance => {
    wasmboyInstance = instance; // WasmBoy returns itself
    console.log('WasmBoy initialized successfully!');
    // Now that WasmBoy is ready, set up the ROM loader
    setupRomLoader();
}).catch(error => {
    console.error('Error initializing WasmBoy:', error);
    alert('Failed to initialize emulator. Please try again: ' + error.message);
});

// 2. Function to set up the ROM loader (called after WasmBoy is initialized)
function setupRomLoader() {
  romLoader.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Clear any previous ROM data or state
    if (wasmboyInstance) {
        wasmboyInstance.pause(); // Pause any currently running game
        // wasmboyInstance.reset(); // Consider resetting if you want a clean slate (might clear save data though)
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const romData = new Uint8Array(e.target.result);
      console.log('ROM Data read:', romData.length, 'bytes');

      if (!wasmboyInstance) {
        console.error('WasmBoy instance is null, cannot load ROM.');
        alert('Emulator not ready. Please refresh the page and try again.');
        return;
      }

      try {
        await wasmboyInstance.loadROM(romData);
        wasmboyInstance.play(); // Start emulation after loading
        console.log('ROM loaded and running!');
      } catch (error) {
        console.error('Error loading ROM:', error);
        alert('Failed to load ROM. Please ensure it’s a valid .GB or .GBC file. Error: ' + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// 3. Set up mobile/desktop display logic
document.addEventListener('DOMContentLoaded', () => {
    handleDisplayMode();
});
window.addEventListener('resize', handleDisplayMode);
continueButton.addEventListener('click', showEmulator);


// Prevent default touch behaviors on buttons
document.addEventListener('touchstart', (e) => {
  if (e.target.tagName === 'BUTTON') {
    e.preventDefault();
  }
}, { passive: false });

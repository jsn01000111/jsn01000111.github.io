// Initialize WasmBoy (will be set after WasmBoy.init() resolves)
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
//    This is crucial to ensure WasmBoy's WASM module is compiled and ready.
document.addEventListener('DOMContentLoaded', () => {
    // Check if WasmBoy global object is available
    if (typeof WasmBoy === 'undefined') {
        console.error("Error: WasmBoy library not loaded. Check the CDN link in your HTML.");
        alert("WasmBoy emulator library failed to load. Please check your internet connection or the CDN link.");
        return; // Stop execution if WasmBoy isn't found
    }

    WasmBoy.init({
        headless: false,
        canvas: canvas // Pass the canvas element
    }).then(instance => {
        // The `init` method returns the WasmBoy global object itself as the instance
        wasmboyInstance = instance;
        console.log('WasmBoy initialized successfully!');
        // Now that WasmBoy is ready, set up the ROM loader
        setupRomLoader();
    }).catch(error => {
        console.error('Error initializing WasmBoy:', error);
        alert('Failed to initialize emulator. Please try again. Error: ' + error.message);
    });

    // Set up mobile/desktop display logic
    handleDisplayMode();
});

window.addEventListener('resize', handleDisplayMode);
continueButton.addEventListener('click', showEmulator);


// 2. Function to set up the ROM loader (called after WasmBoy is initialized)
function setupRomLoader() {
  romLoader.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Pause any currently running game before loading a new one
    if (wasmboyInstance) {
        wasmboyInstance.pause();
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const romData = new Uint8Array(e.target.result);
      console.log('ROM Data read:', file.name, '(', romData.length, 'bytes)');

      if (!wasmboyInstance) {
        console.error('WasmBoy instance is null, cannot load ROM. Initialization failed or not complete.');
        alert('Emulator not ready to load ROM. Please refresh the page and try again.');
        return;
      }

      try {
        await wasmboyInstance.loadROM(romData);
        wasmboyInstance.play(); // Start emulation after loading
        console.log('ROM loaded and running!');
      } catch (error) {
        console.error('Error loading ROM:', error);
        alert('Failed to load ROM. Please ensure it’s a valid .GB or .GBC file. Details: ' + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// Prevent default touch behaviors on buttons
document.addEventListener('touchstart', (e) => {
  if (e.target.tagName === 'BUTTON') {
    e.preventDefault();
  }
}, { passive: false });

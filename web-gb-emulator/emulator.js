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

// Map keys to Game Boy inputs (for keyboard support)
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
function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Check for common mobile user agent strings
  if (/android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent)) {
    return true;
  }

  // Check for touch events capability
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return true;
  }

  // Fallback for smaller screens (can indicate mobile even if no touch)
  // This is a heuristic, adjust width/height thresholds as needed
  if (window.innerWidth <= 768 || window.innerHeight <= 768) {
      return true;
  }

  return false;
}


function showEmulator() {
  introScreen.style.display = 'none';
  gameboyContainer.style.display = 'flex';
}

function showIntroScreen() {
  introScreen.style.display = 'flex';
  gameboyContainer.style.display = 'none';
}

// Handles showing either the intro screen or the emulator based on device
function handleDisplayMode() {
  if (isMobileDevice()) {
    showEmulator();
    console.log('Mobile device detected, showing emulator.');
  } else {
    showIntroScreen();
    // Show 'Continue' button on desktop to allow overriding the mobile-only message
    continueButton.style.display = 'block';
    console.log('Desktop device detected, showing intro screen.');
  }
}
// --- End Mobile Detection and Intro Screen Logic ---


// --- Emulator Input Handling ---
// Handle button press
window.press = function(key) {
  if (inputState[key] === false) { // Only update if state changes
    inputState[key] = true;
    updateInputs();
  }
};

// Handle button release
window.release = function(key) {
  if (inputState[key] === true) { // Only update if state changes
    inputState[key] = false;
    updateInputs();
  }
};

// Update emulator inputs based on current inputState
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

// Keyboard support (only active when emulator is visible)
document.addEventListener('keydown', (e) => {
  if (gameboyContainer.style.display === 'flex' && keyMap[e.code]) {
    e.preventDefault(); // Prevent default browser actions (e.g., scrolling)
    press(e.code);
  }
});

document.addEventListener('keyup', (e) => {
  if (gameboyContainer.style.display === 'flex' && keyMap[e.code]) {
    e.preventDefault();
    release(e.code);
  }
});

// Prevent default touch behaviors (like scrolling or zooming) on interactive elements
document.addEventListener('touchstart', (e) => {
  // Prevent default scroll/zoom on canvas and buttons
  if (e.target === canvas || e.target.tagName === 'BUTTON') {
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('touchend', (e) => {
  // Prevent default scroll/zoom on canvas and buttons
  if (e.target === canvas || e.target.tagName === 'BUTTON') {
    e.preventDefault();
  }
}, { passive: false });


// --- Main Application Flow ---

// This ensures that all HTML elements and the WasmBoy script are loaded
// before we try to initialize or interact with them.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if WasmBoy global object is available from the CDN
    if (typeof WasmBoy === 'undefined') {
        console.error("Fatal Error: WasmBoy library not loaded. Check the CDN link in your HTML's <script> tag.");
        alert("Emulator library failed to load. Please check your internet connection and the console for details.");
        return; // Stop execution if WasmBoy isn't found
    }

    // 2. Initialize WasmBoy
    // This is crucial: WasmBoy.init() compiles the WASM module and prepares the emulator.
    WasmBoy.init({
        headless: false, // We have a canvas, so not headless
        canvas: canvas   // Pass the canvas element for rendering
    }).then(instance => {
        // The `init` method resolves with the WasmBoy global object itself.
        wasmboyInstance = instance;
        console.log('WasmBoy initialized successfully!');
        // 3. Set up the ROM loader only after WasmBoy is initialized
        setupRomLoader();
    }).catch(error => {
        console.error('Error initializing WasmBoy:', error);
        alert('Failed to initialize emulator. This might be due to an unsupported browser or an issue with the WasmBoy library. Error: ' + error.message);
    });

    // 4. Set up mobile/desktop display logic
    handleDisplayMode();
});

// Listen for window resize to adjust display mode (e.g., if user resizes desktop browser)
window.addEventListener('resize', handleDisplayMode);

// Event listener for the "Continue" button on the intro screen
continueButton.addEventListener('click', showEmulator);


// Function to set up the ROM loader event listener
function setupRomLoader() {
  romLoader.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Optional: Pause any currently running game before loading a new one
    if (wasmboyInstance && wasmboyInstance.play) { // Check if play method exists
        wasmboyInstance.pause();
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const romData = new Uint8Array(e.target.result);
      console.log('Attempting to load ROM:', file.name, '(', romData.length, 'bytes)');

      if (!wasmboyInstance) {
        console.error('WasmBoy instance is null, cannot load ROM. Initialization failed or not complete.');
        alert('Emulator not ready to load ROM. Please refresh the page and try again.');
        return;
      }

      try {
        await wasmboyInstance.loadROM(romData);
        wasmboyInstance.play(); // Start emulation after successful ROM load
        console.log('ROM loaded and running!');
      } catch (error) {
        console.error('Error loading ROM:', error);
        alert('Failed to load ROM. Please ensure it’s a valid .GB or .GBC file. Details: ' + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// Initialize WasmBoy
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
  return /android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent) ||
         (navigator.maxTouchPoints > 0 && /Mobi|Tablet|Safari/i.test(userAgent));
}

function showEmulator() {
  introScreen.style.display = 'none';
  gameboyContainer.style.display = 'flex'; // Or 'block' if you've set it to that in CSS
}

function showIntroScreen() {
  introScreen.style.display = 'flex';
  gameboyContainer.style.display = 'none';
}

// Initial check on page load
if (isMobile() || window.innerWidth <= 768) { // Consider typical mobile max width
  showEmulator();
} else {
  showIntroScreen();
  // Show a 'Continue' button on desktop only if they want to override
  continueButton.style.display = 'block';
  continueButton.addEventListener('click', showEmulator);
}

// Listen for window resize to adjust display (e.g., if user resizes desktop browser)
window.addEventListener('resize', () => {
  if (isMobile() || window.innerWidth <= 768) {
    showEmulator();
  } else {
    showIntroScreen();
  }
});
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
  if (!wasmboyInstance) return;
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

// Load and start ROM
romLoader.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const romData = new Uint8Array(e.target.result);
    try {
      // Ensure wasmboyInstance is initialized before loading ROM
      if (!wasmboyInstance) {
        console.warn('WasmBoy instance not yet initialized. Attempting to initialize now...');
        await WasmBoy.init({
            headless: false,
            canvas: canvas
        });
        wasmboyInstance = WasmBoy; // Assign the global WasmBoy object as the instance
      }

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

// Prevent default touch behaviors on buttons
document.addEventListener('touchstart', (e) => {
  if (e.target.tagName === 'BUTTON') {
    e.preventDefault();
  }
}, { passive: false });

// Initial WasmBoy setup: Call init() once when the script loads
// This ensures WasmBoy is ready even before a ROM is loaded,
// and correctly sets up the canvas for rendering.
// This is crucial for the emulator to be ready to accept a ROM.
WasmBoy.init({
    headless: false,
    canvas: canvas
}).then(instance => {
    wasmboyInstance = instance; // `instance` here is actually the WasmBoy global object
    console.log('WasmBoy initialized successfully!');
}).catch(error => {
    console.error('Error initializing WasmBoy:', error);
    alert('Failed to initialize emulator. Please try again.');
});

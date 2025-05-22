const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

// Game state variables
let score = 0;
let gameInterval; // Interval for spawning asteroids
let isGameOver = false;

// Game object configurations
const player = {
  x: 50,
  y: 0, // Will be set based on canvas height
  width: 30,
  height: 30,
  speed: 7, // Slightly faster for vertical movement
  color: 'lime',
  bullets: [],
  shootInterval: 200, // Milliseconds between shots
  lastShotTime: 0
};

const asteroids = [];
const bulletSpeed = 10;
let asteroidSpeed = 2; // Initial asteroid speed, will increase with difficulty
const asteroidSpawnInterval = 1000; // Milliseconds between asteroid spawns
let asteroidSpawnTimer; // To clear the interval

// Touch control variables
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 30; // Minimum distance for a swipe to register

// --- Helper Functions ---

// Adjust canvas and player position on window resize/orientation change
function adjustCanvasSize() {
    // Determine target canvas dimensions based on orientation
    let targetWidth, targetHeight;
    if (window.innerWidth > window.innerHeight) { // Landscape
        targetWidth = Math.min(window.innerWidth * 0.9, 900); // Max 900px wide
        targetHeight = Math.min(window.innerHeight * 0.9, 600); // Max 600px tall
    } else { // Portrait
        targetWidth = Math.min(window.innerWidth * 0.9, 600); // Max 600px wide
        targetHeight = Math.min(window.innerHeight * 0.9, 900); // Max 900px tall
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Reposition player to the vertical center on resize
    player.y = canvas.height / 2 - player.height / 2;
    // Ensure player is within bounds if canvas shrinks
    player.y = Math.max(0, Math.min(player.y, canvas.height - player.height));
}

function createAsteroid() {
  if (isGameOver) return;
  const size = Math.random() * 20 + 15; // Random size between 15 and 35
  const y = Math.random() * (canvas.height - size); // Random Y position
  asteroids.push({
    x: canvas.width + size, // Start off-screen to the right
    y,
    size,
    speed: asteroidSpeed + Math.random() * 1.5, // Slightly varied speed
    color: 'gray'
  });
}

function updatePlayer() {
  // Player vertical movement is handled by swipe (player.y will be directly updated)
  // Auto-shooting
  const currentTime = Date.now();
  if (currentTime - player.lastShotTime > player.shootInterval) {
    player.bullets.push({ x: player.x + player.width, y: player.y + player.height / 2 - 1 });
    player.lastShotTime = currentTime;
  }

  // Update bullets
  player.bullets.forEach(bullet => {
    bullet.x += bulletSpeed;
  });
  player.bullets = player.bullets.filter(bullet => bullet.x < canvas.width); // Remove off-screen bullets
}

function updateAsteroids() {
  asteroids.forEach(asteroid => {
    asteroid.x -= asteroid.speed; // Move asteroids left
  });
  asteroids = asteroids.filter(asteroid => asteroid.x > -asteroid.size); // Remove off-screen asteroids
}

function checkCollisions() {
  // Asteroid-Player collision
  asteroids.forEach(asteroid => {
    if (
      !isGameOver && // Only check if game is not already over
      player.x < asteroid.x + asteroid.size &&
      player.x + player.width > asteroid.x &&
      player.y < asteroid.y + asteroid.size &&
      player.y + player.height > asteroid.y
    ) {
      gameOver();
    }

    // Bullet-Asteroid collision
    player.bullets.forEach(bullet => {
      // Check if bullet and asteroid are active before collision
      if (bullet && asteroid) {
        if (
          bullet.x < asteroid.x + asteroid.size &&
          bullet.x + 5 > asteroid.x && // Bullet width is 5
          bullet.y < asteroid.y + asteroid.size &&
          bullet.y + 2 > asteroid.y // Bullet height is 2
        ) {
          // Mark for removal instead of direct splice within loop
          asteroid.hit = true;
          bullet.hit = true;
          score += 10;
          scoreDisplay.textContent = `Score: ${score}`;
        }
      }
    });
  });

  // Filter out hit asteroids and bullets after checking all collisions
  asteroids = asteroids.filter(asteroid => !asteroid.hit);
  player.bullets = player.bullets.filter(bullet => !bullet.hit);

  // Increase difficulty
  if (score > 0 && score % 100 === 0) { // Every 100 points
      asteroidSpeed += 0.1; // Slightly increase asteroid speed
  }
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw Bullets
  ctx.fillStyle = 'yellow';
  player.bullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, 5, 2);
  });
}

function drawAsteroids() {
  asteroids.forEach(asteroid => {
    ctx.fillStyle = asteroid.color;
    ctx.beginPath();
    ctx.arc(asteroid.x + asteroid.size / 2, asteroid.y + asteroid.size / 2, asteroid.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear entire canvas
  drawPlayer();
  drawAsteroids();
}

function gameLoop() {
  if (isGameOver) {
      // If game is over, we stop requesting new frames
      return;
  }
  updatePlayer();
  updateAsteroids();
  checkCollisions();
  draw();
  requestAnimationFrame(gameLoop); // Keep looping
}

function startGame() {
  score = 0;
  scoreDisplay.textContent = `Score: 0`;
  player.bullets = [];
  asteroids.length = 0; // Clear all asteroids
  asteroidSpeed = 2; // Reset asteroid speed
  isGameOver = false;

  // Set initial player position after canvas size is set
  player.y = canvas.height / 2 - player.height / 2;

  // Clear any existing intervals before starting a new one
  if (asteroidSpawnTimer) {
      clearInterval(asteroidSpawnTimer);
  }
  asteroidSpawnTimer = setInterval(createAsteroid, asteroidSpawnInterval);

  requestAnimationFrame(gameLoop); // Start the main game loop
}

function gameOver() {
  isGameOver = true;
  clearInterval(asteroidSpawnTimer); // Stop spawning new asteroids
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Dark overlay
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Game Over! Score: ${score}`, canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = '20px Arial';
  ctx.fillText('Tap to Restart', canvas.width / 2, canvas.height / 2 + 20);
}

// --- Event Listeners ---

// Initial canvas size adjustment and game start
window.addEventListener('load', () => {
    adjustCanvasSize();
    startGame();
});

// Adjust canvas size on window resize (desktop) or orientation change (mobile)
window.addEventListener('resize', adjustCanvasSize);
window.addEventListener('orientationchange', adjustCanvasSize);


// --- Touch Controls ---
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent scrolling/zooming
    if (isGameOver) {
        startGame(); // Restart on tap if game is over
        return;
    }
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: false }); // `passive: false` is important for `preventDefault`

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isGameOver) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;

    const dx = currentX - touchStartX;
    const dy = currentY - touchStartY;

    // Determine if it's a vertical or horizontal swipe
    if (Math.abs(dy) > Math.abs(dx)) { // Vertical swipe
        // Move player based on touch Y position relative to canvas
        player.y = currentY - canvas.getBoundingClientRect().top - player.height / 2;

        // Clamp player position to canvas bounds
        player.y = Math.max(0, Math.min(player.y, canvas.height - player.height));
    }
    // We are not handling left/right swipes for player movement as the game is auto-scrolling
    // You could use left/right swipes for other actions (e.g., special weapon) if desired.

    // Update start position for continuous movement
    touchStartX = currentX;
    touchStartY = currentY;

}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    if (isGameOver) {
        // If the game was just restarted, `touchstart` already handled it.
        // This `touchend` might fire shortly after, do nothing.
        return;
    }
    // Optional: Reset touch positions or state here if needed
});


// Optional: For testing on desktop with mouse (simulates touch)
canvas.addEventListener('mousedown', (e) => {
    if (isGameOver) {
        startGame();
        return;
    }
    touchStartX = e.clientX;
    touchStartY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (isGameOver || e.buttons === 0) return; // Only move if mouse button is down

    const currentX = e.clientX;
    const currentY = e.clientY;

    // Simulate vertical swipe for player movement
    player.y = currentY - canvas.getBoundingClientRect().top - player.height / 2;
    player.y = Math.max(0, Math.min(player.y, canvas.height - player.height));

    touchStartX = currentX;
    touchStartY = currentY;
});

canvas.addEventListener('mouseup', (e) => {
    if (isGameOver) {
        // If the game was just restarted, `mousedown` already handled it.
        return;
    }
    // Optional: Reset mouse positions or state here if needed
});

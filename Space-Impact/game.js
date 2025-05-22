const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize to full screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Player setup
let player = {
  x: 50,
  y: canvas.height / 2,
  width: 40,
  height: 20,
  speed: 6
};

let bullets = [];
let enemies = [];
let bgScroll = 0;

// Draw functions
function drawPlayer() {
  ctx.fillStyle = 'lime';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
  ctx.fillStyle = 'yellow';
  bullets.forEach((b, i) => {
    b.x += 10;
    ctx.fillRect(b.x, b.y, 6, 2);
    if (b.x > canvas.width) bullets.splice(i, 1);
  });
}

function drawEnemies() {
  ctx.fillStyle = 'red';
  enemies.forEach((e, i) => {
    e.x -= 4;
    ctx.fillRect(e.x, e.y, 30, 20);
    if (e.x + 30 < 0) enemies.splice(i, 1);
  });
}

function spawnEnemy() {
  let y = Math.random() * (canvas.height - 30);
  enemies.push({ x: canvas.width, y: y });
}

function drawBackground() {
  bgScroll -= 2;
  if (bgScroll <= -canvas.width) bgScroll = 0;
  ctx.fillStyle = "#000020";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Optionally add stars later
}

// Game loop
function updateGame() {
  drawBackground();
  drawPlayer();
  drawBullets();
  drawEnemies();
  requestAnimationFrame(updateGame);
}

// Touch input
let startY = 0;
let endY = 0;

canvas.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
});

canvas.addEventListener("touchend", (e) => {
  endY = e.changedTouches[0].clientY;
  let deltaY = startY - endY;

  if (Math.abs(deltaY) < 10) {
    // tap = shoot
    bullets.push({
      x: player.x + player.width,
      y: player.y + player.height / 2 - 1
    });
  } else if (deltaY > 20) {
    player.y -= player.speed * 3;
  } else if (deltaY < -20) {
    player.y += player.speed * 3;
  }
});

setInterval(spawnEnemy, 1200);
updateGame();

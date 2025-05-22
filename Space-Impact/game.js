const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = {
  x: 50,
  y: canvas.height / 2,
  width: 40,
  height: 20,
  speed: 5
};

let bullets = [];
let enemies = [];

function drawPlayer() {
  ctx.fillStyle = 'lime';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
  ctx.fillStyle = 'yellow';
  bullets.forEach((b, i) => {
    b.x += 10;
    ctx.fillRect(b.x, b.y, 5, 2);
    if (b.x > canvas.width) bullets.splice(i, 1);
  });
}

function drawEnemies() {
  ctx.fillStyle = 'red';
  enemies.forEach((e, i) => {
    e.x -= 3;
    ctx.fillRect(e.x, e.y, 30, 20);
    if (e.x + 30 < 0) enemies.splice(i, 1);
  });
}

function spawnEnemy() {
  let y = Math.random() * (canvas.height - 20);
  enemies.push({ x: canvas.width, y: y });
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBullets();
  drawEnemies();
  requestAnimationFrame(updateGame);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') player.y -= player.speed;
  if (e.key === 'ArrowDown') player.y += player.speed;
  if (e.key === ' ') {
    bullets.push({ x: player.x + player.width, y: player.y + player.height / 2 });
  }
});

setInterval(spawnEnemy, 1500);
updateGame();

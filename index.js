
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const bestText = document.getElementById("best");
const overlay = document.getElementById("overlay");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const jumpBtn = document.getElementById("jumpBtn");

const groundY = 295;

let player;
let obstacles;
let score = 0;
let best = Number(localStorage.getItem("stickmanBest")) || 0;
let speed;
let frame;
let running = false;
let gameOver = false;
let animationId;

bestText.textContent = best;

function createPlayer() {
  return {
    x: 100,
    y: groundY - 65,
    width: 35,
    height: 65,
    velocityY: 0,
    jumping: false,
    runFrame: 0
  };
}

function resetGame() {
  player = createPlayer();
  obstacles = [];
  score = 0;
  speed = 5;
  frame = 0;
  gameOver = false;

  scoreText.textContent = score;
  overlay.style.display = "none";
  running = true;

  cancelAnimationFrame(animationId);
  gameLoop();
}

function jump() {
  if (!running || gameOver) return;

  if (!player.jumping) {
    player.velocityY = -15;
    player.jumping = true;
  }
}

function drawBackground() {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, 350);
  sky.addColorStop(0, "#8ed8ff");
  sky.addColorStop(1, "#e8f9ff");

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Sun
  ctx.fillStyle = "#ffdb58";
  ctx.beginPath();
  ctx.arc(720, 65, 32, 0, Math.PI * 2);
  ctx.fill();

  // Clouds
  drawCloud(180, 65);
  drawCloud(440, 105);
  drawCloud(620, 150);

  // Ground
  ctx.fillStyle = "#59b85c";
  ctx.fillRect(0, groundY, canvas.width, 55);

  ctx.fillStyle = "#348c3c";
  ctx.fillRect(0, groundY, canvas.width, 8);

  // Ground lines
  ctx.strokeStyle = "#318b38";
  ctx.lineWidth = 2;

  for (let i = 0; i < canvas.width; i += 45) {
    ctx.beginPath();
    ctx.moveTo(i, groundY + 25);
    ctx.lineTo(i + 18, groundY + 25);
    ctx.stroke();
  }
}

function drawCloud(x, y) {
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(x, y, 19, 0, Math.PI * 2);
  ctx.arc(x + 22, y - 10, 24, 0, Math.PI * 2);
  ctx.arc(x + 47, y, 18, 0, Math.PI * 2);
  ctx.fill();
}

function drawStickman() {
  const x = player.x;
  const y = player.y;

  const airborne = player.jumping;
  const swing = airborne ? -0.4 : Math.sin(player.runFrame) * 0.65;

  ctx.strokeStyle = "#17202a";
  ctx.fillStyle = "#17202a";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";

  // Head
  ctx.beginPath();
  ctx.arc(x + 17, y + 10, 10, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.moveTo(x + 17, y + 21);
  ctx.lineTo(x + 17, y + 43);
  ctx.stroke();

  // Arms
  ctx.beginPath();
  ctx.moveTo(x + 17, y + 26);
  ctx.lineTo(x + 17 + Math.sin(swing) * 15, y + 36);
  ctx.moveTo(x + 17, y + 26);
  ctx.lineTo(x + 17 - Math.sin(swing) * 15, y + 36);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(x + 17, y + 43);
  ctx.lineTo(x + 17 + Math.sin(swing) * 14, y + 63);
  ctx.moveTo(x + 17, y + 43);
  ctx.lineTo(x + 17 - Math.sin(swing) * 14, y + 63);
  ctx.stroke();
}

function createObstacle() {
  const height = 30 + Math.random() * 30;

  obstacles.push({
    x: canvas.width,
    y: groundY - height,
    width: 25 + Math.random() * 15,
    height: height
  });
}

function drawObstacles() {
  obstacles.forEach(obstacle => {
    ctx.fillStyle = "#e63946";
    ctx.fillRect(
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );

    ctx.fillStyle = "#b51f2c";
    ctx.fillRect(
      obstacle.x + 5,
      obstacle.y + 5,
      5,
      obstacle.height - 5
    );
  });
}

function updatePlayer() {
  player.velocityY += 0.7;
  player.y += player.velocityY;

  if (player.y >= groundY - player.height) {
    player.y = groundY - player.height;
    player.velocityY = 0;
    player.jumping = false;
  }

  player.runFrame += 0.18;
}

function updateObstacles() {
  frame++;

  if (frame % 95 === 0) {
    createObstacle();
  }

  obstacles.forEach(obstacle => {
    obstacle.x -= speed;
  });

  obstacles = obstacles.filter(
    obstacle => obstacle.x + obstacle.width > 0
  );

  speed += 0.0015;
}

function checkCollision() {
  const px = player.x + 7;
  const py = player.y + 5;
  const pw = player.width - 12;
  const ph = player.height - 5;

  for (const obstacle of obstacles) {
    if (
      px < obstacle.x + obstacle.width &&
      px + pw > obstacle.x &&
      py < obstacle.y + obstacle.height &&
      py + ph > obstacle.y
    ) {
      endGame();
      return;
    }
  }
}

function updateScore() {
  score++;
  scoreText.textContent = Math.floor(score / 6);

  const currentScore = Math.floor(score / 6);

  if (currentScore > best) {
    best = currentScore;
    bestText.textContent = best;
    localStorage.setItem("stickmanBest", best);
  }
}

function endGame() {
  running = false;
  gameOver = true;

  message.textContent = "Game Over!";
  overlay.querySelector("p").textContent =
    "Your Score: " + Math.floor(score / 6);

  startBtn.textContent = "Play Again";
  overlay.style.display = "flex";
}

function gameLoop() {
  if (!running) return;

  drawBackground();
  updatePlayer();
  updateObstacles();
  drawObstacles();
  drawStickman();
  checkCollision();
  updateScore();

  if (running) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

startBtn.addEventListener("click", resetGame);

jumpBtn.addEventListener("click", jump);

canvas.addEventListener("pointerdown", jump);

document.addEventListener("keydown", event => {
  if (
    event.code === "Space" ||
    event.code === "ArrowUp"
  ) {
    event.preventDefault();

    if (!running && !gameOver) {
      resetGame();
    } else {
      jump();
    }
  }
});

// Initial screen
player = createPlayer();
drawBackground();
drawStickman();

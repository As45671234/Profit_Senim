// Получаем canvas и его контекст
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Устанавливаем размеры canvas
canvas.width = 400;
canvas.height = 600;

// Состояние игры
let gameState = 'menu'; // menu, playing, paused, gameOver
let score = 0;
let roadOffset = 0;
let gameSpeed = 2;
let frameCount = 0;

// Игровая машина
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 120,
    width: 50,
    height: 80,
    speed: 5,
    color: '#e74c3c'
};

// Массив препятствий
let obstacles = [];
let obstacleSpawnRate = 120; // Каждые 120 кадров

// Полосы дороги
const lanes = [
    canvas.width / 2 - 100,
    canvas.width / 2 - 50,
    canvas.width / 2,
    canvas.width / 2 + 50,
    canvas.width / 2 + 100
];

// Клавиши
const keys = {
    left: false,
    right: false
};

// Обработчики событий клавиатуры
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
});

// Создание препятствия
function createObstacle() {
    const laneIndex = Math.floor(Math.random() * lanes.length);
    obstacles.push({
        x: lanes[laneIndex] - 25,
        y: -80,
        width: 50,
        height: 80,
        speed: gameSpeed + 1,
        color: '#3498db'
    });
}

// Рисование дороги
function drawRoad() {
    // Трава (обочины)
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 0, 100, canvas.height);
    ctx.fillRect(canvas.width - 100, 0, 100, canvas.height);
    
    // Асфальт
    ctx.fillStyle = '#34495e';
    ctx.fillRect(100, 0, canvas.width - 200, canvas.height);
    
    // Разметка дороги
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 4;
    
    // Центральная линия (пунктир)
    for (let y = roadOffset % 40; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, y);
        ctx.lineTo(canvas.width / 2, y + 20);
        ctx.stroke();
    }
    
    // Боковые линии (белые)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(100, 0);
    ctx.lineTo(100, canvas.height);
    ctx.moveTo(canvas.width - 100, 0);
    ctx.lineTo(canvas.width - 100, canvas.height);
    ctx.stroke();
    
    // Обновление смещения дороги
    roadOffset += gameSpeed;
}

// Рисование игрока
function drawPlayer() {
    // Корпус машины
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Окна
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(player.x + 8, player.y + 10, 34, 25);
    ctx.fillRect(player.x + 8, player.y + 45, 34, 25);
    
    // Колеса
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(player.x - 5, player.y + 10, 10, 25);
    ctx.fillRect(player.x + player.width - 5, player.y + 10, 10, 25);
    ctx.fillRect(player.x - 5, player.y + 45, 10, 25);
    ctx.fillRect(player.x + player.width - 5, player.y + 45, 10, 25);
    
    // Фары
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(player.x, player.y, 5, 15);
    ctx.fillRect(player.x + player.width - 5, player.y, 5, 15);
}

// Рисование препятствий
function drawObstacles() {
    obstacles.forEach(obstacle => {
        // Корпус
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Окна
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(obstacle.x + 8, obstacle.y + 10, 34, 25);
        ctx.fillRect(obstacle.x + 8, obstacle.y + 45, 34, 25);
        
        // Колеса
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(obstacle.x - 5, obstacle.y + 10, 10, 25);
        ctx.fillRect(obstacle.x + obstacle.width - 5, obstacle.y + 10, 10, 25);
        ctx.fillRect(obstacle.x - 5, obstacle.y + 45, 10, 25);
        ctx.fillRect(obstacle.x + obstacle.width - 5, obstacle.y + 45, 10, 25);
    });
}

// Обновление препятствий
function updateObstacles() {
    // Движение препятствий вниз
    obstacles.forEach(obstacle => {
        obstacle.y += obstacle.speed;
    });
    
    // Удаление препятствий, вышедших за экран
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);
    
    // Создание новых препятствий
    if (frameCount % obstacleSpawnRate === 0) {
        createObstacle();
    }
}

// Проверка коллизий
function checkCollisions() {
    for (let obstacle of obstacles) {
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            return true;
        }
    }
    return false;
}

// Обновление игрока
function updatePlayer() {
    if (keys.left && player.x > 100) {
        player.x -= player.speed;
    }
    if (keys.right && player.x < canvas.width - player.width - 100) {
        player.x += player.speed;
    }
}

// Обновление игры
function update() {
    if (gameState !== 'playing') return;
    
    frameCount++;
    
    // Увеличение сложности со временем
    if (frameCount % 600 === 0) {
        gameSpeed += 0.5;
        obstacleSpawnRate = Math.max(60, obstacleSpawnRate - 10);
    }
    
    updatePlayer();
    updateObstacles();
    
    // Проверка коллизий
    if (checkCollisions()) {
        gameOver();
    }
    
    // Увеличение счета
    score = Math.floor(frameCount / 10);
    document.getElementById('score').textContent = score;
}

// Отрисовка игры
function draw() {
    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисование дороги
    drawRoad();
    
    // Рисование препятствий
    drawObstacles();
    
    // Рисование игрока
    drawPlayer();
}

// Игровой цикл
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Начало игры
function startGame() {
    gameState = 'playing';
    score = 0;
    frameCount = 0;
    gameSpeed = 2;
    obstacleSpawnRate = 120;
    obstacles = [];
    player.x = canvas.width / 2 - 25;
    roadOffset = 0;
    
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'inline-block';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('score').textContent = '0';
}

// Конец игры
function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('pauseBtn').style.display = 'none';
}

// Пауза
function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        document.getElementById('pauseBtn').textContent = 'Продолжить';
    } else if (gameState === 'paused') {
        gameState = 'playing';
        document.getElementById('pauseBtn').textContent = 'Пауза';
    }
}

// Обработчики кнопок
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Запуск игрового цикла
gameLoop();


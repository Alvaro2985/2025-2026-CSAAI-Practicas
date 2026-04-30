const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuración básica
canvas.width = 1000;
canvas.height = 500;

let gameState = 'MENU'; // MENU, COUNTDOWN, PLAYING, GOAL, GAMEOVER
let gameMode = ''; 
let score = { player: 0, bot: 0 };
let countdownValue = 3;

// Clases de objetos
class Entity {
    constructor(x, y, radius, color) {
        this.x = x; this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = 0; this.vy = 0;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }
}

class Player extends Entity {
    constructor(x, y, color, isBot = false) {
        super(x, y, 20, color);
        this.angle = 0; // Dirección de chut
        this.speed = 4;
        this.isBot = isBot;
    }

    update(ball) {
    if (!this.isBot) {

        if (keys['ArrowUp']) this.y -= this.speed;
        if (keys['ArrowDown']) this.y += this.speed;
        if (keys['ArrowLeft']) this.x -= this.speed;
        if (keys['ArrowRight']) this.x += this.speed;
        if (keys['a'] || keys['A']) this.angle -= 0.1;
        if (keys['d'] || keys['D']) this.angle += 0.1;
    } else {
        
        // 1. Objetivo: Un punto justo detrás del balón respecto a la portería del jugador
        let targetX = ball.x + 40; 
        let targetY = ball.y;

        // 2. Si el balón ya está detrás del bot, tiene que retroceder rápido para no metérsela propia
        if (ball.x > this.x) {
            targetX = ball.x + 80;
        }

        let dx = targetX - this.x;
        let dy = targetY - this.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        // 3. Movimiento hacia el objetivo
        if(dist > 5) {
            this.x += (dx/dist) * 2; 
            this.y += (dy/dist) * 2;
        }

        // 4. Lógica de Chut del Bot
        let distToBall = Math.sqrt(Math.pow(ball.x - this.x, 2) + Math.pow(ball.y - this.y, 2));
        if (distToBall < 40) {

            let angleToGoal = Math.atan2(250 - this.y, 0 - this.x);
            this.angle = angleToGoal;
            
            // Probabilidad de chut
            if (Math.random() < 0.03) { 
                ball.vx = Math.cos(this.angle) * 12;
                ball.vy = Math.sin(this.angle) * 12;
            }
        }
    }
    
    // Límites del campo
    this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
}

    draw() {
        super.draw();
        // Dibujar indicador de dirección
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(this.angle) * 30, this.y + Math.sin(this.angle) * 30);
        ctx.strokeStyle = "yellow";
        ctx.stroke();
    }
}

class Ball extends Entity {
    constructor() {
        super(canvas.width/2, canvas.height/2, 10, 'white');
        this.friction = 0.96;
    }

    update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Paredes superior e inferior
    if (this.y - this.radius < 10) {
        this.y = 10 + this.radius;
        this.vy *= -1;
    }
    if (this.y + this.radius > canvas.height - 10) {
        this.y = canvas.height - 10 - this.radius;
        this.vy *= -1;
    }

    // Paredes laterales y Porterías
    // Lado izquierdo (Portería del Jugador)
    if (this.x - this.radius < 10) {
        if (this.y > 175 && this.y < 325) {
            scoreGoal('bot');
        } else {
            this.x = 10 + this.radius;
            this.vx *= -1;
        }
    }
    // Lado derecho (Portería del Bot)
    if (this.x + this.radius > canvas.width - 10) {
        if (this.y > 175 && this.y < 325) {
            scoreGoal('player');
        } else {
            this.x = canvas.width - 10 - this.radius;
            this.vx *= -1;
        }
    }}
}

const player = new Player(150, 250, '#3498db');
const bot = new Player(650, 250, '#e74c3c', true);
const ball = new Ball();
const keys = {};

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// Disparo
window.addEventListener('keydown', e => {
    if(e.key === ' ' && gameState === 'PLAYING') {
        let dx = ball.x - player.x;
        let dy = ball.y - player.y;
        if(Math.sqrt(dx*dx + dy*dy) < 40) {
            ball.vx = Math.cos(player.angle) * 12;
            ball.vy = Math.sin(player.angle) * 12;
        }
    }
});

function startGame(mode) {
    gameMode = mode;
    score = { player: 0, bot: 0 };
    document.getElementById('overlay').classList.add('hidden');
    document.getElementById('game-info').innerText = mode === '3goals' ? "A 3 Goles" : "Gol de Oro";
    resetPositions();
}

function resetPositions() {
    gameState = 'COUNTDOWN';
    player.x = 150; player.y = 250;
    bot.x = 650; bot.y = 250;
    ball.x = canvas.width/2; ball.y = canvas.height/2;
    ball.vx = 0; ball.vy = 0;
    
    let cdDiv = document.getElementById('countdown');
    cdDiv.classList.remove('hidden');
    countdownValue = 3;
    cdDiv.innerText = countdownValue;

    let timer = setInterval(() => {
        countdownValue--;
        if(countdownValue <= 0) {
            clearInterval(timer);
            cdDiv.classList.add('hidden');
            gameState = 'PLAYING';
        } else {
            cdDiv.innerText = countdownValue;
        }
    }, 1000);
}

function scoreGoal(who) {
    if(gameState !== 'PLAYING') return;
    gameState = 'GOAL';
    score[who]++;
    document.getElementById('score').innerText = `${score.player} - ${score.bot}`;
    
    let msg = document.getElementById('message-box');
    document.getElementById('status-text').innerText = who === 'player' ? "¡GOOOL!" : "¡GOL RIVAL!";
    msg.classList.remove('hidden');
    document.getElementById('overlay').classList.remove('hidden');
    document.getElementById('menu').classList.add('hidden');

    setTimeout(() => {
        msg.classList.add('hidden');
        checkGameOver();
    }, 2000);
}

function checkGameOver() {
    let winner = null;
    if(gameMode === 'goldengal') winner = score.player > score.bot ? "Jugador" : "Bot";
    else if(score.player >= 3) winner = "Jugador";
    else if(score.bot >= 3) winner = "Bot";

    if(winner) {
        gameState = 'GAMEOVER';
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('winner-text').innerText = `¡Gana el ${winner}!`;
    } else {
        document.getElementById('overlay').classList.add('hidden');
        resetPositions();
    }
}

function resetToMenu() {
    location.reload();
}

function checkCollision(p, b) {
    let dx = b.x - p.x;
    let dy = b.y - p.y;
    let distance = Math.sqrt(dx*dx + dy*dy);
    if(distance < p.radius + b.radius) {
        b.vx = dx * 0.2;
        b.vy = dy * 0.2;
    }
}

function drawField() {
    // Césped y líneas
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 10);
    ctx.lineTo(canvas.width/2, canvas.height-10);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 50, 0, Math.PI*2);
    ctx.stroke();
    // Porterías
    ctx.fillStyle = "#eee";
    ctx.fillRect(0, 175, 10, 150); // Izq
    ctx.fillRect(canvas.width-10, 175, 10, 150); // Der
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawField();

    if(gameState === 'PLAYING' || gameState === 'GOAL') {
        player.update(ball);
        bot.update(ball);
        ball.update();
        
        checkCollision(player, ball);        // Jugador vs Balón
        checkCollision(bot, ball);           // Bot vs Balón
        checkPlayersCollision(player, bot);  // Jugador vs Bot
    }

    player.draw();
    bot.draw();
    ball.draw();

    requestAnimationFrame(loop);
}

loop();

function checkPlayersCollision(p1, p2) {
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let minDistance = p1.radius + p2.radius;

    if (distance < minDistance) {
        // Calculamos cuánto se están solapando
        let overlap = minDistance - distance;
        let nx = dx / distance; 
        let ny = dy / distance; 

        // Empujamos a cada uno la mitad del solapamiento en direcciones opuestas
        p1.x -= nx * (overlap / 2);
        p1.y -= ny * (overlap / 2);
        p2.x += nx * (overlap / 2);
        p2.y += ny * (overlap / 2);
    }
}
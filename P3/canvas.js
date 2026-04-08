
const canvas = document.getElementById("canvas");
const dpr = window.devicePixelRatio || 1;
let ctx;
let gameInitialized = false;

//-- Definir el contexto del canvas
const nave = document.getElementById("nave");
const alien = document.getElementById("alien");
const explosion = document.getElementById("explosion");
const explosion_sonido = document.getElementById("explosion_sonido");
const victory_sonido = document.getElementById("victory_sonido");
const gameOver_sonido = document.getElementById("gameOver_sonido");
const laser_sonido = document.getElementById("laser_sonido");

//-- Tamaño que tendrá la imagen dentro del canvas
const anchoImg = 50;
const altoImg = 50;

let x = 0; // Posición horizontal
let y = 0; // Posición vertical
let velx = 0;
const rapidez = 10;

// Aliens
let aliens = [];
let velx_alien = 2; // Velocidad horizontal de los aliens
let bajar = false;

// Lasers
let lasers = [];
const laserVel = 5; // Velocidad del láser hacia arriba

// Alien Lasers
let alienLasers = [];
const alienLaserVel = 3; // Velocidad del láser de aliens hacia abajo

// Sistema de energía del cargador
let maxEnergy = 100; // Energía máxima del cargador
let currentEnergy = 100; // Energía actual
const energyPerShot = 20; // Energía consumida por disparo
const rechargeRate = 0.25; // Energía que se recarga por frame (recarga progresiva)

// Vidas de la nave
let vidas = 3;

// Game Over
let gameOver = false;

// Victory
let victory = false;

// Explosiones
let explosiones = [];
const explosionDuration = 250; // Duración en milisegundos (1/4 segundo)

// Puntuación
let score = 0;

// Variables para tamaño lógico del canvas
let logicalWidth = 0;
let logicalHeight = 0;

// Función para inicializar el canvas
function initializeGame() {
    if (gameInitialized) return;
    
    // Ajustar tamaño del canvas
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    
    // Guardar tamaños lógicos
    logicalWidth = canvas.width / dpr;
    logicalHeight = canvas.height / dpr;
    
    // Inicializar posiciones de la nave
    x = (logicalWidth / 2) - (anchoImg / 2);
    y = logicalHeight - altoImg - 3;
    
    // Inicializar aliens: 3 filas, 8 columnas
    for(let fila = 0; fila < 3; fila++){
        for(let col = 0; col < 8; col++){
            aliens.push({
                x: col * (anchoImg+20),
                y: fila * (altoImg+20) + 80,
                ancho: anchoImg,
                alto: altoImg
            });
        }
    }
    
    gameInitialized = true;
}

// Esperar a que el documento esté cargado
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    
    // Temporizador para disparos de aliens
    setInterval(() => {
        if (aliens.length > 0 && !gameOver && !victory) {
            let randomIndex = Math.floor(Math.random() * aliens.length);
            let alien = aliens[randomIndex];
            alienLasers.push({x: alien.x + alien.ancho / 2 - 1, y: alien.y + alien.alto});
        }
    }, 750);
    
    update();
});

// Control de teclado
window.addEventListener('keydown', (e) => {
    if (e.key === "ArrowRight") velx = rapidez;
    if (e.key === "ArrowLeft") velx = -rapidez;
    if (e.key === " ") {
        // Disparar láser solo si hay energía suficiente
        if (currentEnergy >= energyPerShot && gameInitialized) {
            lasers.push({x: x + anchoImg / 2 - 1, y: y});
            currentEnergy -= energyPerShot; // Consumir energía
            laser_sonido.currentTime = 0; // Reiniciar si ya está sonando
            laser_sonido.play();
        }
    }
});
window.addEventListener('keyup', (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") velx = 0;
});

function update() {
    if(!gameOver && !victory){
        // Actualizar posición de la nave
        x = x + velx;

        // Bordes de la nave
        if (x < 0) x = 0;
        if (x > logicalWidth - anchoImg) x = logicalWidth - anchoImg;

        // Recarga automática progresiva del cargador de energía
        if (currentEnergy < maxEnergy) {
            currentEnergy = Math.min(currentEnergy + rechargeRate, maxEnergy);
        }

        // Mover aliens
        // Verificar si cambiar dirección
        if (velx_alien > 0 && aliens.some(a => a.x + a.ancho >= logicalWidth)) {
            velx_alien = -(velx_alien*1.25);
            bajar = true;
        } else if (velx_alien < 0 && aliens.some(a => a.x <= 0)) {
            velx_alien = -(velx_alien*1.25);
            bajar = true;
        }

        // Actualizar posiciones de aliens
        for(let a of aliens){
            a.x += velx_alien;
            if(bajar) a.y += 50;
        }
        bajar = false;

        // Verificar colisión entre aliens y nave
        for(let a of aliens){
            if(a.x < x + anchoImg && a.x + a.ancho > x && a.y < y + altoImg && a.y + a.alto > y){
                gameOver = true;
            }
        }

        // Mover lasers
        for(let i = lasers.length - 1; i >= 0; i--){
            lasers[i].y -= laserVel;
            if(lasers[i].y + 10 < 0){
                lasers.splice(i, 1);
            }
        }

        // Mover alien lasers
        for(let i = alienLasers.length - 1; i >= 0; i--){
            alienLasers[i].y += alienLaserVel;
            if(alienLasers[i].y > logicalHeight){
                alienLasers.splice(i, 1);
            }
        }

        // Verificar colisiones entre lasers y aliens
        for(let i = lasers.length - 1; i >= 0; i--){
            for(let j = aliens.length - 1; j >= 0; j--){
                let l = lasers[i];
                let a = aliens[j];
                if(l.x < a.x + a.ancho && l.x + 2 > a.x && l.y < a.y + a.alto && l.y + 10 > a.y){
                    // Crear explosión
                    explosiones.push({
                        x: a.x,
                        y: a.y,
                        startTime: Date.now()
                    });
                    // Reproducir sonido de explosión
                    explosion_sonido.currentTime = 0; // Reiniciar si ya está sonando
                    explosion_sonido.play();
                    lasers.splice(i, 1);
                    aliens.splice(j, 1);
                    score += 10; // Sumar 10 puntos por alien eliminado
                    break;
                }
            }
        }

        // Verificar si todos los aliens están destruidos
        if(aliens.length === 0){
            victory = true;
        }

        // Verificar colisiones entre alien lasers y nave
        for(let i = alienLasers.length - 1; i >= 0; i--){
            let l = alienLasers[i];
            if(l.x < x + anchoImg && l.x + 2 > x && l.y < y + altoImg && l.y + 10 > y){
                // Colisión: perder una vida
                vidas--;
                alienLasers.splice(i, 1);
                if(vidas <= 0){
                    gameOver = true;
                }
                break;
            }
        }

        // Actualizar explosiones (eliminar las que han expirado)
        for(let i = explosiones.length - 1; i >= 0; i--){
            if(Date.now() - explosiones[i].startTime > explosionDuration){
                explosiones.splice(i, 1);
            }
        }
    }

    if (!ctx) return; // Salir si el canvas aún no se ha inicializado
    
    // Borrar lienzo
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    // Dibujar aliens
    for(let a of aliens){
        ctx.drawImage(alien, a.x, a.y, a.ancho, a.alto);
    }

    // Dibujar explosiones
    for(let exp of explosiones){
        ctx.drawImage(explosion, exp.x, exp.y, anchoImg, altoImg);
    }

    // Dibujar nave lasers
    ctx.fillStyle = "red";
    for(let l of lasers){
        ctx.fillRect(l.x, l.y, 3, 6);
    }

    // Dibujar alien lasers
    ctx.fillStyle = "green";
    for(let l of alienLasers){
        ctx.fillRect(l.x, l.y, 3, 6);
    }

    //-- 2) DIBUJAR LA IMAGEN de la nave
    ctx.drawImage(nave, x, y, anchoImg, altoImg);

    // Dibujar puntuación y vidas
    ctx.fillStyle = "white";
    ctx.font = "bold 25px Arial";
    ctx.fillText("Puntuación: " + score + " Vidas: " + vidas, 10, 30);

    // Dibujar barra de energía del cargador
    const energyBarWidth = 200;
    const energyBarHeight = 20;
    const energyBarX = logicalWidth - energyBarWidth - 10;
    const energyBarY = 10;
    
    // Fondo de la barra (gris oscuro)
    ctx.fillStyle = "rgba(50, 50, 50, 0.8)";
    ctx.fillRect(energyBarX, energyBarY, energyBarWidth, energyBarHeight);
    
    // Barra de energía (color dinámico: verde -> amarillo -> rojo)
    const energyPercent = currentEnergy / maxEnergy;
    if (energyPercent > 0.5) {
        ctx.fillStyle = "rgb(0, 255, 0)"; // Verde cuando > 50%
    } else if (energyPercent > 0.25) {
        ctx.fillStyle = "rgb(255, 255, 0)"; // Amarillo cuando > 25%
    } else {
        ctx.fillStyle = "rgb(255, 0, 0)"; // Rojo cuando <= 25%
    }
    ctx.fillRect(energyBarX, energyBarY, energyBarWidth * energyPercent, energyBarHeight);
    
    // Borde de la barra
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(energyBarX, energyBarY, energyBarWidth, energyBarHeight);
    
    // Texto de energía
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.fillText("Energía: " + Math.floor(currentEnergy) + "/" + maxEnergy, energyBarX, energyBarY + 35);

    // Dibujar GAME OVER si es game over
    if(gameOver){
        gameOver_sonido.play();
        ctx.fillStyle = "red";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", logicalWidth / 2, logicalHeight / 2);
        ctx.textAlign = "left"; // Reset
    } else if(victory){
        victory_sonido.play();
        ctx.fillStyle = "green";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("VICTORY!", logicalWidth / 2, logicalHeight / 2);
        ctx.textAlign = "left"; // Reset
    }

    requestAnimationFrame(update);
}


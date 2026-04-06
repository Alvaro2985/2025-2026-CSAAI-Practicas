
const canvas = document.getElementById("canvas");

//-- Definir el contexto del canvas
const ctx = canvas.getContext("2d");
const nave = document.getElementById("nave");
const alien = document.getElementById("alien");

//-- Tamaño que tendrá la imagen dentro del canvas
const anchoImg = 10;
const altoImg = 10;

let x = (canvas.width / 2) - (anchoImg / 2)  ; // Posición horizontal (ajustada para que se vea centrada)
let y = canvas.height - altoImg - 3; // Posición vertical (ajustada para que se vea abajo)
let velx = 0;
const rapidez = 3;

// Aliens
let aliens = [];
let velx_alien = 0.25;
let bajar = false;

// Inicializar aliens: 3 filas, 8 columnas
for(let fila = 0; fila < 3; fila++){
    for(let col = 0; col < 8; col++){
        aliens.push({
            x: col * 15 + 10,
            y: fila * 20 + 10,
            ancho: anchoImg,
            alto: altoImg
        });
    }
}

// Control de teclado
window.addEventListener('keydown', (e) => {
    if (e.key === "ArrowRight") velx = rapidez;
    if (e.key === "ArrowLeft") velx = -rapidez;
});
window.addEventListener('keyup', (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") velx = 0;
});

function update() {
    // Actualizar posición de la nave
    x = x + velx;

    // Bordes de la nave
    if (x < 0) x = 0;
    if (x > canvas.width - anchoImg) x = canvas.width - anchoImg;

    // Mover aliens
    // Verificar si cambiar dirección
    if (velx_alien > 0 && aliens.some(a => a.x + a.ancho >= canvas.width)) {
        velx_alien = -(velx_alien+0.15);
        bajar = true;
    } else if (velx_alien < 0 && aliens.some(a => a.x <= 0)) {
        velx_alien = -(velx_alien-0.15);
        bajar = true;
    }

    // Actualizar posiciones de aliens
    for(let a of aliens){
        a.x += velx_alien;
        if(bajar) a.y += 10;
    }
    bajar = false;

    // Borrar lienzo
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar aliens
    for(let a of aliens){
        ctx.drawImage(alien, a.x, a.y, a.ancho, a.alto);
    }

    //-- 2) DIBUJAR LA IMAGEN de la nave
    ctx.drawImage(nave, x, y, anchoImg, altoImg);

    requestAnimationFrame(update);
}

// // Asegurarse de que la imagen esté cargada antes de empezar
// nave.onload = () => {
//     ctx.drawImage(nave, x, y, anchoImg, altoImg);
//     update();
// };
update();


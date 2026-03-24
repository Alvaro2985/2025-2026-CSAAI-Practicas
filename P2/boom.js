
//======= ARRAY PARA DÍGITOS ALEATORIOS DE 0-9 =======
let digitosAleatorios = Array.from({length: 4}, () => Math.floor(Math.random() * 10));

let intentos = 7; // Variable para contar los intentos
//======= FUNCIÓN PARA INICIALIZAR EL CRONÓMETRO =======
let crono; // Variable global para el cronómetro

// Obtener las cuadrículas
const grids = [
  document.getElementById("grid-1"),
  document.getElementById("grid-2"),
  document.getElementById("grid-3"),
  document.getElementById("grid-4")
];

// Obtener los botones de dígitos
let botones = document.getElementsByClassName("digito");

class Crono {

    //-- Constructor. Hay que indicar el 
    //-- display donde mostrar el cronómetro
    constructor(display) {
        this.display = display;

        //-- Tiempo
        this.cent = 0, //-- Centésimas
        this.seg = 0,  //-- Segundos
        this.min = 0,  //-- Minutos
        this.timer = 0;  //-- Temporizador asociado
    }

    //-- Método que se ejecuta cada centésima
    tic() {
        //-- Incrementar en una centesima
        this.cent += 1;

        //-- 100 centésimas hacen 1 segundo
        if (this.cent == 100) {
        this.seg += 1;
        this.cent = 0;
        }

        //-- 60 segundos hacen un minuto
        if (this.seg == 60) {
        this.min = 1;
        this.seg = 0;
        }

        //-- Mostrar el valor actual
        this.display.innerHTML = this.min + ":" + this.seg + ":" + this.cent;
    }

    //-- Arrancar el cronómetro
    start() {
       if (!this.timer) {
          //-- Lanzar el temporizador para que llame 
          //-- al método tic cada 10ms (una centésima)
          this.timer = setInterval( () => {
              this.tic();
          }, 10);
        }
    }

    //-- Parar el cronómetro
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    //-- Reset del cronómetro
    reset() {
        this.cent = 0;
        this.seg = 0;
        this.min = 0;

        this.display.innerHTML = "0:0:0";
    }
}

function initCrono() {
    //-- Elementos de la gui del cronómetro
    const gui = {
        display : document.getElementById("display"),
        start : document.getElementById("start"),
        stop : document.getElementById("stop"),
        reset : document.getElementById("reset"),
    };

    //-- Definir un objeto cronómetro
    crono = new Crono(gui.display);

    //---- Configurar las funciones de retrollamada

    //-- Arranque del cronometro
    gui.start.onclick = () => {
        console.log("Start!!");
        crono.start();
    };
    
      
    //-- Detener el cronómetro
    gui.stop.onclick = () => {
        console.log("Stop!");
        crono.stop();
    };

    //-- Reset del cronómetro
    gui.reset.onclick = () => {
        console.log("Reset!");
        crono.reset();
        intentos = 7;
        document.getElementById("intentos").textContent = `Intentos restantes: ${intentos}`;
        document.getElementById("info").textContent = "Nueva partida preparada. Pulsa Start o un número para comenzar";
          
        // Reiniciar las cuadrículas
        grids.forEach(grid => {
          grid.textContent = "*";
          grid.classList.remove("revealed");
          grid.style.color = ""; // Limpia el verde/rojo
          grid.style.borderColor = ""; 
        });
        document.getElementById("info").style.color = "";

          // Habilitar los botones de dígitos y restablecer su estilo
        for (let boton of botones) {
            boton.className = "digito";
            boton.disabled = false;
        }
        
        digitosAleatorios = Array.from({length: 4}, () => Math.floor(Math.random() * 10));

    
    };
}

//-- Inicializar el cronómetro
initCrono();

function checkGameOver() {
      if (intentos == 0) {
        crono.stop();
        document.getElementById("info").textContent = "BOOM!!.¡Juego terminado! Has agotado tus intentos. El número era: " + digitosAleatorios.join("");
        document.getElementById("info").style.color = "red"; // Mensaje de derrota en rojo

        
        grids.forEach(grid => {
          grid.style.color = "red";
          grid.style.borderColor = "red";
        });
        
        // Deshabilitar los botones de dígitos
        for (let boton of botones) {
          boton.disabled = true;
        }
      }
    }

function checkWin() {
    let allRevealed = grids.every(grid => grid.classList.contains("revealed"));
    if (allRevealed) {
        crono.stop();
        document.getElementById("info").textContent = `¡Felicidades! Has adivinado el número. Intentos restantes: ${intentos} .Intentos consumidos: ${7 - intentos}`;
        document.getElementById("info").style.color = "green"; // Mensaje de victoria en verde
        // Deshabilitar los botones de dígitos
        for (let boton of botones) {
          boton.disabled = true;
        }
        return true;
    }
}
//BOTONES NUMERICOS
function initBotones() {

  //-- Función de retrollamada de los botones
  //-- botones de la clase dígito
  function digito(value)
  {
    // Iniciar el cronómetro si se pulsa un botón digito
    crono.start();
    
    // Verificar si el valor pulsado coincide con algún dígito del número aleatorio
    const numeroPulsado = parseInt(value);
    digitosAleatorios.forEach((digito, index) => {
      if (digito == numeroPulsado && grids[index].textContent === "*") {
        grids[index].textContent = digito;
        grids[index].classList.add("revealed");
        grids[index].style.color = "green"; // Número acertado en verde
        grids[index].style.borderColor = "green";
        document.getElementById("info").textContent = `Has acertado el número ${value}`;
      }
    });

    // Decrementar el número de intentos restantes
    intentos = intentos - 1;
    document.getElementById("intentos").textContent = `Intentos restantes: ${intentos}`;
    
    // Verificar si el jugador ha ganado
    checkWin();
    if (checkWin()) {
      return; // Si el jugador ha ganado, no es necesario seguir verificando el juego.
    }
  
    // Verificar si el jugador ha perdido
    checkGameOver();
  }

  for (let boton of botones) {

    //-- Establecer la función de llamada del botón i
    //-- El parámetro ev.target contiene el boton
    //-- que ha recibido el clic
    boton.onclick = (ev) => {
      digito(ev.target.value);
      boton.classList.add("digito_pulsado"); 
      boton.disabled = true; // Deshabilitar el botón después de pulsarlo

    };
  }
}

//-- Inicializar los botones
initBotones();


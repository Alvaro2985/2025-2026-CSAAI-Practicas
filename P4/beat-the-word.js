// Beat the Word Game

const wordPairs = {
    "cama-casa": {
        words: ["Cama", "Casa"],
        images: ["🛏️", "🏠"]
    },
    "luna-cuna": {
        words: ["Luna", "Cuna"],
        images: ["🌙", "🛏️"]
    },
    "pato-gato": {
        words: ["Pato", "Gato"],
        images: ["🦆", "🐱"]
    },
    "queso-beso": {
        words: ["Queso", "Beso"],
        images: ["🧀", "💋"]
    }
};

const levels = [
    [0,0,0,0,1,1,1,1], // Level 1
    [0,1,0,1,0,1,0,1], // Level 2
    [1,0,1,0,1,0,1,0], // Level 3
    [0,0,1,1,0,0,1,1], // Level 4
    [1,1,0,0,1,1,0,0]  // Level 5
];

const speeds = [1000, 800, 600, 500, 400]; // ms per step

let currentPair = wordPairs["cama-casa"];
let startLevel = 1;
let currentLevel = 0;
let gameRunning = false;
let timer = 0;
let timeInterval;
let sequenceInterval;
let prepTimeout;
let musicEnabled = true;

const cells = document.querySelectorAll('.cell');
const wordDisplay = document.getElementById('wordDisplay');
const levelDisplay = document.getElementById('level');
const timeDisplay = document.getElementById('time');
const statusDisplay = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const musicBtn = document.getElementById('musicBtn');
const wordPairSelect = document.getElementById('wordPair');
const startLevelSelect = document.getElementById('startLevel');
const bgMusic = document.getElementById('bgMusic');

wordPairSelect.addEventListener('change', () => {
    currentPair = wordPairs[wordPairSelect.value];
    updateGrid();
});

startLevelSelect.addEventListener('change', () => {
    startLevel = parseInt(startLevelSelect.value);
});

startBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', stopGame);
musicBtn.addEventListener('click', toggleMusic);

function updateGrid() {
    const arrangement = levels[currentLevel - 1] || [0,0,0,0,0,0,0,0];
    cells.forEach((cell, index) => {
        cell.textContent = currentPair.images[arrangement[index]];
    });
}

function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    currentLevel = startLevel - 1;
    timer = 0;
    updateDisplays();
    disableControls();
    startTimer();
    playMusic();
    nextLevel();
}

function stopGame() {
    if (!gameRunning) return;
    gameRunning = false;
    clearIntervals();
    stopMusic();
    resetHighlights();
    wordDisplay.textContent = '';
    statusDisplay.textContent = 'Detenido';
    enableControls();
}

function nextLevel() {
    currentLevel++;
    if (currentLevel > 5) {
        endGame();
        return;
    }
    levelDisplay.textContent = currentLevel;
    statusDisplay.textContent = 'Preparando';
    wordDisplay.textContent = `Preparándose nivel ${currentLevel}`;
    updateGrid();
    prepTimeout = setTimeout(() => {
        statusDisplay.textContent = 'Jugando';
        wordDisplay.textContent = '';
        playSequence();
    }, 2000);
}

function playSequence() {
    let step = 0;
    sequenceInterval = setInterval(() => {
        if (!gameRunning) return;
        resetHighlights();
        if (step < 8) {
            cells[step].classList.add('highlighted');
            const arrangement = levels[currentLevel - 1];
            const wordIndex = arrangement[step];
            wordDisplay.textContent = currentPair.words[wordIndex];
            step++;
        } else {
            clearInterval(sequenceInterval);
            nextLevel();
        }
    }, speeds[currentLevel - 1]);
}

function resetHighlights() {
    cells.forEach(cell => cell.classList.remove('highlighted'));
}

function startTimer() {
    timeInterval = setInterval(() => {
        timer += 0.01;
        timeDisplay.textContent = timer.toFixed(2);
    }, 10);
}

function clearIntervals() {
    clearInterval(timeInterval);
    clearInterval(sequenceInterval);
    clearTimeout(prepTimeout);
}

function playMusic() {
    if (musicEnabled) {
        bgMusic.play();
    }
}

function stopMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
}

function endGame() {
    gameRunning = false;
    clearIntervals();
    stopMusic();
    statusDisplay.textContent = 'Fin';
    wordDisplay.textContent = '¡Fin de la partida!';
    enableControls();
}

function disableControls() {
    wordPairSelect.disabled = true;
    startLevelSelect.disabled = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
}

function enableControls() {
    wordPairSelect.disabled = false;
    startLevelSelect.disabled = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

function updateDisplays() {
    levelDisplay.textContent = currentLevel;
    timeDisplay.textContent = timer.toFixed(2);
    statusDisplay.textContent = 'Listo';
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    musicBtn.textContent = musicEnabled ? 'Silenciar Música' : 'Activar Música';
    if (gameRunning) {
        if (musicEnabled) {
            bgMusic.play();
        } else {
            bgMusic.pause();
        }
    }
}
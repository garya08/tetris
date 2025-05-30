import { Tetris } from "./tetris.js";
import { convertPositionToIndex, convertCurrPos, PLAYFIELD_COLUMNS, PLAYFIELD_ROWS, SAD, LEVELS } from "./utilities.js";
import { btnRestart, btnContinue, btnPause, audio, btnVolume, scoreEl, speedEl, levelEl } from "./index.js";

var is_touch_device = 'ontouchstart' in document.documentElement;
let hammer;
let requestId;
let timeoutId;
const tetris = new Tetris();
const cells = document.querySelectorAll('.grid>div');
const currCells = document.querySelectorAll('.currentBlock>div');

initKeydown();
if(is_touch_device){
    initTouch();
}

moveDown();

function initKeydown() {
    document.addEventListener('keydown', onKeydown);
}

function onKeydown(event) {
    switch (event.key) {
        case 'ArrowUp':
            rotate();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case ' ':
            dropDown();
            break;
        default:
            break;
    }
}

function initTouch() {
    document.addEventListener('dblclick', (event) => {
        event.preventDefault();
    });

    hammer = new Hammer(document.querySelector('body'));
    hammer.get('pan').set({direction: Hammer.DIRECTION_ALL});
    hammer.get('swipe').set({direction: Hammer.DIRECTION_ALL});

    const threshold = 30;
    let deltaX = 0;
    let deltaY = 0;

    hammer.on('panstart', () => {
        deltaX = 0;
        deltaY = 0;
    });

    hammer.on('panleft', (event) => {
        if (Math.abs(event.deltaX - deltaX) > threshold) {
            moveLeft();
            deltaX = event.deltaX;
            deltaY = event.deltaY;
        }
    });

    hammer.on('panright', (event) => {
        if (Math.abs(event.deltaX - deltaX) > threshold) {
            moveRight();
            deltaX = event.deltaX;
            deltaY = event.deltaY;
        }
    });

    hammer.on('pandown', (event) => {
        if (Math.abs(event.deltaY - deltaY) > threshold) {
            moveDown();
            deltaX = event.deltaX;
            deltaY = event.deltaY;
        }
    });

    hammer.on('swipedown', (event) => {
        dropDown();
    });

    hammer.on('tap', () => {
        rotate();
    })
}

function moveDown() {
    tetris.moveTetrominoDown();
    draw();
    stopLoop();
    startLoop();

    if (tetris.isGameOver) {
        gameOver();
    }
}
function moveLeft() {
    tetris.moveTetrominoLeft();
    draw();
}
function moveRight() {
    tetris.moveTetrominoRight();
    draw();
}
function rotate() {
    tetris.rotateTetromino();
    draw();
}
function dropDown() {
    tetris.dropTetrominoDown();
    draw();
    stopLoop();
    startLoop();

    if (tetris.isGameOver) {
        gameOver();
    }
}

function startLoop() {
    timeoutId = setTimeout(() => requestId = requestAnimationFrame(moveDown), 700 - 200*tetris.speed);
}

function stopLoop() {
    cancelAnimationFrame(requestId);
    clearTimeout(timeoutId);
}



function draw() {
    cells.forEach(cell => cell.removeAttribute('class'));
    drawPlayField();
    drawTetromino();
    drawGhostTetromino();
    drawCurrTetromino();
    
    scoreEl.textContent = tetris.score.toString().padStart(6, '0');
    speedEl.textContent = tetris.speed.toString();
    levelEl.textContent = tetris.level.toString();
    checkScore();
}

function drawCurrTetromino() {
    const name = tetris.tetromino.name;
    const matrix = convertCurrPos(name);
    const matrixSize = matrix.length;
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
            currCells[i * matrixSize + j].removeAttribute('class');
            if (matrix[i][j] > 0) currCells[i * matrixSize + j].classList.add(name);
        }
    }
}

function drawPlayField() {
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if (!tetris.playfield[row][column]) continue;
            const name = tetris.playfield[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function drawTetromino() {
    const name = tetris.tetromino.name;
    const tetrominoMatrixSize = tetris.tetromino.matrix.length;
    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if (!tetris.tetromino.matrix[row][column]) continue;
            if (tetris.tetromino.row + row < 0) continue;
            const cellIndex = convertPositionToIndex(tetris.tetromino.row + row, tetris.tetromino.column + column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function drawGhostTetromino() {
    const tetrominoMatrixSize = tetris.tetromino.matrix.length;
    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if (!tetris.tetromino.matrix[row][column]) continue;
            if (tetris.tetromino.ghostRow + row < 0) continue;
            const cellIndex = convertPositionToIndex(tetris.tetromino.ghostRow + row, tetris.tetromino.ghostColumn + column);
            cells[cellIndex].classList.add('ghost');
        }
    }
}

function gameOver() {
    stopLoop();
    document.removeEventListener('keydown', onKeydown);
    if(is_touch_device){
        hammer.off('panstart panleft panright pandown swipedown tap')
    }
    gameOverAnimation();
    showGameOverModal()
}

function gameOverAnimation() {
    const filledCells = [...cells].filter(cell => cell.classList.length > 0);
    filledCells.forEach((cell, i) => {
        setTimeout(() => cell.classList.add('hide'), i * 10);
        setTimeout(() => cell.removeAttribute('class'), i * 10 + 500);
    });

    setTimeout(drawSad, filledCells.length * 10 + 1000);
}

function drawSad() {
    const TOP_OFFSET = 5;
    for (let row = 0; row < SAD.length; row++) {
        for (let column = 0; column < SAD[0].length; column++) {
            if (!SAD[row][column]) continue;
            const cellIndex = convertPositionToIndex(TOP_OFFSET + row, column);
            cells[cellIndex].classList.add('sad')
        }
    }
}



// INDEX.JS
btnRestart.addEventListener('click', function(e) {
    e.target.parentNode.style.display = "none";
    e.target.parentNode.close();
    startLoop();
    draw();
})
btnContinue.addEventListener('click', function(e) {
    e.target.parentNode.style.display = "none";
    e.target.parentNode.close();
    startLoop();
    btnVolume.classList.contains('ico') ? audio.pause() : audio.play();
})
btnPause.addEventListener('click', function(e) {
    btnContinue.parentNode.style.display = "flex";
    btnContinue.parentNode.showModal();
    stopLoop();
    audio.pause();
})
function showGameOverModal() {
    const parent = btnRestart.parentNode;
    parent.style.display = "flex";
    parent.showModal();
    parent.querySelector('span').textContent = tetris.score.toString().padStart(6, '0');
}
function checkScore() {
    const speedsLevel = {
        0: 0,
        1: 0,
        2: 0,
        3: 1,
        4: 1,
        5: 1,
        6: 2,
        7: 2,
        8: 2,
        9: 3,
        10: 3
    }
    if (tetris.score > LEVELS[0]) tetris.level = 0;
    if (tetris.score > LEVELS[1]) tetris.level = 1;
    if (tetris.score > LEVELS[2]) tetris.level = 2;
    if (tetris.score > LEVELS[3]) tetris.level = 3;
    if (tetris.score > LEVELS[4]) tetris.level = 4;
    if (tetris.score > LEVELS[5]) tetris.level = 5;
    if (tetris.score > LEVELS[6]) tetris.level = 6;
    if (tetris.score > LEVELS[7]) tetris.level = 7;
    if (tetris.score > LEVELS[8]) tetris.level = 8;
    if (tetris.score > LEVELS[9]) tetris.level = 9;
    if (tetris.score > LEVELS[10]) tetris.level = 10;

    tetris.speed = speedsLevel[tetris.level]
}
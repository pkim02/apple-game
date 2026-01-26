// Apple Game (사과게임) - Main Game Logic

// Game Configuration
const COLS = 17;
const ROWS = 10;
const GAME_DURATION = 120; // 2 minutes in seconds

// Game State
let grid = [];
let score = 0;
let highScore = 0;
let timeRemaining = GAME_DURATION;
let gameStarted = false;
let gameOver = false;
let timerInterval = null;

// Selection State
let isSelecting = false;
let selectionStart = { col: 0, row: 0 };
let selectionEnd = { col: 0, row: 0 };
let mouseStartX = 0;
let mouseStartY = 0;

// DOM Elements
let gameGrid, selectionBox, scoreDisplay, highScoreDisplay;
let timerBar, timerText, startBtn, resetBtn, restartBtn, gameOverModal, finalScoreDisplay;
let gameContainer;

// Initialize the game
function init() {
    // Get DOM elements
    gameGrid = document.getElementById('gameGrid');
    gameContainer = document.getElementById('gameContainer');
    selectionBox = document.getElementById('selectionBox');
    scoreDisplay = document.getElementById('score');
    highScoreDisplay = document.getElementById('highScore');
    timerBar = document.getElementById('timerBar');
    timerText = document.getElementById('timerText');
    startBtn = document.getElementById('startBtn');
    resetBtn = document.getElementById('resetBtn');
    restartBtn = document.getElementById('restartBtn');
    gameOverModal = document.getElementById('gameOverModal');
    finalScoreDisplay = document.getElementById('finalScore');
    // Load high score
    highScore = parseInt(localStorage.getItem('appleGameHighScore') || '0');
    highScoreDisplay.textContent = highScore;

    // Set up event listeners
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', restartGame);
    restartBtn.addEventListener('click', restartGame);

    // Mouse events
    gameContainer.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Touch events
    gameContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    // Initialize grid display (empty state)
    initGrid();
    renderGrid();
}

// Initialize grid with random numbers
function initGrid() {
    grid = [];
    for (let row = 0; row < ROWS; row++) {
        grid[row] = [];
        for (let col = 0; col < COLS; col++) {
            grid[row][col] = getRandomNumber();
        }
    }
}

// Get random number 1-9
function getRandomNumber() {
    return Math.floor(Math.random() * 9) + 1;
}

// Render the grid to DOM
function renderGrid() {
    gameGrid.innerHTML = '';
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'apple-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            if (grid[row][col] !== null) {
                cell.textContent = grid[row][col];
            } else {
                cell.classList.add('empty');
            }
            
            gameGrid.appendChild(cell);
        }
    }
}

// Start the game
function startGame() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    timeRemaining = GAME_DURATION;
    
    scoreDisplay.textContent = score;
    startBtn.style.display = 'none';
    resetBtn.classList.remove('hidden');
    gameOverModal.classList.add('hidden');

    initGrid();
    renderGrid();
    startTimer();
}

// Restart the game
function restartGame() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    startGame();
}

// Timer functions
function startTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const percentage = (timeRemaining / GAME_DURATION) * 100;
    timerBar.style.height = `${percentage}%`;
    
    // Add warning class when time is low
    if (timeRemaining <= 20) {
        timerBar.classList.add('low');
    } else {
        timerBar.classList.remove('low');
    }
}

// End the game
function endGame() {
    gameOver = true;
    gameStarted = false;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Update high score
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('appleGameHighScore', highScore.toString());
    }
    
    finalScoreDisplay.textContent = score;
    gameOverModal.classList.remove('hidden');
    startBtn.style.display = 'inline-block';
}

// Get cell position from mouse/touch coordinates
function getCellFromPoint(x, y) {
    const rect = gameGrid.getBoundingClientRect();
    const relX = x - rect.left;
    const relY = y - rect.top;
    
    const cellWidth = rect.width / COLS;
    const cellHeight = rect.height / ROWS;
    
    const col = Math.floor(relX / cellWidth);
    const row = Math.floor(relY / cellHeight);
    
    return {
        col: Math.max(0, Math.min(COLS - 1, col)),
        row: Math.max(0, Math.min(ROWS - 1, row))
    };
}

// Mouse event handlers
function handleMouseDown(e) {
    if (!gameStarted || gameOver) return;
    e.preventDefault();
    
    const { col, row } = getCellFromPoint(e.clientX, e.clientY);
    startSelection(e.clientX, e.clientY, col, row);
}

function handleMouseMove(e) {
    if (!isSelecting) return;
    e.preventDefault();
    
    updateSelection(e.clientX, e.clientY);
}

function handleMouseUp(e) {
    if (!isSelecting) return;
    endSelection();
}

// Touch event handlers
function handleTouchStart(e) {
    if (!gameStarted || gameOver) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const { col, row } = getCellFromPoint(touch.clientX, touch.clientY);
    startSelection(touch.clientX, touch.clientY, col, row);
}

function handleTouchMove(e) {
    if (!isSelecting) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    updateSelection(touch.clientX, touch.clientY);
}

function handleTouchEnd(e) {
    if (!isSelecting) return;
    endSelection();
}

// Selection logic
function startSelection(clientX, clientY, col, row) {
    isSelecting = true;
    mouseStartX = clientX;
    mouseStartY = clientY;
    selectionStart = { col, row };
    selectionEnd = { col, row };
    
    updateSelectionBox();
    selectionBox.classList.remove('hidden');
}

function updateSelection(clientX, clientY) {
    const { col, row } = getCellFromPoint(clientX, clientY);
    selectionEnd = { col, row };
    
    updateSelectionBox();
    highlightSelectedCells();
}

function updateSelectionBox() {
    const rect = gameGrid.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    
    const cellWidth = rect.width / COLS;
    const cellHeight = rect.height / ROWS;
    
    // Get normalized selection bounds
    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);
    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);
    
    // Calculate box position relative to container
    const offsetX = rect.left - containerRect.left;
    const offsetY = rect.top - containerRect.top;
    
    const left = offsetX + minCol * cellWidth;
    const top = offsetY + minRow * cellHeight;
    const width = (maxCol - minCol + 1) * cellWidth;
    const height = (maxRow - minRow + 1) * cellHeight;
    
    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    
    // Calculate sum and update box appearance
    const sum = calculateSum();
    
    selectionBox.classList.remove('valid', 'invalid');
    if (sum === 10) {
        selectionBox.classList.add('valid');
    } else {
        selectionBox.classList.add('invalid');
    }
}

function highlightSelectedCells() {
    // Remove all previous highlights
    document.querySelectorAll('.apple-cell.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    // Add highlight to selected cells
    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);
    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);
    
    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
            const cell = document.querySelector(`.apple-cell[data-row="${row}"][data-col="${col}"]`);
            if (cell && grid[row][col] !== null) {
                cell.classList.add('selected');
            }
        }
    }
}

function endSelection() {
    isSelecting = false;
    selectionBox.classList.add('hidden');
    
    // Remove highlights
    document.querySelectorAll('.apple-cell.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    // Check if sum equals 10
    const sum = calculateSum();
    const appleCount = countSelectedApples();
    
    if (sum === 10 && appleCount > 0) {
        // Valid selection - remove apples
        removeSelectedApples();
    }
}

function calculateSum() {
    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);
    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);
    
    let sum = 0;
    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
            if (grid[row][col] !== null) {
                sum += grid[row][col];
            }
        }
    }
    
    return sum;
}

function countSelectedApples() {
    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);
    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);
    
    let count = 0;
    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
            if (grid[row][col] !== null) {
                count++;
            }
        }
    }
    
    return count;
}

function removeSelectedApples() {
    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);
    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);
    
    const cellsToRemove = [];
    
    // Mark cells for removal with animation
    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
            if (grid[row][col] !== null) {
                const cell = document.querySelector(`.apple-cell[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.classList.add('popping');
                    cellsToRemove.push({ row, col, cell });
                }
            }
        }
    }
    
    // Calculate score (more apples = more points)
    const appleCount = cellsToRemove.length;
    const points = appleCount * 10 + (appleCount > 2 ? (appleCount - 2) * 5 : 0);
    
    // Show floating score
    showFloatingScore(points);
    
    // Update score
    score += points;
    scoreDisplay.textContent = score;
    scoreDisplay.classList.add('score-pop');
    setTimeout(() => {
        scoreDisplay.classList.remove('score-pop');
    }, 300);
    
    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('appleGameHighScore', highScore.toString());
    }
    
    // After pop animation completes, hide cells and update grid
    setTimeout(() => {
        // Hide the popped cells immediately
        cellsToRemove.forEach(({ row, col, cell }) => {
            grid[row][col] = null;
            cell.classList.remove('popping');
            cell.classList.add('empty');
            cell.textContent = '';
            cell.style.visibility = 'hidden';
            cell.style.opacity = '0';
        });
        
        // Just re-render the grid (no gravity)
        renderGridWithAnimation();
    }, 450);
}

function showFloatingScore(points) {
    const rect = gameGrid.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    
    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);
    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);
    
    const cellWidth = rect.width / COLS;
    const cellHeight = rect.height / ROWS;
    
    const centerX = (minCol + maxCol + 1) / 2 * cellWidth + (rect.left - containerRect.left);
    const centerY = (minRow + maxRow + 1) / 2 * cellHeight + (rect.top - containerRect.top);
    
    const floatingScore = document.createElement('div');
    floatingScore.className = 'floating-score';
    floatingScore.textContent = `+${points}`;
    floatingScore.style.left = `${centerX}px`;
    floatingScore.style.top = `${centerY}px`;
    
    gameContainer.appendChild(floatingScore);
    
    setTimeout(() => {
        floatingScore.remove();
    }, 1000);
}

function renderGridWithAnimation() {
    const cells = gameGrid.querySelectorAll('.apple-cell');
    
    cells.forEach((cell, index) => {
        const row = Math.floor(index / COLS);
        const col = index % COLS;
        
        if (grid[row][col] !== null) {
            const wasEmpty = cell.classList.contains('empty') || cell.classList.contains('popping');
            
            // Reset all states
            cell.classList.remove('empty', 'popping');
            cell.style.visibility = 'visible';
            cell.style.opacity = '1';
            cell.textContent = grid[row][col];
            
            if (wasEmpty) {
                cell.classList.add('spawning');
                setTimeout(() => {
                    cell.classList.remove('spawning');
                }, 350);
            }
        } else {
            cell.classList.add('empty');
            cell.style.visibility = 'hidden';
            cell.style.opacity = '0';
            cell.textContent = '';
        }
    });
}

// Initialize on page load
window.addEventListener('load', init);

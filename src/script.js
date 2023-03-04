const board = document.querySelector('.board');
const tiles = [];
const numCols = 16;
const numRows = 16;
const numMines = 40;
const emoji = document.getElementById('emoji');
const hun = document.getElementById('hundreds');
const doz = document.getElementById('dozens');
const un = document.getElementById('units');
const timer = document.getElementById('timer');
const hundreds = document.getElementById('timer-hundreds');
const dozens = document.getElementById('timer-dozens');
const units = document.getElementById('timer-units');
let hundreds_num;
let dozens_num;
let units_num;
let startTime;
let intervalId;
let firstPress = false;

function createBoard() {

    setMinesNum(numMines);
    startTimer();
    // Create tiles
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.dataset.row = i;
            tile.dataset.col = j;
            tile.addEventListener('click', handleTileClick);
            tile.addEventListener('contextmenu', handleTileFlag);
            tile.addEventListener('mousedown', () => emoji.classList.add('shocked'));
            tile.addEventListener('mouseup', () => emoji.classList.remove('shocked'));
            board.appendChild(tile);
            tiles.push(tile);
        }
    }
    // Add mines
    for (let i = 0; i < numMines; i++) {
        let tile;
        do {
            tile = tiles[Math.floor(Math.random() * tiles.length)];
        } while (tile.classList.contains('mine'));
        tile.classList.add('mine');
    }
    // Add emoji button listener
    emoji.addEventListener('click', newGame);
}

function newGame() {
    hundreds.classList.remove(`timer-${hundreds_num}`);
    dozens.classList.remove(`timer-${dozens_num}`);
    units.classList.remove(`timer-${units_num}`);
    stopTimer();
    tiles.length = 0;
    board.innerHTML = '';
    emoji.classList.remove('gameOver');
    emoji.classList.remove('win');
    createBoard();
    firstPress = false;
}

function handleTileClick(event) {
    const tile = checkMine(event.target);
    firstPress = true;
    if (tile.classList.contains('open') || tile.classList.contains('flagged')) return;
    if (tile.classList.contains('mine')) {
        tile.classList.add('mine-tapped');
        emoji.classList.add('gameOver');
        revealMines();
        stopTimer();
        alert('Game over!');
    } else {
        const numAdjacentMines = getNumAdjacentMines(tile);
        tile.classList.add('open');
        tile.classList.add(`mine-${numAdjacentMines || ''}`)
        if (numAdjacentMines === 0) {
            openAdjacentTiles(tile);
        }
        tile.classList.add('open');
        checkWin();
    }
}

function checkMine(tile) {
    if (!firstPress) {
        if (tile.classList.contains('mine')) {
            while(tiles.find(tile_ => tile_.dataset.row == tile.dataset.row && tile_.dataset.col == tile.dataset.col).classList.contains('mine')){
                tiles.length = 0;
                board.innerHTML = '';
                createBoard();
            }
            return tiles.find(tile_ => tile_.dataset.row == tile.dataset.row && tile_.dataset.col == tile.dataset.col);
        }
    }
    return tile;
}

function handleTileFlag(event) {
    event.preventDefault();
    const tile = event.target;
    if (tile.classList.contains('open')) return;
    if (tile.classList.contains('flagged')) {
        tile.classList.remove('flagged');
        tile.classList.add('question');
    } else if (tile.classList.contains('question')) {
        tile.classList.remove('question');
    } else {
        tile.classList.add('flagged');
    }
    checkWin();
}

function getTile(row, col) {
    return tiles.find(tile => tile.dataset.row == row && tile.dataset.col == col);
}

function getNumAdjacentMines(tile) {
    const row = parseInt(tile.dataset.row);
    const col = parseInt(tile.dataset.col);
    let numMines = 0;
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            const adjacentTile = getTile(i, j);
            if (adjacentTile && adjacentTile.classList.contains('mine')) {
                numMines++;
            }
        }
    }
    return numMines;
}

function openAdjacentTiles(tile) {
    const row = parseInt(tile.dataset.row);
    const col = parseInt(tile.dataset.col);
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            const adjacentTile = getTile(i, j);
            if (adjacentTile && !adjacentTile.classList.contains('open') && !adjacentTile.classList.contains('flagged')) {
                const numAdjacentMines = getNumAdjacentMines(adjacentTile);
                adjacentTile.classList.add('open');
                adjacentTile.classList.add(`mine-${numAdjacentMines || ''}`)
                if (numAdjacentMines === 0) {
                    openAdjacentTiles(adjacentTile);
                }
            }
        }
    }
}

function revealMines() {
    tiles.forEach(tile => {
        if (tile.classList.contains('mine')) {
            tile.classList.add('mine-opened');
        }
    });
    // stopTimer();
}

function checkWin() {
    const numUnopenedTiles = tiles.filter(tile => !tile.classList.contains('open')).length;
    // const numFlaggedMines = tiles.filter(tile => tile.classList.contains('mine') && tile.classList.contains('flagged')).length;
    if (numUnopenedTiles === numMines){ // numFlaggedMines === numMines) {
        document.getElementById('emoji').classList.add('win');
        stopTimer();
        revealMines();
        alert('You win!');
    }
}


createBoard();

function setMinesNum(num) {

    const hun_ = Math.floor(num / 100);
    const doz_ = Math.floor(num % 100 / 10);
    const un_ = Math.floor(num % 10);

    hun.classList.add(`timer-${hun_}`);
    doz.classList.add(`timer-${doz_}`);
    un.classList.add(`timer-${ un_}`);
}



// startTimer();

function startTimer() {
    startTime = Date.now();
    intervalId = setInterval(updateTimer, 1000);
}

function stopTimer() {
    clearInterval(intervalId);
    hundreds.classList.remove(`timer-${hundreds_num}`);
    dozens.classList.remove(`timer-${dozens_num}`);
    units.classList.remove(`timer-${units_num}`);
}

function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

    hundreds_num = Math.floor(elapsedTime / 100);
    dozens_num = Math.floor(elapsedTime % 100 / 10);
    units_num = Math.floor(elapsedTime % 10);

    hundreds.classList.remove(`timer-${hundreds_num === 0 ? 9 : hundreds_num - 1}`);
    hundreds.classList.add(`timer-${hundreds_num}`);

    dozens.classList.remove(`timer-${dozens_num === 0 ? 9 : dozens_num - 1}`);
    dozens.classList.add(`timer-${dozens_num}`);

    units.classList.remove(`timer-${units_num === 0 ? 9 : units_num - 1}`);
    units.classList.add(`timer-${units_num}`);
}
import { theTetrominoes, tetrominoesColors, theTetrominoesMini, generateQueueIndex, emitNotif, stockGrid, setControlButton, deployKeyListener } from './game-utils.js'

const socket = io();

let { username, host } = Qs.parse(location.search, { 
    ignoreQueryPrefix: true
});

const playerName = document.getElementById('nameplate-text');
const opponentName = document.getElementById('opp-nameplate-text');
const opponentDiv = document.getElementById('opponent');
const opponentGrid = document.querySelector('.grid-two');
const opponentScore = document.querySelector('#opponent-score');
const opponentSection = document.getElementById('opponent-score-section');
const fillerDiv = document.getElementById('filler');
const container = document.querySelector('.container');
const notif = document.getElementById('notify');
let gameOnPause = true;

if(!host) {
    host = username;
    emitNotif('invite someone w/ userID', notif, container);
}

playerName.innerText = username;

let playSolo = true;
let playSoloOngoing = false;
let player = {
    'name': username,
    'host': host,
    'score': 0,
    'alive': false,
    'screen': document.querySelector('.grid').innerHTML
}
let opponent = {
    'name': null,
    'host': null,
    'score': 0,
    'alive': false,
    'screen': null
}

socket.emit('joinRoom', { username, host });

socket.on('userJoin', user => {
    
    playSolo = false;
    opponentJoined(user);

    if(!player.alive) {
        emitNotif(`${user} joined.`, notif, container);
    }
})

socket.on('userDisconnect', user => {
    if(user === host) {
        socket.emit('refreshRoom', {username, host});
        host = player.name;
        player.host = player.name;
        socket.emit('joinRoom', { username, host });
    }
    
    playSolo = true;
    opponentDisconnect();
    if(player.alive) {
        playSoloOngoing = true;
    }

    if(!player.alive) {
        emitNotif(`${user} left.`, notif, container);
        //servalCall code#3 request gameButtonReset;
        socket.emit('serverCall', 3)
    }
})

socket.on('gameOpponentData', user => {
    opponent = user;
    
    if(opponent.alive) {
        opponentGrid.innerHTML = opponent.screen;
        opponentScore.innerText = opponent.score;
        opponentScore.style.color = '#636363';

        if(opponent.score > 0) opponentScore.style.color = tetrominoesColors[opponent.score - ( 7 * Math.floor(opponent.score/7) )];
    }

    if(!opponent.alive) opponentGrid.style.filter = 'opacity(0.5)';

    if(playSoloOngoing) return

    //server call code #0 to eval match score
    if(player.score > opponent.score && !opponent.alive) {
        socket.emit('serverCall', 0);
    }
    if(opponent.score > player.score && !player.alive) {
        socket.emit('serverCall', 0);
    }
    if(!player.alive && !opponent.alive) {
        socket.emit('serverCall', 0);
    }
})

function sendGameDataToServer() {
    if(!playSolo) socket.emit('gameData', player);
}

function opponentJoined(user) {
    fillerDiv.style.display = 'none';
    opponentSection.style.display = 'flex';
    opponentGrid.style.display = 'flex';
    opponentDiv.style.display = 'block'
    opponentName.innerText = player.name !== player.host ? player.host : user;
}

if(player.name !== player.host) {
    playSoloOngoing = true;
    playSolo = false;
    opponentJoined();
    emitNotif(`u joined ${player.host}`, notif, container);
};

function opponentDisconnect() {
    fillerDiv.style.display = 'block';
    opponentSection.style.display = 'none';
    opponentGrid.style.display = 'none';
    opponentDiv.style.display = 'none';
    opponentGrid.innerHTML = stockGrid;
    opponent = {
        'name': null,
        'host': null,
        'score': 0,
        'alive': false,
        'screen': null
    }
}

// game and socket logic
document.addEventListener('DOMContentLoaded', () => {
    // parent of game DOM divs
    const grid = document.querySelector('.grid');

    // array of game DOM divs
    let cells = Array.from(document.querySelectorAll('.grid div'));
    
    let queueCells = [
        Array.from(document.querySelectorAll('#item-1 div')),
        Array.from(document.querySelectorAll('#item-2 div')),
        Array.from(document.querySelectorAll('#item-3 div')),
        Array.from(document.querySelectorAll('#item-4 div')),
        Array.from(document.querySelectorAll('#item-5 div'))
    ]

    // game DOM divs
    const playerScore = document.querySelector('#player-score');
    const gameToggle = document.getElementById('game-toggle');
    const controlWrap = document.querySelector('.control-wrap');
    const controlToggle = document.getElementById('control-toggle');

    const buttons = {
        'left': document.getElementById("left-btn"),
        'up': document.getElementById("up-btn"),
        'down': document.getElementById("down-btn"),
        'right': document.getElementById("right-btn"),
        'space': document.getElementById("space-btn"),
    }

    const width = 10;

    function setGameButton() {
        gameToggle.onclick = () => {
            if(!player.alive && !opponent.alive && !playSolo) {
                // server call code#4 is to request for reset()
                socket.emit('serverCall', 4);
            }
            if(!playSolo && !opponent.alive) {
                // server call code#1 is for timer start
                socket.emit('serverCall', 1);
            }

            if(playSolo) {
                reset();
                draw();
                drawQueue();
                scoreUpdate();
                toggleRun();
                gameToggle.onclick = () => {toggleRun();}
            }
        }

        gameToggle.innerHTML = 'START';
    }

    setGameButton();

    socket.on('gameCall', code => {
        // server call code#1 is for timer start
        if(code === 1) {
            player.alive = true;
            playSolo = false;
            gameOnPause = true
            gameToggle.onclick = '';
            gameToggle.innerHTML = '...';
            grid.style.filter = '';
            opponentGrid.style.filter = '';
            draw();
            drawQueue();
            let count = 3
            let interval = setInterval(()=>{
                if(count === -1) {
                    count = 3;
                    playerScore.style.color = '#636363';
                    opponentScore.style.color = '#636363';
                    opponentScore.innerText = 0;
                    playerScore.innerText = 0;
                    gameOnPause = false;
                    gameToggle.innerHTML = 'PAUSE';
                    gameToggle.onclick = () => {
                        if(playSoloOngoing) {
                            toggleRun();
                            return
                        }

                        // server call code#2 is for game pause
                        if(player.alive) socket.emit('serverCall', 2);
                    }
                    runGame();
                    clearInterval(interval);
                    return
                }
                playerScore.style.color = tetrominoesColors[count];
                opponentScore.style.color = tetrominoesColors[count];
                opponentScore.innerText = count === 0 ? '!!!' : count;
                playerScore.innerText = count === 0 ? '!!!' : count;
                count--;
            }, 1000)
        }

        // server call code#2 is for match pause
        if(code === 2) {
            pauseGame();
            grid.style.filter = 'opacity(0.5)'
            opponentGrid.style.filter = 'opacity(0.5)'
            gameToggle.innerHTML = 'START'
            gameToggle.onclick = () => {
                socket.emit('serverCall', 1);
            }
        }

        if(code === 3) {
            console.log('gago amp')
            setGameButton();
        }

        if(code === 4) {
            reset();
        }

        if(code === 0) {
            pauseGame();
            emitNotif(
                player.score > opponent.score ?
                'you won.' :
                opponent.score > player.score ?
                `${opponent.name} won.` :
                "it's a tie.",
                notif,
                container
            )
            player.alive = false;
            opponent.alive = false;
            gameOnPause = true;
            setGameButton();
        }
    })

    controlToggle.onclick = () => {
        if(controlToggle.innerText === 'show control buttons?') {
            controlWrap.style.display = 'flex';
            controlToggle.innerText = 'hide control buttons?';
            return
        }

        controlWrap.style.display = 'none';
        controlToggle.innerText = 'show control buttons?';
    }

    function scoreUpdate() {
        if(player.score > 0) {
            playerScore.style.color = tetrominoesColors[player.score - ( 7 * Math.floor(player.score/7) )]
        }

        playerScore.innerText = player.score;
    }

    function toggleRun() {
        if(gameToggle.innerHTML === 'PAUSE') {
            pauseGame();
            gameOnPause = true;
            gameToggle.innerHTML = 'START';
            return
        }

        runGame();
        gameOnPause = false;
        gameToggle.innerHTML = 'PAUSE';
    }

    // initial first 14 tetromino queue
    let tetrominoQueue = []
    generateQueueIndex(tetrominoQueue);
    generateQueueIndex(tetrominoQueue);

    let currentIndex = 4;

    // always gets the first in queue 
    let currentShape = tetrominoQueue[0].shape;
    let currentRotation = tetrominoQueue[0].rotation;

    let currentTetromino = theTetrominoes[currentShape][currentRotation];
    let speed = 1000;

    // draw and undraw with the help of class style
    function draw() {
        currentTetromino.forEach(index => {
            cells[index + currentIndex].classList.add('blocks');
            cells[index + currentIndex].style.backgroundColor = tetrominoesColors[currentShape];
            }
        )
        player.screen = grid.innerHTML;
        sendGameDataToServer();
    }

    function undraw() {
        currentTetromino.forEach(index => {
            cells[index + currentIndex].classList.remove('blocks');
            cells[index + currentIndex].style.backgroundColor = '';
            }
        )
    }

    function drawQueue() {
        for(let i = 0; i < 5; i++) {
            theTetrominoesMini[tetrominoQueue[i+1].shape][tetrominoQueue[i+1].rotation].forEach(index => {
                queueCells[i][index].classList.add('blocks');
                queueCells[i][index].style.backgroundColor = tetrominoesColors[tetrominoQueue[i+1].shape];
                }
            )
        }
    }

    function undrawQueue() {
        for(let i = 0; i < 5; i++) {
            theTetrominoesMini[tetrominoQueue[i+1].shape][tetrominoQueue[i+1].rotation].forEach(index => {
                queueCells[i][index].classList.remove('blocks');
                queueCells[i][index].style.backgroundColor = '';
                }
            )
        }
    }

    // left and right bound detection
    function utmostRight() {
        return currentTetromino.some(index=> (currentIndex + index + 1) % width === 0)  
      }
    
    function utmostLeft() {
      return currentTetromino.some(index=> (currentIndex + index) % width === 0)
    }
      
    // check rotate if in-bounds
    function checkRotate(pos){
        // if pos NaN get currentIndex for self-recall
        pos = pos || currentIndex

        // right bound
        if ((pos+1) % width < 4) {  
            if (utmostRight()){
                // resets and cancels the new rotation if there's a still collision
                if(theTetrominoes[currentShape][currentRotation].some(index => cells[index + currentIndex + 1].classList.contains('still'))) {
                    currentRotation === 0 ? currentRotation = 3 : currentRotation--;
                    currentTetromino = theTetrominoes[currentShape][currentRotation];
                    return
                }

                currentIndex += 1;
                return
            }
        }

        // left bound
        if (pos % width > 5) {
            if (utmostLeft()){
                // resets and cancels the new rotation if there's a still collision
                if(theTetrominoes[currentShape][currentRotation].some(index => cells[index + currentIndex - 1].classList.contains('still'))) {
                    currentRotation === 0 ? currentRotation = 3 : currentRotation--;
                    currentTetromino = theTetrominoes[currentShape][currentRotation];
                    return
                }

                currentIndex -= 1;
                // recall again for long tetromino such as I
                checkRotate(pos);
                return
            }
        }
    }

    // moves the tetromino with restrictionwd
    function move(dir) {
        if(gameOnPause) return

        if(dir === 'left') {
            // return for still block collision
            if (utmostLeft() || currentTetromino.some(index => cells[(index + currentIndex) - 1].classList.contains('still'))) return;
        
            // initiate if passed
            undraw();
            currentIndex--;
            draw();
        }

        if(dir === 'right') {
            // return for still block collision
            if (utmostRight() || currentTetromino.some(index => cells[(index + currentIndex) + 1].classList.contains('still'))) return;
            
            // initiate if passed
            undraw();
            currentIndex++;
            draw();
        }

        if(dir === 'down') {
            // return for still block collision
            if(currentTetromino.some(index => cells[index + currentIndex + width].classList.contains('still'))) return;
            
            // initiate if passed
            undraw();
            currentIndex += width;
            draw(); 
        }

        if(dir === 'rotate') {
            // return for still block collision
            if(theTetrominoes[currentShape][currentRotation === 3 ? 0 : currentRotation+1].some(index => cells[index + currentIndex].classList.contains('still'))) return;

            // initiate if passed
            undraw();
            currentRotation++;
            if(currentRotation === 4) currentRotation = 0;
            currentTetromino = theTetrominoes[currentShape][currentRotation];
            checkRotate();
            draw();
        }

        if(dir === 'space') {
            // rapid down
            let drop = setInterval(() => {
                move('down');
            }, 1)

            // set interval-id for another call just incase
            localStorage.setItem('drop-interval', drop);

            // time allowance for interval to be cleared
            setTimeout(() => {
                clearInterval(drop);
                draw();
                detectStill();
            }, 100)
        } 
    }

    setControlButton(buttons, move);

    deployKeyListener(move);

    // runs render interval
    function runGame() {
        gameOnPause = false;
        if(playSolo) playSoloOngoing = true;
        player.alive = true;

        //  interval for game render with rules detection
        let blockInterval = setInterval(()=>{
            detectStill();
            undraw();
            currentIndex += width;
            player.alive && draw();
        }, speed)

        // makes interval local for outside-the-function calls
        localStorage.setItem('block-interval' + username, blockInterval);
    }

    // stops render interval
    function pauseGame() {

        // gets the interval from local and clears the run
        clearInterval(localStorage.getItem('block-interval' + username));
    }

    // detect stuff by the game rule
    function detectStill() {
        
        // predicts current tetromino next move and detect for collision
        if(currentTetromino.some(index => cells[index + currentIndex + width].classList.contains('still'))) {
            clearInterval(localStorage.getItem('drop-interval'))

            // if collision detected and tetromino is at spawn index
            if(currentIndex-width === 4) {
                gameOnPause = true;
                player.alive = false;
                pauseGame();
                grid.style.filter = 'opacity(0.5)';
                if(!playSolo) {
                    sendGameDataToServer();
                    if(!player.alive && !opponent.alive) {
                        gameToggle.innerHTML = 'START';
                        if(playSoloOngoing) {
                            setGameButton();
                            playSoloOngoing = false;
                        }
                        return
                    }
                    gameToggle.innerHTML = '...';
                    return
                }
                playSoloOngoing = false;
                setGameButton();
                emitNotif('u got stuck.', notif, container);
                return
            }
            
            // stabilize the tetromino queue to be always > 7
            if(tetrominoQueue.length <= 7) {
                generateQueueIndex(tetrominoQueue);
            }

            // add still class for the current tetromino and color
            currentTetromino.forEach(index => {
                cells[index + currentIndex].classList.add('still');
                cells[index + currentIndex].style.backgroundColor = tetrominoesColors[currentShape];
                }
            );
            
            // pauses the game, renew variables, and run the game again for the interval speed to apply
            pauseGame();
            currentIndex = 4;
            undrawQueue();
            tetrominoQueue.shift();
            currentShape = tetrominoQueue[0].shape;
            currentRotation = tetrominoQueue[0].rotation;
            currentTetromino = theTetrominoes[currentShape][currentRotation];
            speed = speed * 0.99;
            drawQueue();
            runGame();

            // bug fix for delayed collision detection
            if(currentTetromino.some(index => cells[index + currentIndex + width].classList.contains('still'))) {
                gameOnPause = true;
                player.alive = false;
                pauseGame();
                grid.style.filter = 'opacity(0.5)';
                if(!playSolo) {
                    sendGameDataToServer();
                    if(!player.alive && !opponent.alive) {
                        gameToggle.innerHTML = 'START';
                        if(playSoloOngoing) {
                            setGameButton();
                            playSoloOngoing = false;
                        }
                        return
                    }
                    gameToggle.innerHTML = '...';
                    return
                }
                playSoloOngoing = false;
                setGameButton();
                emitNotif('u got stuck.', notif, container);
                return
            }
        }

        detectStillStreak();
        undraw();
        draw();
    }

    // detect scores
    function detectStillStreak() {
        // mimic game cells index
        for (let i = 0; i < 199; i+= width) { 
            // expression for row
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];

            // row query
            if(row.every(index => cells[index].classList.contains('still'))) {
                // filters cell
                row.forEach(index => {
                    cells[index].classList.remove('still')
                    cells[index].classList.remove('blocks')
                    cells[index].style.backgroundColor = '';
                })

                // re-append to DOM
                const filteredCells = cells.splice(i, width)
                cells = filteredCells.concat(cells)
                cells.forEach(cell => grid.appendChild(cell))

                // add score
                player.score++
                scoreUpdate();
            }
        }
    }

    // resets essential varibles good as new
    function reset() {
        pauseGame();
        cells.forEach((cell, index) => {
            if(index >= 200) return;
            cell.classList.remove('still');
            cell.classList.remove('blocks');
            cell.style.backgroundColor = '';
        })

        for(let i=0; i < 5; i++) {
            queueCells[i].forEach(cell => {
                cell.classList.remove('blocks')
                cell.style.backgroundColor = '';
            })
        }

        currentIndex = 4;
        tetrominoQueue = [];
        generateQueueIndex(tetrominoQueue);
        generateQueueIndex(tetrominoQueue);
        currentShape = tetrominoQueue[0].shape;
        currentRotation = tetrominoQueue[0].rotation;
        currentTetromino = theTetrominoes[currentShape][currentRotation];
        speed = 1000;
        player.score = 0;
        playerScore.style.color = '#636363';
        grid.style.filter = '';
        opponentGrid.style.filter = '';
        playSoloOngoing = false;
        if (opponent) opponent.score = 0;

        setGameButton();
    }

})

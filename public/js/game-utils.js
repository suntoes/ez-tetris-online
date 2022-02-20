const width = 10;

const stockGrid = `
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>
<div></div>`

// array of 7 unique tetrominoes with 4 rotations as 2d index w/ respect to current width
const theTetrominoes = [
    [ // the l tetromino
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ], 
    [ // the inverted l tetromino
        [0, width+1, width*2+1, 1],
        [width+2, width*2,width*2+1,width*2+2],
        [1, width+1, width*2+1, width*2+2],
        [width,width+1,width+2,width*2]
    ], 
    [ // the z tetromino
        [0,width,width+1,width*2+1],
        [width+1, width+2,width*2,width*2+1],
        [0,width,width+1,width*2+1],
        [width+1, width+2,width*2,width*2+1]
    ], 
    [ // the inverted z tetromino
        [2, width+1, width+2,width*2+1],
        [width, width+1, width*2+1, width*2+2],
        [2, width+1, width+2,width*2+1],
        [width, width+1, width*2+1, width*2+2]
    ], 
    [ // the t tetromino
        [1,width,width+1,width+2],
        [1,width+1,width+2,width*2+1],
        [width,width+1,width+2,width*2+1],
        [1,width,width+1,width*2+1]
    ], 
    [ // the o tetromino
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1]
    ], 
    [ // the i tetromino
        [1,width+1,width*2+1,width*3+1],
        [width,width+1,width+2,width+3],
        [1,width+1,width*2+1,width*3+1],
        [width,width+1,width+2,width+3]
    ] 
];

// object of unique tetrominoes color with respect to each indexes
const tetrominoesColors = {
    0: "#f1b450",
    1: "#5061f1",
    2: "#f15050",
    3: "#50f16b",
    4: "#c950f1",
    5: "#f1ef50",
    6: "#50ddf1",
}

// array of 7 unique tetrominoes with 4 rotations as 2d index w/ respect to 4 width
const theTetrominoesMini = [
    [ // the l tetromino
        [1, 4+1, 4*2+1, 2],
        [4, 4+1, 4+2, 4*2+2],
        [1, 4+1, 4*2+1, 4*2],
        [4, 4*2, 4*2+1, 4*2+2]
    ], 
    [ // the inverted l tetromino
        [0, 4+1, 4*2+1, 1],
        [4+2, 4*2,4*2+1,4*2+2],
        [1, 4+1, 4*2+1, 4*2+2],
        [4,4+1,4+2,4*2]
    ], 
    [ // the z tetromino
        [0,4,4+1,4*2+1],
        [4+1, 4+2,4*2,4*2+1],
        [0,4,4+1,4*2+1],
        [4+1, 4+2,4*2,4*2+1]
    ], 
    [ // the inverted z tetromino
        [2, 4+1, 4+2,4*2+1],
        [4, 4+1, 4*2+1, 4*2+2],
        [2, 4+1, 4+2,4*2+1],
        [4, 4+1, 4*2+1, 4*2+2]
    ], 
    [ // the t tetromino
        [1,4,4+1,4+2],
        [1,4+1,4+2,4*2+1],
        [4,4+1,4+2,4*2+1],
        [1,4,4+1,4*2+1]
    ], 
    [ // the o tetromino
        [0,1,4,4+1],
        [0,1,4,4+1],
        [0,1,4,4+1],
        [0,1,4,4+1]
    ], 
    [ // the i tetromino
        [1,4+1,4*2+1,4*3+1],
        [4,4+1,4+2,4+3],
        [1,4+1,4*2+1,4*3+1],
        [4,4+1,4+2,4+3]
    ] 
];

// gets random 1 of 4 rotation
function newRotation() {
    return Math.floor(Math.random() * 4);
}

// pushes randomize 7 tetromino to queue array as objects
function generateQueueIndex(queueArr) {
    let randomIndex = [];
    let origIndex = [0, 1, 2, 3, 4, 5, 6];

    while(origIndex.length !== 0) {
        let i = Math.floor(Math.random() * origIndex.length);
        randomIndex.push(origIndex[i]);
        origIndex.splice(i, 1);
    }
    
    randomIndex.forEach(i => queueArr.push(
        {
        'shape': i,
        'rotation': newRotation()
        }
    ))
}

function emitNotif(string, notifDOM, blurDOM ) {
    notifDOM.style.display = 'block';
    notifDOM.innerHTML = string;
    blurDOM.onclick = () => { notifDOM.style.display = 'none'; blurDOM.style.filter = ''; }
    blurDOM.style.filter = 'blur(2px)';
    
    let count = 2;
    let interval = setInterval(()=>{
        if(count === 0) {
            notifDOM.innerHTML = 'nothing.';
            notifDOM.style.display = 'none';
            blurDOM.style.filter = '';
            blurDOM.onclick = '';
            count = 2;
            clearInterval(interval);
            return
        }
        count--;
    }, 1000)
}

function setControlButton(buttons, move) {
    buttons.left.onclick = () => {  
        move('left') 
    }
    buttons.up.onclick = () => { 
        move('rotate') 
    }
    buttons.down.onclick = () => { 
        move('down') 
    }
    buttons.right.onclick = () => { 
        move('right') 
    }
    buttons.space.onclick = () => { 
        move('space') 
    }
}

function deployKeyListener(move) {
    // listens for full key press (key up)
document.addEventListener('keydown', (e) => {

    // switch statement for convinience
    switch(e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
            move('left');
            break;
        case 'arrowright':
        case 'd':
            move('right');
            break;
        case 'arrowdown':
        case 's':
            move('down');
            break;
        case 'arrowup':
        case 'w':
            move('rotate');
            break;
        case 'x':
            move('space');
    }
})
}

export { theTetrominoes, tetrominoesColors, theTetrominoesMini, stockGrid, deployKeyListener, setControlButton, emitNotif, generateQueueIndex }
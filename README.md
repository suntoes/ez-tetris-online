<img src="https://github.com/suntoes/ez-tetris-online/blob/master/utils/ez-tetris.jpg" alt="ez tetris logo" width="120"/>

# ez tetris

### [Click here for replit live](https://ez-tetris-online.suntoes.repl.co/)

<a href="https://ez-tetris-online.suntoes.repl.co/">
<img src="https://github.com/suntoes/ez-tetris-online/blob/master/utils/ez-tetris-gameplay.jpg" alt="gameplay" width="400"/>
</a>

## keybindings...
It's your typical <b><i>wasd</i></b> or <b>arrow keys</b> for movements. To drop the tetromino, simply press <b>x</b>.

## A simple fullstack web app, for practice...
This is a personal exercise of mine prior to the snake game i've made. 
The sole purpose of this project is to immerse and familiarize myself more into the basics of back-end techs which I've recently just learned. 
Feel free to checkout my code, and/or try out the demo!

## ez tetris' top 3 syntax are...
<details>
  <summary>Arrays</summary>
<br>

Here are 4 arrays inside an array of T tetromino, each defines a unique rotation but overall represents the T shaped tetromino. 
If we were to take the first out of four elements for example, and set the width as 4 that represents a 4x4 2d array table, the array would sum up to be <b>[ 1, 4, 5, 6 ]</b>.

```javascript
[ // the t tetromino at public/js/game-utils.js line#231
    [1,width,width+1,width+2],
    [1,width+1,width+2,width*2+1],
    [width,width+1,width+2,width*2+1],
    [1,width,width+1,width*2+1]
], 
```
<br>

Now put <b>[ 1, 4, 5, 6 ]</b> into an iterator that shades up the <b>nth</b> index of an 4x4 2d array DOM table that has a length of 16. 
Remember that array starts with an index value of 0. The result would go something like this:

<table>
  <tr>
    <td>&nbsp;&nbsp;</td>
    <td>O</td>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
  </tr>
  <tr>
    <td>O</td>
    <td>O</td>
    <td>O</td>
    <td>&nbsp;&nbsp;</td>
  </tr>
  <tr>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
  </tr>
  <tr>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
  </tr>
</table>
<br>

Now increment every value of <b>[ 1, 4, 5, 6 ]</b> which would be <b>[ 2, 5, 6, 7 ]</b>, to move it to the left.

<table>
  <tr>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
    <td>O</td>
    <td>&nbsp;&nbsp;</td>
  </tr>
  <tr>
    <td>&nbsp;&nbsp;</td>
    <td>O</td>
    <td>O</td>
    <td>O</td>
  </tr>
  <tr>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
  </tr>
  <tr>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
  </tr>
</table>
<br>

Then move <b>[ 2, 5, 6, 7 ]</b> down by adding width = 4 to each value which would be <b>[ 4, 9, 10, 11 ]</b>.

<table>
  <tr>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
  </tr>
  <tr>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
    <td>O</td>
    <td>&nbsp;&nbsp;</td>
  </tr>
  <tr>
    <td>&nbsp;&nbsp;</td>
    <td>O</td>
    <td>O</td>
    <td>O</td>
  </tr>
  <tr>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
    <td>&nbsp;&nbsp;</td>
  </tr>
</table>
<br>

Nevertheless, this is only the gist of array's magic. A lot of function, ifs, and modulus would be involved if we were to rotate, restrict the tetromino's movement to only the inside of the grid and/or make it still.

<hr>
</details>
<details>
  <summary>socket.emit() & socket.on() </summary>
<br>

socket.io's .emit() and .on() plays a rather important role for the client's side. It represents the channel that connecs the server to client and vice-versa.
Take this emit for example, a function that calls when someone loads up the game window, in other words a "join" for an online game.

```javascript
// the user variables from url query at public/js/game.js line#5
let { username, host } = Qs.parse(location.search, { 
    ignoreQueryPrefix: true
});
...

// takes up user variables, and send it to the server at public/js/game.js line#39
socket.emit('joinRoom', { username, host });
```

Now then, in my tetris game, a joinRoom emit to server would only mean 2 things, either join as the first player and be the host, or join as the second player and be the challenger.
It is evaluated in the server with the use of MongoDB database but that is reserved for another discussion.

Take this on for example, still on the client side, which receive <i>broadcast</i> emits from the server side that represents a "player join".

```javascript
// listens when a player join at public/js/game.js line#41
socket.on('userJoin', user => {
    playSolo = false;
    opponentJoined();  // updates DOM ui for 2 player
     
    // notifies a makeshift alert function to host if not playing/alive
    if(!player.alive) {
        emitNotif(`${user} joined.`, notif, container);
    }
})
```

<hr>
</details>
<details>
  <summary>DOM manipulation</summary>
<br>

DOM manipulations is still one of the core of my game, as either I still don't know any other render tech yet for javascript or simply because it is reliable.
One of which core DOM manipulations is the draw function:

```javascript
function draw() {
    // takes up current tetromino shape which is an array of index values at public/js/game.js line#309
    currentTetromino.forEach(index => {
        // cells as the array of DOM divs, gets manipulated on index + currentIndex (serve as the tetromino position in x-axis)
        cells[index + currentIndex].classList.add('blocks');
        cells[index + currentIndex].style.backgroundColor = tetrominoesColors[currentShape];
        }
    )
    // updates screen of player obj and send it to the server
    player.screen = grid.innerHTML;
    sendGameDataToServer();
}

// a complete opposite version of this exists that undos the DOM manipulation, which is the undraw() function at public/js/game.js line#319
```

<hr>
</details>

## What I've learned is...
Make the best out of every syntax just like the array here, which I didn't expected to be almost everything...

const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const bodyParser = require('body-parser')
const PORT = 3000 || process.env.PORT;
require('dotenv').config();

const {
    createUser, 
    createHost, 
    checkDuplicateUser, 
    checkHost, 
    cleanChallenger,
    deleteUser,
    deleteHost,
    findChallenger,
    generateSocketIdToUser,
    getUserThruSocket,
    joinHost,
    updateUserAsHost,
    updateHost
} = require('./utils/users');

// app.use((req, res, next) => {
//     let { method, path, ip } = req;
//     console.log( method + " " + path + " - " + ip );
//     next();
// });

app.get('/', (req, res) => {
    res.sendFile( __dirname + '/public/index.html');
})

app.get('/game', async function(req, res) {
    let { username, host } = req.query;
    const dupTest = await checkDuplicateUser(username);

    const hostTest = await checkHost(host);
    if(dupTest) {
        res.sendFile( __dirname + `/utils/re-user.html`);
        return
    } 
    
    if(!dupTest && !host) {
        createUser(username, username);
        createHost(username);
        res.sendFile( __dirname + `/public/game.html` );
        return
    }
    
    if(!dupTest && hostTest) {
        createUser(username, host);
        await joinHost(username, host);
        res.sendFile( __dirname + `/public/game.html` );
        return
    }
    
    if(!dupTest && !hostTest) {
        res.sendFile( __dirname + `/utils/re-host.html`);
    }
});

// realtime listen for user log in
io.on('connection', socket => {
    
    socket.on('joinRoom', ({username, host}) => {
        generateSocketIdToUser(username, socket.id);

        console.log(`${username} is joining ${host}...`);
        socket.join(host);

        socket.broadcast.to(host).emit('userJoin', username);

        socket.on('serverCall', (code) => {
            io.to(host).emit('gameCall', code);
        })

        socket.on('gameData', obj => {
            socket.broadcast.to(host).emit('gameOpponentData', obj);
        })
    })

    socket.on('refreshRoom', ({username, host}) => {
        console.log(username, ' will leave ',host)
        socket.leave(host);
    })

    // realtime listen for user disconnect
    socket.on('disconnect', async function() {
        const user = await getUserThruSocket(socket.id);

        if(user !== null) {
            console.log(user.username, ' disconnected');
            socket.broadcast.to(user.host).emit('userDisconnect', user.username);

            // update host/challenger
            if(user.username === user.host) {
                const toBeHost = await findChallenger(user.host)

                if(toBeHost) {
                    updateUserAsHost(toBeHost);
                    updateHost(user.host, toBeHost);
                    deleteUser(user.username);
                    return
                }

                deleteHost(user.username);
                deleteUser(user.username);
                return
            }

            cleanChallenger(user.host);
            deleteUser(user.username);
        }
    })
});

app.use(express.static( __dirname + '/public'));

app.use(bodyParser.urlencoded({extended: false}));

server.listen(PORT, () => console.log(`ez tetris server running on port ${PORT}`))
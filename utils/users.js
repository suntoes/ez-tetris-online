// MONGODB AND MONGOOSE STUFF

const mongoose = require('mongoose');
require('dotenv').config();
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const tetrisUserSchema = new Schema({
    username: String,
    socketid: String,
    host: String
})

const tetrisHostSchema = new Schema({
    host: String,
    challenger: String
})

const tetrisUser = mongoose.model('tetrisUser', tetrisUserSchema);
const tetrisHost = mongoose.model('tetrisHost', tetrisHostSchema);

function createUser(username, host) {
    let newUser = new tetrisUser({'username': username, 'host': host});
    newUser.save((e, d) => {
        if(e) console.error(e);
    })
    console.log(username, ' login!')
}

function deleteUser(username) {
    console.log(`${username}'s user data is deleted!`)
    tetrisUser.findOneAndRemove({'username': username}, (e, d) => {
        if(e) console.error(e);
    })
}

function deleteHost(host) {
    console.log(`${host}'s host match is deleted!`)
    tetrisHost.findOneAndRemove({'host': host}, (e, d) => {
        if(e) console.error(e);
    })
}

function createHost(username) {
    let newHost = new tetrisHost({host: username});
    newHost.save((e, d) => {
        if(e) console.error(e);
    })
}

function joinHost(username, host) {
    tetrisHost.findOneAndUpdate( {'host': host}, {challenger: username}, {new: true}, (err, d) => {
        if (err) return console.error(err);
      });
}

async function findChallenger(host) {
    let result = await tetrisHost.findOne({"host": host}).select('challenger').exec()
    return result.challenger
}

function updateUserAsHost(username) {
    tetrisUser.findOneAndUpdate( {'username': username}, {host: username}, {new: true}, (err, d) => {
        if (err) return console.error(err);
      });
}

function updateHost(host, username) {
    tetrisHost.findOneAndUpdate( {'host': host}, {'host': username, challenger: null}, {new: true}, (err, d) => {
        if (err) return console.error(err);
      });
}

function cleanChallenger(host) {
    tetrisHost.findOneAndUpdate( {'host': host}, {challenger: null}, {new: true}, (err, d) => {
        if (err) return console.error(err);
      });
}

async function checkDuplicateUser(username) {
    let result = await tetrisUser.findOne({"username": username}).exec()

    if(result) return true

    return false
}

async function checkHost(host) {
    let result = await tetrisHost.findOne({"host": host, "challenger": null}).exec()

    if(result) return true
    
    return false
}

// SOCKET STUFF

async function generateSocketIdToUser(username, socket) {
    tetrisUser.findOneAndUpdate( {'username': username}, {socketid: socket}, {new: true}, (err, d) => {
        if (err) return console.error(err);
      });
}

async function getUserThruSocket(socket) {
    let result = await tetrisUser.findOne({socketid: socket}).exec();
    return result
}

module.exports = {
    createUser,
    deleteUser,
    createHost,
    checkDuplicateUser,
    checkHost,
    joinHost,
    generateSocketIdToUser,
    getUserThruSocket,
    deleteHost,
    cleanChallenger,
    findChallenger,
    updateUserAsHost,
    updateHost
}
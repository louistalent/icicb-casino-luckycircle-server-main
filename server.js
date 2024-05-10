const axios = require("axios");
var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
var express = require("express");
require("dotenv").config();

var app = express();
var cors = require("cors");
const Console = require("console");
var server = require("http").createServer(app);
var io = require("socket.io")(server);

var gameSocket = null;
let sockets = [];
let users = [];

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));                      

app.use(express.static(__dirname + "/build"));

app.get('/*', function (req, res) {
	res.sendFile(__dirname + '/build/index.html', function (err) {
		if (err) {
			res.status(500).send(err)
		}
	})
})

// Start server
// server.listen(port);
server.listen(443, function () {
    console.log("listening on :443  --- server is running ...");
});

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRnd(min, max) {
    return Math.floor(((Math.random() * (max - min)) + min)*10)/10.0;
}
axios.defaults.headers.common["Authorization"] = process.env.SECRETCODE;

const PLAYING = 0;
const GAMEEND = 1;
let GameState = PLAYING;
let startTime;
let tileValue = []
let tilePosition = []
let bigWinPosition = []
let pressTilePosition = []
let pressTileValue = []
var tileNum = 78;

const intervalObj = setInterval(() => {
    setInitValue();
}, 304000)

function setInitValue(){
    startTime = Date.now();
    tileNum = 78
    pressTilePosition = []
    pressTileValue = []
    for(var i=0; i<195; i++){
        tileValue[i] = 0;
    }
    for(var i=0; i<95; i++){
        tilePosition[i] = 0;
    }
    for(var i=0; i<10; i++){
        bigWinPosition[i] = 0;
    }
    for(var i=0;i<95;){
        var rnd = getRandomInt(195);
        if(tilePosition.indexOf(rnd)==-1){
            tilePosition[i] = rnd;
            i++;
        }
    }
    for(var i=0; i<10;){
        var rnd = getRandomInt(95);
        if(bigWinPosition.indexOf(rnd) == -1){
            bigWinPosition[i] = rnd;
            i++;
        }
    }
    for(var i=0;i<10;i++){
        if(i==0)
            tileValue[bigWinPosition[i]] = 30.0;
        if(i==1)
            tileValue[bigWinPosition[i]] = 7.5;
        if(i==2)
            tileValue[bigWinPosition[i]] = 7.5;
        if(i==3)
            tileValue[bigWinPosition[i]] = 5.0;
        if(i==4)
            tileValue[bigWinPosition[i]] = 5.0;
        if(i==5)
            tileValue[bigWinPosition[i]] = 5.0;
        if(i==6)
            tileValue[bigWinPosition[i]] = 5.0;
        if(i==7)
            tileValue[bigWinPosition[i]] = 3.0;
        if(i==8)
            tileValue[bigWinPosition[i]] = 3.0;
        if(i==9)
            tileValue[bigWinPosition[i]] = 3.0;
    }

    for(var i=0;i<95;i++){
        if(tileValue[tilePosition[i]]==0){
            var rnd = getRnd(1.1,2);
            tileValue[tilePosition[i]] = rnd;
        }
    }

    console.log(tilePosition)
    console.log(bigWinPosition)    
    console.log(tileValue)
}

function setInit(){
    startTime = Date.now();
    tileNum = 78
    pressTilePosition = []
    pressTileValue = []
    for(var i=0; i<195; i++){
        tileValue.push(0);
    }
    for(var i=0;i<95;){
        var rnd = getRandomInt(195);
        if(tilePosition.indexOf(rnd)==-1){
            tilePosition.push(rnd);
            i++;
        }
    }
    for(var i=0; i<10;){
        var rnd = getRandomInt(95);
        if(bigWinPosition.indexOf(rnd) == -1){
            bigWinPosition.push(rnd);
            i++;
        }
    }
    for(var i=0;i<10;i++){
        if(i==0)
            tileValue[bigWinPosition[i]] = 30.0;
        if(i==1)
            tileValue[bigWinPosition[i]] = 7.5;
        if(i==2)
            tileValue[bigWinPosition[i]] = 7.5;
        if(i==3)
            tileValue[bigWinPosition[i]] = 5.0;
        if(i==4)
            tileValue[bigWinPosition[i]] = 5.0;
        if(i==5)
            tileValue[bigWinPosition[i]] = 5.0;
        if(i==6)
            tileValue[bigWinPosition[i]] = 5.0;
        if(i==7)
            tileValue[bigWinPosition[i]] = 3.0;
        if(i==8)
            tileValue[bigWinPosition[i]] = 3.0;
        if(i==9)
            tileValue[bigWinPosition[i]] = 3.0;
    }

    for(var i=0;i<95;i++){
        if(tileValue[tilePosition[i]]==0){
            var rnd = getRnd(1,2);
            tileValue[tilePosition[i]] = rnd;
        }
    }

    console.log(tilePosition)
    console.log(bigWinPosition)    
    console.log(tileValue)
}

// Implement socket functionality
gameSocket = io.on("connection", function (socket) {
    sockets.push(socket);
    console.log("socket connected: " + socket.id);

    socket.on("disconnect", function () {
        users = users.filter((user) => user.id != socket.id);
        sockets = sockets.filter((_socket) => _socket.id != socket.id);
        console.log(users);
        emitUserlist();
        console.log("socket disconnected: " + socket.id);    
    });

    socket.on("init tilestate", (req)=>{
        console.log(req)
        socket.emit("init tileposition", {
            pressTilePosition: pressTilePosition,
            pressTileValue: pressTileValue
        })
    });

    socket.on("enterroom", (data, callback) => {
        users[data.token] = {
            id: socket.id,
            name: data.name,
            amount: data.amount,
            betted: data.betted,
            token: data.token,
            payOut: 0,
            betAmount: 0
            }
    
        console.log(users);

        // emitUserlist();  

        callback({
            status: 1,
            message: socket.id,
            pressTilePosition: pressTilePosition,
            pressTileValue: pressTileValue,
            data: 0
        });
    });
    
    socket.on("state update", (req)=>{
        var leftTime;
        if(Date.now() - startTime > 0 && Date.now() - startTime <= 300000){
            GameState = PLAYING;
            leftTime = (300000 - (Date.now() - startTime));
        }
        if(Date.now() - startTime > 300000 && Date.now() - startTime <= 304000){
            GameState = GAMEEND;
            leftTime = (304000 - (Date.now() - startTime));
        }
        if(Date.now() - startTime > 304000){
            GameState = PLAYING;
            setInitValue();
        }
        if(GameState == PLAYING){
            socket.emit('update state', {
                gamestate: GameState,
                leftTime: leftTime,
                tileNum: tileNum
            });
        }
        if(GameState == GAMEEND){
            sockets.map((_socket) => {
                _socket.emit("update state", {
                    gamestate: GameState,
                    totalTileValue: tileValue
                });
            });
        }          
    });

    socket.on("tile click", async(req, callback)=>{
        var user  = users[req.token]
        var tileIndex = req.tileIndex;
        try{
            // try{
            //     await axios.post(process.env.PLATFORM_SERVER + "api/games/bet", {
            //         token: req.token,
            //         amount: req.betAmount
            // }); 
            // }catch{
            //     throw new Error("Bet Error")
            // }
            if(pressTilePosition.indexOf(tileIndex) == -1){
                pressTilePosition.push(tileIndex);
                pressTileValue.push(tileValue[tileIndex])           

                user.payOut = tileValue[tileIndex];
                user.betAmount = req.betAmount;
                user.name = req.username;
                user.amount = (req.amount - req.betAmount) + user.betAmount * user.payOut;

                // try{
                //     await axios.post(process.env.PLATFORM_SERVER + "api/games/winlose", {
                //         token: req.token,
                //         amount: user.betAmount * user.payOut,
                //         winState: true
                // });
                // }catch{
                //     throw new Error("Can't find server!")
                // }

                if(tileNum>0)
                    tileNum--;
                if(tileNum==0){
                    startTime = Date.now() - 300000;
                }
                callback({
                    tileValue: tileValue[tileIndex],
                    tileNum: tileNum,
                    amount: user.amount
                });           

                sockets.map((_socket) => {
                    _socket.emit("press tile", { tileIndex: tileIndex, tileValue: tileValue[tileIndex]});
                });
                emitAllUserlist(user);
            }
        }catch(err){
            console.log(err)
            socket.emit("error message", {"errMessage": err.message});
        }
    });

    socket.on("playerbet", (data, callback) => {
        console.log(data)
        users.map((user) => {
            if (user.id == socket.id) {
                user.amount = data.amount;
                user.token = data.token;
                // try {
                //       axios.post(process.env.PLATFORM_SERVER + "api/games/bet", {
                //         token: user.token,
                //         amount: user.amount
                //     });
                // } catch{
                //     throw new Error("Bet Error!");
                // }
            }
        });            

        emitAllUserlist();

        callback({
            status: 1,
            message: `You betted ${data.amount} successfully.`,
            data: data.amount
        });
    });
});

function emitUserlist() {
    sockets.map((_socket) => {
        let _users = users.filter((user) => user.id != _socket.id);
        _socket.emit("userslist", { users: _users });
    });
}

function emitAllUserlist(user) {
    sockets.map((_socket) => {
        _socket.emit("userslist", { users: user });
    });
}

setInit();
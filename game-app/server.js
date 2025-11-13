// Import and setup
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
// SOCKET.IO = REAL-TIME COMMUNICATION between CLIENTS AND SERVER


// App and server initialization
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static frontend files
app.use(express.static("public"));

// Track connected players
const globals = require("./globals.js");
const { glob } = require("fs");
const { currentListNumber } = require("./globals.js");
const { currentList } = require("./globals.js");
const players = new Map();
const playerPoints = new Map(); // key: playerName, value: score


// Player data class
//const PlayerData = require('./public/playerData.js');

// Directory class
const PlayerDirectory = require('./public/playerDirectory.js');
_Directory = new PlayerDirectory();

// Test the directory with players
// _Directory.newPlayer("Aidan");
// _Directory.newPlayer("Jake");
// _Directory.newPlayer("Todd");
// _Directory.newPlayer("Jake");
// _Directory.newPlayer("Frank");

// console.log(_Directory.getIdByName("Aidan"));
// console.log(_Directory.getIdByName("Jake"));
// console.log(_Directory.getIdByName("Todd"));

// console.log("Host:", _Directory.whoIsHost());
// _Directory.appointHostByName("Aidan");
// console.log("Host:", _Directory.whoIsHost());

// console.log(_Directory.getInfoByName("Aidan"));
// console.log(_Directory.getInfoByName("Jake"));
// console.log(_Directory.getInfoByName("Todd"));
// console.log(_Directory.printAll());
// console.log();
// _Directory.appointHostByName("Frank");
// console.log(_Directory.printAll());


// Round timer
let secondTimer = null;

io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);

    // player joined
    socket.on("joinGame", (name) => {
        socket.playerName = name; // store players name
        players.set(socket.id, name); // add player on join
        playerPoints.set(name, 0); // players start with 0 points
        
        // add new player to directory
        _Directory.newPlayer(name, socket.id);
        //console.log(`${name} joined`);
        console.log("Player joined:", _Directory.getInfoByName(name));

        // tell all players
        io.emit("playerCount", players.size); // Send updated count to all clients
        io.emit("playerList", Array.from(players.values())); // Send full list
    });

    // player leaves
    socket.on("disconnect", () => {
        players.delete(socket.id); // Remove player on disconnect
        //console.log("user disconnected:", socket.id);

        // set player to inactive in directory
        let leavingPlayer = _Directory.getPlayerBySocketId(socket.id);
        // if player even joined from this socket
        if (leavingPlayer) { 
            leavingPlayer.isActive = false;
            console.log("Player left:", _Directory.getInfoByName(leavingPlayer.name));
        }

        // tell all players
        io.emit("playerCount", players.size); // Send updated count to all clients
        io.emit("playerList", Array.from(players.values())); // Update list
        // add more here in the future for cleanups
    });

    // someone starts game
    socket.on("startGame", (name) => {
        // create host
        globals.hostName = name;
        console.log("Game started by", globals.hostName);

        // assign host in directory
        _Directory.appointHostBySocketId(socket.id);
        //print all test
        console.log(_Directory.printAll());

        // tell players
        io.emit("gameStarted", name);
    });

    // change the settings
    socket.on("inputSettings", (settings) => {
        console.log("Settings saved:", settings);

        // store these settings server-side if needed
        globals.maxRounds = settings.rounds;
        globals.timeLimit = settings.timeLimit;

        // broadcast updated settings to all clients
        io.emit("outputSettings", settings);
    });

    // next round
    socket.on("nextRound", () => {
        globals.currentRound++;
        // round 1, 2, 3, 4...

        // reset answers from previous round
        globals.roundAnswers.clear();

        // first round
        if (globals.currentRound === 1) {

            // shuffle list order
            globals.listOrder = require("./game").getRandomListOrder();
            console.log("List order:", globals.listOrder);
        }
        //show updated scores
        else {
            // console.log("Scores:");
            // for (const [player, score] of playerPoints.entries()) {
            //     console.log(`${player}: ${score}`);
            // }
        }


        // if we sill have more rounds to play
        if (globals.currentRound <= globals.maxRounds) {
            
            // note the round number
            console.log("\nStart round", globals.currentRound, "of", globals.maxRounds);

            // roll the die
            globals.currentLetter = require("./game").rollDie();
            console.log("Letter:", globals.currentLetter);

            // pick the list (using the shuffled number order)
            globals.currentListNumber = globals.listOrder[globals.currentRound-1];
            console.log("Using List ", globals.currentListNumber);
            
            // populate the actual list of categories (with math)
            const startIndex = (globals.currentListNumber-1) * globals.CATEGORIES_PER_LIST
            globals.currentCategories = require("./categories").originalCategories.slice(startIndex, startIndex+globals.CATEGORIES_PER_LIST);
            console.log("Categories:", globals.currentCategories);

            io.emit("playRound", {
                round:               globals.currentRound,
                maxRounds:           globals.maxRounds,
                letter:              globals.currentLetter,
                listNumber:          globals.currentListNumber,
                categories:          globals.currentCategories,
                timeLimit:           globals.timeLimit,
                CATEGORIES_PER_LIST: globals.CATEGORIES_PER_LIST 
            });

            // SERVER TIMER
            console.log("Begin timer");
            let timeLeft = globals.timeLimit;
            // let timeLeft = 5; // TEMPORARY SHORT TIMER
            if (secondTimer) clearTimeout(secondTimer); // Clear any previous timer

            secondTimer = setInterval(() => {
                io.emit("timerTick", timeLeft); // Send current time to all clients
                console.log(timeLeft);
                timeLeft--;

                // timer done
                if (timeLeft < 0) {
                    clearInterval(secondTimer);
                    io.emit("endRound", {  });
                    console.log("Round timer ended!");
                }
            }, 1000);

        }

        // all rounds done
        else {
            console.log("No more rounds. Game over!");
        }
    });

    // players submit their answers
    socket.on("submitAnswers", answers => {
        console.log(`Answers from ${socket.playerName} [${socket.id}] recieved`);

        // add answers to server-side answers map
        globals.roundAnswers.set(socket.playerName, answers);

        // recieved all players' answers
        if (globals.roundAnswers.size === players.size) {

            // reveal answer map
            console.log("\nAll answers are in");
            for (const [player, answers] of globals.roundAnswers.entries()) {
                console.log(`${player}:`, answers);
            }

            // give the players some "debrief time"
            setTimeout(() => {
                // reset category counter
                globals.categoryCounter = 0;
                console.log(`Category ${globals.categoryCounter}`)

                // send over ALL the answers (convert to Array)
                io.emit("beginVote", Array.from(globals.roundAnswers.entries()));

            }, 500); // 5 seconds of debrief time
            // temporary half sec, change back to 5000
        }
    });

    // player input/pushed "next category" button
    socket.on("inputNextCategory", data => {
        // increment category counter
        globals.categoryCounter ++;
        console.log(`Category ${globals.categoryCounter}`)
        io.emit("outputNextCategory");
    });


    // points have been added
    socket.on("addPoints", data => {
        const playerArray = data.playerArray;
        const pointArray = data.pointArray;
        for (let i = 0; i < playerArray.length; i++) {
            const player = playerArray[i];
            const points = pointArray[i];
            const current = playerPoints.get(player) || 0;
            playerPoints.set(player, current + points);
        }
        // Optionally emit updated scores to clients
        // io.emit("updateScores", Array.from(playerPoints.entries()));
    });

    // send all scores to all players
    socket.on("getScores", () => {

        
        let scores = [];
        console.log(`\nRound ${globals.currentRound} scores:`);

        for (const [player, score] of playerPoints.entries()) {
            console.log(`${player}: ${score}`);
            scores.push(score);
        }

        io.emit("broadcastScores", scores);
    });


});

server.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
});

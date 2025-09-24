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

// Round timer
let secondTimer = null;

io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);

    // player joined
    socket.on("joinGame", (name) => {
        socket.playerName = name; // store players name
        players.set(socket.id, name); // add player on join
        console.log(`${name} joined`);
        // socket.broadcast.emit("playerJoined", name); // not needed?
        io.emit("playerCount", players.size); // Send updated count to all clients
        io.emit("playerList", Array.from(players.values())); // Send full list
    });

    // NOT NEEDED
    // socket.on("sendAnswer", (answer) => {
    // console.log("Answer:", answer);
    // io.emit("answerReceived", { player: socket.playerName, answer });
    // });

    // player leaves
    socket.on("disconnect", () => {
        players.delete(socket.id); // Remove player on disconnect
        console.log("user disconnected:", socket.id);
        io.emit("playerCount", players.size); // Send updated count to all clients
        io.emit("playerList", Array.from(players.values())); // Update list
        // add more here in the future for cleanups
    });

    // someone starts game
    socket.on("startGame", (name) => {
        console.log("Game started by", name);
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

        // note the round number
        console.log("Start round", globals.currentRound, "of", globals.maxRounds);
        
        // if we sill have more rounds to play
        if (globals.currentRound <= globals.maxRounds) {

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
                    io.emit("endRound", { CATEGORIES_PER_LIST: globals.CATEGORIES_PER_LIST });
                    console.log("Round timer ended!");
                }
            }, 1000);

        }

        // all rounds done
        else {
            console.log("Game over!");
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
            console.log("All answers are in");
            for (const [player, answers] of globals.roundAnswers.entries()) {
                console.log(`${player}:`, answers);
            }

            // give the players some "debrief time"
            setTimeout(() => {
                
                // send over ALL the answers (convert to Array)
                io.emit("beginVote", Array.from(globals.roundAnswers.entries()));

            }, 5000); // 5 seconds of debrief time
        }
    });


});

server.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
});

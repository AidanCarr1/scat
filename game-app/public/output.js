// Handle server response/updates to user

// not needed:
// socket.on("playerJoined", (name) => {
//   document.getElementById("playerList").innerHTML = "";
//   for (const li of document.getElementById("playerList").children) {
//     document.getElementById("playerList").innerHTML += `<li>${name}</li>`;
//   }
// });

// the player list has been updated, update locally
socket.on("playerList", (names) => {
    const ul = document.getElementById("playerList");
    ul.innerHTML = "";
    window.playerNames = names; // Store globally
    for (const name of names) {
        ul.innerHTML += `<li>${name}</li>`;
    }
});

// the player count has been updated, update locally
socket.on("playerCount", (size) => {
    document.getElementById("playerCount").innerHTML = `Players: ${size}`;

    // all game start if 2+ players
    if (size >= 2) {
        document.getElementById("startBtn").disabled = false;
    } else {
        document.getElementById("startBtn").disabled = true;
    }
});

// a player started the game, begin
socket.on("gameStarted", (starterName) => {
    document.getElementById("lobby").style.display = "none";

    document.getElementById("settings").style.display = "block";
    document.getElementById("gameStarter").innerHTML = "Game started by " + starterName;
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("answerSection").style.display = "block";

    // can only EDIT settings if this client is the starter
    if (window.localName === starterName) {
        document.getElementById("setRounds").disabled = false;
        document.getElementById("setTimeLimit").disabled = false;
        document.getElementById("saveSettings").disabled = false;
        document.getElementById("startRound").disabled = false;
    } else {
        //document.getElementById("settings").style.display = "none";
    }
});


// a player updated settings
socket.on("outputSettings", (settings) => {
    document.getElementById("setRounds").value = settings.rounds;
    document.getElementById("setTimeLimit").value = settings.timeLimit;
});

// a new round is starting
socket.on("playRound", (data) => {

    // populate the data
    for (let i = 1; i <= data.CATEGORIES_PER_LIST; i++) {
        document.getElementById("cat"+i).innerHTML = data.categories[i-1];
        // delete previous answers
        document.getElementById("ans"+i).value = "";
    }
    document.getElementById("round").innerHTML = "Round " + data.round;
    document.getElementById("listNumber").innerHTML = "List " + data.listNumber;
    document.getElementById("letter").innerHTML = "Letter: " + data.letter;
    document.getElementById("timeDisplay").innerHTML = "0:"+data.timeLimit;

    // hide everything and reveal the notepad!
    document.getElementById("settings").style.display = "none";
    document.getElementById("vote").style.display = "none";
    //hide leaderboard
    document.getElementById("notePad").style.display = "block";
});

// server says rounds over
socket.on("endRound", (data) => {
    // hide the notepad
    document.getElementById("notePad").style.display = "none";

    // gather all answers
    answers = {};
    for (let i = 1; i <= data.CATEGORIES_PER_LIST; i++) {
        answers[i-1] = document.getElementById("ans"+i).value;
    }

    // send the answers to the server
    socket.emit("submitAnswers", answers);

    // TEMPORARY
    document.getElementById("vote").style.display = "block";
});


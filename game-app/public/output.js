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
socket.on("gameStarted", function(starterName) {
    document.getElementById("gameStarter").innerHTML = "Game started by " + starterName;
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("answerSection").style.display = "block";
});

// a player answered
// update this one
socket.on("answerReceived", (data) => {
    document.getElementById("log").innerHTML += `<li>${data.player}: ${data.answer}</li>`;
});

// Send user data to the server

// you joined the game, tell the server
function joinGame() {

    //check for an actual name:
    if (document.getElementById("name").value.trim() === "") {
        alert("Please enter a name.");
        return;
    }

    // tell server your name
    const name = document.getElementById("name").value;
    window.localName = name; // Store globally
    socket.emit("joinGame", name);

    // disable name input
    document.getElementById("nameSection").style.display = "none";

    // can only show start button once joined
    document.getElementById("startBtn").style.display = "inline";
}

// you started the game, tell the server
function startGame() {
    const name = document.getElementById("name").value;
    socket.emit("startGame", name);
}

// tell server settings numbers
function inputSettings() {
    const rounds = document.getElementById("setRounds").value;
    const timeLimit = document.getElementById("setTimeLimit").value;

    // emit settings
    socket.emit("inputSettings", { rounds, timeLimit });
}

function nextRound() {
    // update setting one last time
    inputSettings();
    socket.emit("nextRound");
}

// you sent an answer, tell the server
function sendAnswer() {
    const answer = document.getElementById("answer").value;
    socket.emit("sendAnswer", answer);
    document.getElementById("answer").value = "";
}
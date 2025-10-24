// Send user data to the server

// User can press enter after their name
var enterName = document.getElementById("name");
enterName.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("nameBtn").click();
  }
});

// you joined the game, tell the server
function joinGame() {

    const cleanName = document.getElementById("name").value.trim();

    // check for an actual name:
    if (cleanName === "") {
        alert("Please enter a name.");
        return;
    }

    // check for duplicates
    for (player of window.localState.playerNames) {
        if (cleanName === player) {
            alert("Name already in use.");
            return;
        }
    }

    // tell server your name
    //const name = document.getElementById("name").value;
    window.localState.name = cleanName; // Store globally
    socket.emit("joinGame", cleanName);

    // disable name input
    document.getElementById("nameSection").style.display = "none";

    // can only show start button once joined
    document.getElementById("startBtn").style.display = "inline";
}

// you started the game, tell the server
function startGame() {
    //const name = document.getElementById("name").value;
    socket.emit("startGame", window.localState.name);
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

    // hide leaderboard
    document.getElementById("leaderboard").display = "none";
}

function inputShowLeaderboard() {
    // document.getElementById("leaderboard").display = "block";
    socket.emit("getScores");
}

// you sent an answer, tell the server
// function sendAnswer() {
//     const answer = document.getElementById("answer").value;
//     socket.emit("sendAnswer", answer);
//     document.getElementById("answer").value = "";
// }

function inputNextCategory(){
    // POINT SYSTEM HERE
    let playerNum = 0;
    let pointArray = [];
    let playerArray = [];
    for (const [player] of window.localState.allAnswers) {

        // save long HTML button name
        button = `_player${playerNum}_cat${window.localState.categoryCounter}`;
        
        //check for a yes
        if (document.getElementById("yes"+button).checked) {
            //alert(player + " +1");
            pointArray[playerNum] = 1;
        }
        //check for extra point
        else if (document.getElementById("extra"+button).checked) {
            //alert(player + " +2");
            pointArray[playerNum] = 2;
        }
        //check for a no
        else if (document.getElementById("no"+button).checked) {
            //alert(player + " +0");
            pointArray[playerNum] = 0;
        }
        else {
            alert(player + " no selection");
            return;
        }
        playerArray[playerNum] = player;
        playerNum ++;
    }

    socket.emit("addPoints", {playerArray, pointArray});
    socket.emit("inputNextCategory");
}
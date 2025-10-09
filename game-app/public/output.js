
// the player list has been updated, update locally
socket.on("playerList", (names) => {
    const ul = document.getElementById("playerList");
    ul.innerHTML = "";
    window.localState.playerNames = names; // store locally
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
    //document.getElementById("answerSection").style.display = "block";

    // can only EDIT settings if this client is the starter
    //alert(window.localState.name + " =?" + starterName);
    if (window.localState.name === starterName) {
        document.getElementById("setRounds").disabled = false;
        document.getElementById("setTimeLimit").disabled = false;
        document.getElementById("saveSettings").disabled = false;
        document.getElementById("startRound").disabled = false;
    } else {
        //document.getElementById("settings").style.display = "none";
    }
});


// update the timer given seconds (0-120)
function updateTimer(secondsLeft) {
    
    // separate min and sec
    let minutes = Math.floor(secondsLeft/60);
    let seconds = secondsLeft - 60 * minutes;

    // add a zero
    if (seconds < 10) {
        document.getElementById("timeDisplay").innerText = `${minutes}:0${seconds}`;
    }
    // no zero needed
    else {
        document.getElementById("timeDisplay").innerText = `${minutes}:${seconds}`;
    }
}


// a player updated settings
socket.on("outputSettings", (settings) => {
    document.getElementById("setRounds").value = settings.rounds;
    window.localState.maxRounds = settings.rounds;

    document.getElementById("setTimeLimit").value = settings.timeLimit;
    window.localState.timeLimit = settings.timeLimit;
});


// a new round is starting
socket.on("playRound", (data) => {

    // populate the VISUAL data
    for (let i = 1; i <= data.CATEGORIES_PER_LIST; i++) {
        document.getElementById("cat"+i).innerHTML = data.categories[i-1];
        // delete previous answers
        document.getElementById("ans"+i).value = "";
    }
    document.getElementById("round").innerHTML = `Round ${data.round} of ${data.maxRounds}`;
    document.getElementById("listNumber").innerHTML = "List " + data.listNumber;
    document.getElementById("letter").innerHTML = "Letter: " + data.letter;
    updateTimer(data.timeLimit);

    // populate the LOCAL STATE data
    window.localState.categories = data.categories;
    window.localState.myAnswers = [];
    window.localState.round = data.round;
    window.localState.listNumber = data.listNumber;
    window.localState.letter = data.letter;

    // hide everything and reveal the notepad!
    document.getElementById("settings").style.display = "none";
    document.getElementById("timesUp").style.display = "none";
    document.getElementById("voteTemp").style.display = "none";
    document.getElementById("vote").style.display = "none";
    //document.getElementById("leaderboard").style.display = "none";

    document.getElementById("notePad").style.display = "block";
});


// server updates time
socket.on("timerTick", (secondsLeft) => {
    updateTimer(secondsLeft);
});


// server says rounds over
socket.on("endRound", () => {
    // hide the notepad
    document.getElementById("notePad").style.display = "none";

    // debrief screen
    document.getElementById("timesUp").style.display = "block";

    // gather all answers
    let answers = Array(window.localState.CATEGORIES_PER_LIST).fill("");
    for (let i = 1; i <= window.localState.CATEGORIES_PER_LIST; i++) {
        
        // get the answer boxes
        let answerElement = document.getElementById("ans"+i);
        let answer = ""; 
        
        // if something is actually written, store that
        if (answerElement && answerElement.value && answerElement.value.trim() !== "") {
            answer = answerElement.value.trim();
        }
        answers[i-1] = answer;
    }
    
    // store locally and print
    window.localState.myAnswers = answers;
    //document.getElementById("yourAnswers").innerText = answers.join(",");
    
    // send the answers to the server
    socket.emit("submitAnswers", answers);
});


// recieve all the answers
socket.on("beginVote", (entriesArray) => {

    // reset category counter
    window.localState.categoryCounter = -1; //0-11

    // reconstruct alll answers to a map
    const allAnswers = new Map(entriesArray);
    window.localState.allAnswers = allAnswers;

    // let voteHTML = "";

    // TEMPORARY show everyones answers
    // for (const [player, playerAnswers] of allAnswers.entries()) {
    //     voteHTML += `<h4>${player}</h4> <ul>`;
    //     let i = 0;
    //     for (const answer of playerAnswers) {
    //         voteHTML += "<li>";
    //         // say category
    //         voteHTML += `${window.localState.categories[i]}: `;
    //         i++;
    //         // say answer (if there is one)
    //         let displayAnswer = answer === "" ? "--" : answer;
    //         voteHTML += `${displayAnswer}</li>`;
    //     }
    //     voteHTML += "</ul>";
    // }    
    // document.getElementById("voteText").innerHTML = voteHTML;


    // show your own answers
    let myAnswersText = "";
    for (let i=0; i<window.localState.CATEGORIES_PER_LIST; i++) {
        myAnswersText += `<li>${window.localState.categories[i]}: ${window.localState.myAnswers[i]}</li>`;
    }    
    //myAnswersText += "</ul>";
    document.getElementById("myAnswers").innerHTML = myAnswersText;

    nextCategory();

    // switch buttons back (next cat, hide next round)
    document.getElementById("nextRoundBtn").style.display = "none";
    document.getElementById("nextCatBtn").style.display = "block";

    //show voting screen
    document.getElementById("timesUp").style.display = "none";
    //document.getElementById("voteTemp").style.display = "block";
    document.getElementById("vote").style.display = "block";

});

// server says "a player hit next category"
socket.on("outputNextCategory", data => {
    nextCategory();
});

function nextCategory() {
    window.localState.categoryCounter ++;

    // update category
    document.getElementById("category").innerText = window.localState.categories[window.localState.categoryCounter];
    
    // show user and their answer
    let answersHTML = "";
    for (const [player, answers] of window.localState.allAnswers) {
        answersHTML += `<li>${player}: ${answers[window.localState.categoryCounter]}</li>`;
        // add vote button here
    }
    document.getElementById("answers").innerHTML = answersHTML;


    // voting buttons (WHAT DO THOSE EVEN LOOK LIKE? HOW DO THOSE WORK?)
    // update a highlighted current cat in my answers

    // final cat? change next cat button to next round
    if (window.localState.categoryCounter >= window.localState.CATEGORIES_PER_LIST-1) {
        document.getElementById("nextRoundBtn").style.display = "block";
        document.getElementById("nextCatBtn").style.display = "none";
        // TO DO: maybe dont show NEXT ROUND but show DISPLAY LEADERBOARD
        // and then on leaderboard have the next round button
        // I think having a host will work best. then an ability to switch hosts if wanted.
        
    }
}

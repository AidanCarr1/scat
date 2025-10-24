// settings
maxRounds = 3;
timeLimit = 60;

// game actions
currentRound = 0;
listOrder = [];
currentLetter = '$';
currentListNumber = 0;
currentCategories = [];
CATEGORIES_PER_LIST = 12;
categoryCounter = 0;

// gameplay
roundAnswers = new Map();
//scores = new Map();

// players
hostName = "";




module.exports = {
    maxRounds,
    timeLimit,

    currentRound,
    listOrder,
    currentLetter,
    currentListNumber,
    currentCategories,
    CATEGORIES_PER_LIST,
    categoryCounter,

    roundAnswers,
    //scores,

    hostName
};

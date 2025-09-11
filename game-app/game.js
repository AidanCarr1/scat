function rollDie() {
    letters = "ABCDEFGHIJKLMNOPRSTW";
    number = Math.floor(Math.random() * 20);
    return letters[number];
}

function getRandomListOrder(number) {
    lists = [1,2,3,4,5,6,7,8,9,10,11,12];
    // randomize order
    for (var i = lists.length-1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        // swap
        [lists[i], lists[j]] = [lists[j], lists[i]];
    }
    return lists;
}

module.exports = {
    rollDie,
    getRandomListOrder
};


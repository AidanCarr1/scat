function rollDie() {
    letters = "ABCDEFGHIJKLMNOPRSTW";
    number = Math.floor(Math.random() * 20);
    return letters[number];
}

function getRandomListOrder(number) {
    lists = [1,2,3,4,5,6,7,8,9,10,11,12];
    //randomize order
    for (var i = lists.length-1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [lists[i], lists[j]] = [lists[j], lists[i]];
    }
    return lists;
}

module.exports = {
    rollDie,
    getRandomListOrder
};

// TEST

// for (var i = 0; i < 10; i++){
//     console.log(getRandomListOrder());
// }

// for (var i = 0; i < 10; i++){
//     console.log(rollDie()+" "+rollDie()+" "+rollDie()+" "+
//                 rollDie()+" "+rollDie()+" "+rollDie()+" "+
//                 rollDie()+" "+rollDie()+" "+rollDie()+" "+
//                 rollDie()+" "+rollDie()+" "+rollDie());
// }
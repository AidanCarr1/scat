function rollDie() {
    letters = "ABCDEFGHIJKLMNOPRSTW";
    number = Math.floor(Math.random() * 20);
    return letters[number];
}

// test roll a bunch
for (let i = 0; i < 10; i++){
    console.log(rollDie()+" "+rollDie()+" "+rollDie()+" "+
                rollDie()+" "+rollDie()+" "+rollDie()+" "+
                rollDie()+" "+rollDie()+" "+rollDie()+" "+
                rollDie()+" "+rollDie()+" "+rollDie());
}

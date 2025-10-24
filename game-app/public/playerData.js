// class that stores all player data locally

class PlayerData {
    constructor(id, name, answers = [], points = 0, isHost = false) {
        this.id = id;
        this.name = name;
        this.answers = answers; // Array of answers
        this.points = points;
        this.isHost = isHost;
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = PlayerData;
}

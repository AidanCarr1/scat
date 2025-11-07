// Class that stores player data

class PlayerData {
    constructor(id, name, 
                answers = [], 
                points = 0, 
                isHost = false, 
                isActive = true) {

        this.id = id;
        this.name = name;
        this.answers = answers; // Array of answers
        this.points = points;
        this.isHost = isHost;
        this.isActive = isActive;
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = PlayerData;
}

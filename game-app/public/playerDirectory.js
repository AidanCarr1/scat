// Class that stores all players


// Introduce Player Data class
let PlayerData;
if (typeof module !== "undefined" && module.exports) {
  // Node: require the shared class
  PlayerData = require("./playerData.js");
} else {
  // Browser: expect PlayerData to be global (loaded via <script>)
  PlayerData = window.PlayerData;
}


class PlayerDirectory {
    constructor() {
        this.players = new Array();
        this.count = 0; // index of new new player, count of total players 
    }

    newPlayer(name, /*socket?*/) {
        let newPlayerData = new PlayerData(this.count, name);
        this.players[this.count] = newPlayerData;
        this.count ++;
    }

    getIdByName(name) {
        for (let i=0; i<this.count; i++) {
            // if given name matches name found in player array, return id/index
            if (name === this.players[i].name) {
                return i;
            }
        }
    }

    nameIsUnique(name) {
        for (let i=0; i<this.count; i++) {
            // if given name matches another player's, return FALSE
            if (name === this.players[i].name) {
                return false;
            }
        }
        // passed thru it all, UNIQUE name
        return true;
    }
}


// Allow front end and backend to handle this class
if (typeof module !== "undefined" && module.exports) {
    // Node / CommonJS
    module.exports = PlayerDirectory;
} 
else if (typeof window !== "undefined") {
    // Browser global
    window.PlayerDirectory = PlayerDirectory;
}

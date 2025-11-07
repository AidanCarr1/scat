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
        this.host = null;
    }

    isIdActive(id) {
        // id is within range and active
        return (id >= 0 && id < this.count && this.players[id].isActive);
    }

    newPlayer(name, /*socket?*/) {
        // Is the name unique?
        if (! this.isNameUnique(name)) {
            return;
        }

        // Create player, store it in directory
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
        return -1;
    }

    getPlayerByName(name) {
        for (let i=0; i<this.count; i++) {
            // if given name matches name found in player array, return id/index
            if (name === this.players[i].name) {
                return this.players[i];
            }
        }
        return null;
    }

    isNameUnique(name) {
        for (let i=0; i<this.count; i++) {
            // if given name matches another player's, return FALSE
            if (name === this.players[i].name) {
                return false;
            }
        }
        // passed thru it all, UNIQUE name
        return true;
    }

    appointHostById(newHostId) {
        // Don't appoint someone inactive
        if (! this.isIdActive(newHostId)) {
            return;
        }

        // Strip title of previous host (if one exists)
        if (this.host) {
            this.host.isHost = false;
        }

        // Set new host
        this.host = this.players[newHostId];
        this.host.isHost = true;
        
    }

    appointHostByName(newHostName) {
        // Get id, appoint host
        this.appointHostById(this.getIdByName(newHostName));
    }

    whoIsHost() {
        if (this.host) {
            return (this.host.name);
        }
        return "none";
    }

    getInfoByName(name) {
        for (let i=0; i<this.count; i++) {
            // if given name matches name found in player array, return id/index
            if (name === this.players[i].name) {
                let player = this.players[i];
                return player.name +
                        ": #"+player.id +
                        ", answers{" + player.answers +"}, " +
                        player.points +" points, " +
                        (player.isHost?"host":"not host") +", "+
                        (player.isActive?"active":"not active");
            }
        }
        return "Player not found";
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

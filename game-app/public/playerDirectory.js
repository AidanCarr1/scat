
// Player Data class
class PlayerData {
    constructor(id, name, 
                socketid = 0,
                answers = [], 
                points = 0, 
                isHost = false, 
                isActive = true
                ) {

        this.id = id;
        this.name = name;
        this.socketid = socketid;
        this.answers = answers; // Array of answers
        this.points = points;
        this.isHost = isHost;
        this.isActive = isActive;
    }
}

// Player Directory: Class that stores all players

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

    newPlayer(name, socketid = 0) {
        // Is the name unique?
        if (! this.isNameUnique(name)) {
            console.log(`Player not created: repeat name '${name}'`);
            return false;
        }

        // Create player, store it in directory
        let newPlayerData = new PlayerData(this.count, name, socketid);
        this.players[this.count] = newPlayerData;
        this.count ++;

        //return player object
        return newPlayerData;
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
            // if given name matches name found in player array, return player
            if (name === this.players[i].name) {
                return this.players[i];
            }
        }
        return null;
    }

    getPlayerBySocketId(socketid) {
        for (let i=0; i<this.count; i++) {
            // if given socketid matches socketid found in player array, return player
            if (socketid === this.players[i].socketid) {
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

    appointHostBySocketId(socketId) {
        // Get id, appoint host
        this.appointHostById(this.getPlayerBySocketId(socketId).id);
    }

    whoIsHost() {
        if (this.host) {
            return (this.host.name);
        }
        return "none";
    }

    getInfoByName(name) {
        for (let i=0; i<this.count; i++) {
            // if given name matches name found in player array, return info based on id
            if (name === this.players[i].name) {
                return this.getInfoById(i);
                
            }
        }
        return "Player not found";
    }

    getInfoById(id) {
        // Set player and SPILL
        let player = this.players[id];
        return player.name +
                ": #"+player.id +
                " ("+player.socketid+") " +
                ", answers{" + player.answers +"}, " +
                player.points +" points, " +
                (player.isHost?"host":"not host") +", "+
                (player.isActive?"active":"not active");
    }

    printAll() {
        let str = "";
        for (let i=0; i<this.count; i++) {
            str += this.getInfoById(i) + "\n";
        }
        return str;
        // BOOK MARK
    }

}


// Allow front end and backend to handle this class
// Node / CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = PlayerDirectory;
} 
// Browser
else if (typeof window !== "undefined") {
  window.PlayerDirectory = PlayerDirectory;
}

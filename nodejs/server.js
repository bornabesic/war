var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http, {
  path: "/war-server"
});

// if (process.argv.length < 3) {
//   console.log("No listening port defined.");
//   process.exit();
// }

// Game state

var worldSize = {
  width: 1280,
  height: 720
}

var maxHealth = 100;

var players = {};
var blueCount = 0;
var redCount = 0;
var bulletId = 0;

function pickTeam() {
  var team = "red";
  if (blueCount < redCount) {
    team = "blue";
    blueCount++;
  }
  else redCount++;
  return team;
}

function randomPoint() {
  return {
    x: Math.round(Math.random() * worldSize.width),
    y: Math.round(Math.random() * worldSize.height)
  }
}

function addPlayer(name) {
  var obj = {
    name: name,
    score: 0,
    health: maxHealth,
    team: pickTeam(),
    position: randomPoint()
  };

  // Save player's state here on server
  players[name] = obj;

  return obj;
}

function removePlayer(player) {
  if (!player) return;

  if (player.team == "red") redCount--;
  else if (player.team == "blue") blueCount--;

  delete players[player.name];
}

var maxDamage = 5;
function hitDamage() {
  return Math.ceil(Math.random() * maxDamage);
}

function hit (playerName) {
  players[playerName].health = Math.max(players[playerName].health - hitDamage(), 0);
  return players[playerName].health;
}

// Multiplayer

// var PORT = process.argv[2];
var PORT = 1337;

// Periodically request positions from all players
var positionCorrectionInterval = 5000; // 5 s
setInterval(() => {
  io.emit("POSITION_REQUEST", {});
}, positionCorrectionInterval);

io.on("connection", function(socket) {

  // The player joins the game
  socket.on("NEW", name => {
    console.log(name + " connected.");

    var obj = addPlayer(name);
   
    // Inform the player about his score, team and spawn point
    socket.emit("WHOAMI", obj);

    // Let others know that the player has joined
    socket.broadcast.emit("JOINS", obj);

    // Request positions from others now!!!
    socket.broadcast.emit("POSITION_REQUEST", {});

    // Let the player know about the others
    for (var playerName in players) {
      if (playerName != name)
        socket.emit("JOINS", players[playerName]);
    }

  });

  // The player reports in which direction he is looking
  socket.on("LOOK", obj => {
    socket.broadcast.emit("LOOK", obj); // Just forward to others
  });

  // The player reports in which direction he is moving
  socket.on("MOVE", obj => {
    socket.broadcast.emit("MOVE", obj); // Just forward to others
  });

  // The player reports his position (eventually, not constantly)
  socket.on("POSITION", obj => {
    var player = players[obj.name];
    if (!player) return;

    player.position = obj.position;
    socket.broadcast.emit("POSITION", obj); // Forward it to all other players
  });

  // Someone fires the bullet
  socket.on("BULLET", obj => {
    // console.log("Bullet from " + obj.owner);
    socket.broadcast.emit("BULLET", obj); // Forward it to all other players
  });

  // Bullet hits someone
  socket.on("HIT", obj => {
    var alreadyDead = players[obj.victim].health == 0;
    if (alreadyDead) return;

    var newHealth = hit(obj.victim);
    if (newHealth == 0) {
      io.emit("DEAD", {
        name: obj.victim
      });
    }
    else {
      io.emit("HEALTH", {
        name: obj.victim,
        health: newHealth
      });
    }
    
  });

  // The player reports that he will respawn
  socket.on("RESPAWN", obj => {
    players[obj.name].health = maxHealth;

    // Send info about new spawn point
    io.emit("RESPAWN", {
      name: obj.name,
      health: maxHealth,
      position: randomPoint()
    })
  });

  // Some player reports that he has spawned
  socket.on("SPAWN", () => {
    // Request positions from others now!!!
    socket.broadcast.emit("POSITION_REQUEST", {});
  });

  // The player is leaving the game
  socket.on("LEAVING", obj => {
    removePlayer(players[obj.name]);
    
    console.log(obj.name + " disconnected.");

    // Tell others he is leaving
    socket.broadcast.emit("LEAVING", obj);
  });

});

http.listen(PORT, function(){
  console.log("Server listening on port " + PORT + ".");
});
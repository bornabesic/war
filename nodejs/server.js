var app = require("express")();
var http = require("http").Server(app);

var jwt = require("jsonwebtoken");
var ioJWT = require("socketio-jwt");
var io = require("socket.io")(http, {
  path: "/war-server"
});

// if (process.argv.length < 3) {
//   console.log("No listening port defined.");
//   process.exit();
// }

// Authorization

var secret = "what is it good for";
var userID = 1;

app.get("/jwt", (request, response) => {

  var token = jwt.sign({
    id: userID++
  }, secret);

  response.json({
      token: token
  })
});

io.use(ioJWT.authorize({
    secret: secret,
    handshake: true
}));

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

function addPlayer(id, name) {
  var obj = {
    id: id,
    name: name,
    score: 0,
    health: maxHealth,
    team: pickTeam(),
    position: randomPoint()
  };

  // Save player's state here on server
  players[id] = obj;

  return obj;
}

function removePlayer(id) {
  var player = players[id];
  if (!player) return;

  if (player.team == "red") redCount--;
  else if (player.team == "blue") blueCount--;

  delete players[id];
}

var maxDamage = 5;
function hitDamage() {
  return Math.ceil(Math.random() * maxDamage);
}

function hit (id) {
  players[id].health = Math.max(players[id].health - hitDamage(), 0);
  return players[id].health;
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
    var id  = socket.decoded_token.id;
    console.log(name + "(" + id + ")" + " connected.");

    var obj = addPlayer(id, name);
   
    // Inform the player about his score, team and spawn point
    socket.emit("WHOAMI", obj);

    // Let others know that the player has joined
    socket.broadcast.emit("JOINS", obj);

    // Let the player know about the others
    for (var otherId in players) {
      if (otherId != id)
        socket.emit("JOINS", players[otherId]);
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
    var player = players[obj.id];
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
    if (!players[obj.victimId]) return;

    var alreadyDead = players[obj.victimId].health == 0;
    if (alreadyDead) return;

    var newHealth = hit(obj.victimId);
    if (newHealth == 0) {
      io.emit("DEAD", {
        id: obj.victimId
      });
    }
    else {
      io.emit("HEALTH", {
        id: obj.victimId,
        health: newHealth
      });
    }
    
  });

  // The player reports that he will respawn
  socket.on("RESPAWN", obj => {
    players[obj.id].health = maxHealth;

    // Send info about new spawn point
    io.emit("RESPAWN", {
      id: obj.id,
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

  socket.on("disconnect", () => {
    var id = socket.decoded_token.id;
    if (!players[id]) return;

    console.log(players[id].name + "(" + id + ")" + " disconnected.");

    removePlayer(id);
    // Tell others the player is leaving
    socket.broadcast.emit("LEAVING", {
      id: id
    });
  });

});

http.listen(PORT, function(){
  console.log("Server listening on port " + PORT + ".");
});
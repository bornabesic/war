define(["socket", "world", "classes", "text", "graphics"], function(io, world, classes, text, graphics) {

    var mainURL = "http://" + window.location.hostname;

    // Utils
    function get(url) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, false); // false for synchronous request
        xmlHttp.send(null);
        return xmlHttp.responseText;
    }

    // Authorization
    function getJWT() {
        return get(mainURL + "/jwt");
    }

    var tokenJSON = getJWT();
    if (!tokenJSON) {
        console.log("JWT not available!");
        return;
    }

    //  node.js server
    var socket = io(mainURL, {
        path: "/war-server",
        query: "token=" + JSON.parse(tokenJSON).token
    });

    // Functions

    function joinGame(name) {
        // Send name to the server (i.e. ready to start playing)
        socket.emit("NEW", name);
    }

    // ONs

    // My score, position and team
    socket.on("WHOAMI", obj => {
        world.me = new classes.Soldier(obj.id, obj.name, obj.team == "blue" ? text.teamBlueStyle : text.teamRedStyle, socket);
        world.me.setPosition(obj.position.x, obj.position.y);
        world.me.addToStage(graphics.app);

        // Report that player has spawned
        socket.emit("SPAWN");
    });

    // Server requests my position
    socket.on("POSITION_REQUEST", obj => {
        if (!world.me.id) return;

        socket.emit("POSITION", {
            id: world.me.id,
            position: world.me.getPosition()
        });
    });

    // Someone reports their position
    socket.on("POSITION", obj => {
        if (!world.others[obj.id]) return;

        world.others[obj.id].setPosition(obj.position.x, obj.position.y);
    });

     // Other player joins the game
    socket.on("JOINS", obj => { 
        var other = new classes.Soldier(obj.id, obj.name, obj.team == "blue" ? text.teamBlueStyle : text.teamRedStyle, null);
        other.setPosition(obj.position.x, obj.position.y);
        other.addToStage(graphics.app);

        world.others[obj.id] = other;
    });

    // Other player reports his looking direction
    socket.on("LOOK", obj => {
        if (obj.direction == "LEFT") world.others[obj.id].lookLeft();
        else if (obj.direction == "RIGHT") world.others[obj.id].lookRight();
        else if (obj.direction == "UP") world.others[obj.id].lookUp();
        else if (obj.direction == "DOWN") world.others[obj.id].lookDown();
    });

    // Other player reports his moving direction
    socket.on("MOVE", obj => {
        if (obj.direction == "LEFT") world.others[obj.id].moveLeft();
        else if (obj.direction == "RIGHT") world.others[obj.id].moveRight();
        else if (obj.direction == "UP") world.others[obj.id].moveUp();
        else if (obj.direction == "DOWN") world.others[obj.id].moveDown();
        else if (obj.direction == "LEFT_STOP") world.others[obj.id].stopLeft();
        else if (obj.direction == "RIGHT_STOP") world.others[obj.id].stopRight();
        else if (obj.direction == "UP_STOP") world.others[obj.id].stopUp();
        else if (obj.direction == "DOWN_STOP") world.others[obj.id].stopDown();
    });

    // Someone fires the bullet
    socket.on("BULLET", obj => {
        var bullet = world.others[obj.ownerId].shoot(obj.click.x, obj.click.y);
        bullet.addToStage(graphics.app);
        world.bullets.push(bullet);
    });

    // Report health for some player
    socket.on("HEALTH", obj => {
        if (obj.id == world.me.id) world.me.setHealth(obj.health);
        else world.others[obj.id].setHealth(obj.health);
    });

    // Somebody died
    socket.on("DEAD", obj => {
        if (obj.id == world.me.id) {
            world.me.hide();
            alert("You died! Click OK to respawn.");
            // Report a respawn
            socket.emit("RESPAWN", {
                id: world.me.id
            });
        }
        else world.others[obj.id].hide();
    });

    // Info about some player's new spawn point
    socket.on("RESPAWN", obj => {
        if (obj.id == world.me.id) {
            world.me.setPosition(obj.position.x, obj.position.y);
            world.me.setHealth(obj.health);
            world.me.show();
        }
        else {
            world.others[obj.id].setPosition(obj.position.x, obj.position.y);
            world.others[obj.id].setHealth(obj.health);
            world.others[obj.id].show();
        }    
        
        // Report that player has spawned
        socket.emit("SPAWN");
    });

    // Some other player is leaving the game
    socket.on("LEAVING", obj => {
        world.others[obj.id].destroy();
        delete world.others[obj.id];
    });

    return {
        joinGame: joinGame
    }

});
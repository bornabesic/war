define(["socket", "world", "classes", "text", "graphics"], function(io, world, classes, text, graphics) {

    //  node.js server
    var socket = io("http://" + window.location.hostname, {
        path: "/war-server"
    });

    // Functions

    function joinGame(name) {
        // Send name to the server (i.e. ready to start playing)
        socket.emit("NEW", name);
    }

    // ONs

    // My score, position and team
    socket.on("WHOAMI", obj => {
        world.me = new classes.Soldier(graphics.resources, world.playerName, obj.team == "blue" ? text.teamBlueStyle : text.teamRedStyle, socket);
        world.me.setPosition(obj.position.x, obj.position.y);
        world.me.addToStage(graphics.app);
    });

    // Server requests my position
    socket.on("POSITION_REQUEST", obj => {
        if (world.playerName == null || !world.me) return;

        socket.emit("POSITION", {
            name: world.playerName,
            position: world.me.getPosition()
        });
    });

    // Someone reports their position
    socket.on("POSITION", obj => {
        if (!world.others[obj.name]) return;

        world.others[obj.name].setPosition(obj.position.x, obj.position.y);
    });

     // Other player joins the game
    socket.on("JOINS", obj => { 
        var other = new classes.Soldier(graphics.resources, obj.name, obj.team == "blue" ? text.teamBlueStyle : text.teamRedStyle, null);
        other.setPosition(obj.position.x, obj.position.y);
        other.addToStage(graphics.app);

        world.others[obj.name] = other;

        // console.log(startObj.name, "joined");
    });

    // Other player reports his looking direction
    socket.on("LOOK", obj => {
        if (obj.direction == "LEFT") world.others[obj.name].lookLeft();
        else if (obj.direction == "RIGHT") world.others[obj.name].lookRight();
        else if (obj.direction == "UP") world.others[obj.name].lookUp();
        else if (obj.direction == "DOWN") world.others[obj.name].lookDown();
    });

    // Other player reports his moving direction
    socket.on("MOVE", obj => {
        if (obj.direction == "LEFT") world.others[obj.name].moveLeft();
        else if (obj.direction == "RIGHT") world.others[obj.name].moveRight();
        else if (obj.direction == "UP") world.others[obj.name].moveUp();
        else if (obj.direction == "DOWN") world.others[obj.name].moveDown();
        else if (obj.direction == "LEFT_STOP") world.others[obj.name].stopLeft();
        else if (obj.direction == "RIGHT_STOP") world.others[obj.name].stopRight();
        else if (obj.direction == "UP_STOP") world.others[obj.name].stopUp();
        else if (obj.direction == "DOWN_STOP") world.others[obj.name].stopDown();
    });

    // Someone fires the bullet
    socket.on("BULLET", obj => {
        var bullet = world.others[obj.owner].shoot(obj.click.x, obj.click.y);
        bullet.addToStage(graphics.app);
        world.bullets.push(bullet);
    });

    // Report health for some player
    socket.on("HEALTH", obj => {
        if (obj.name == world.playerName) world.me.setHealth(obj.health);
        else world.others[obj.name].setHealth(obj.health);
    });

    // Somebody died
    socket.on("DEAD", obj => {
        if (obj.name == world.playerName) {
            world.me.hide();
            alert("You died! Click OK to respawn.");
            // Report a respawn
            socket.emit("RESPAWN", {
                name: world.playerName
            });
        }
        else world.others[obj.name].hide();
    });

    // Info about some player's new spawn point
    socket.on("RESPAWN", obj => {
        if (obj.name == world.playerName) {
            world.me.setPosition(obj.position.x, obj.position.y);
            world.me.setHealth(obj.health);
            world.me.show();
        }
        else {
            world.others[obj.name].setPosition(obj.position.x, obj.position.y);
            world.others[obj.name].setHealth(obj.health);
            world.others[obj.name].show();
        }    
        
        // Report that player has spawned
        socket.emit("SPAWN");
    });

    // Some other player is leaving the game
    socket.on("LEAVING", obj => {
        world.others[obj.name].destroy();
        delete world.others[obj.name];
    });

    // I am leaving the game
    window.onbeforeunload = () => {
        socket.emit("LEAVING", {
            name: world.playerName
        });
    }

    return {
        joinGame: joinGame
    }

});
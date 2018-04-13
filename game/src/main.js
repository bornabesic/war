requirejs.config({
    baseUrl: "src",
    paths: {
        // Game
        classes: "classes",
        world: "world",
        mp: "multiplayer",
        graphics: "graphics",
        physics: "physics",
        mouse: "mouse",
        keyboard: "keyboard",
        text: "text",
        colors: "colors",
        constants: "constants",
        // Libraries
        pixi: [
            // "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.7.3/pixi.min",
            "lib/pixi.min"
        ],
        socket: [
            // "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.0/socket.io.slim",
            "lib/socket.io.slim"
        ]
    }
});

requirejs([
    "world",
    "mp",
    "physics",
    "graphics",
    "mouse",
    "keyboard"
], function(world, mp, physics, graphics, mouse, keyboard){
    
    // Ask player for a name
    while(true) {
        world.playerName = window.prompt("Your nickname:", "");
        if (world.playerName == null || world.playerName == "") continue;
        else break;
    };

    // Load assets
    graphics.loader.load(setup);

    // Setup after loader has finished loading the assets
    function setup(loader, resources) {
        graphics.resources = resources;

        // Join the game
        mp.joinGame(world.playerName);

        // Start render loop
        graphics.app.ticker.add(delta => update(delta));
    }
    
    // Render loop
    function update(delta) {

        // Update FPS counter every second
        graphics.updateFPS();

        // Get a list of all players
        var allPlayers = Object.values(world.others);
        allPlayers.push(world.me);

        // Update players
        allPlayers.forEach(player => {
            player.update(delta);
        });

        // Update bullets
        world.bullets = world.bullets.filter(bullet => {
            // Check if a bullet is outside of the world
            if (physics.bulletOutside(bullet)) {
                    bullet.destroy();
                    return false;
            }

            // Check if a bullet is hitting a player
            for (var i = 0; i < allPlayers.length; i++) {
                var player = allPlayers[i];
                if (physics.bulletHits(bullet, player)) {
                    player.hit();
                    bullet.destroy();
                    return false;
                }
            }
            bullet.update(delta);
            return true;
        });
    }

});

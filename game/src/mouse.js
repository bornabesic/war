define(["graphics", "world"], function(graphics, world) {
    
    // Mouse callbacks
    graphics.app.stage
    .on("mousemove", (e) => {
        var mousePos = e.data.global;
        var playerPos = world.me.getPosition();
        var dx = Math.abs(mousePos.x - playerPos.x);
        var dy = Math.abs(mousePos.y - playerPos.y);
        if (dx > dy) {
            if (mousePos.x > playerPos.x) world.me.lookRight();
            else if (mousePos.x < playerPos.x) world.me.lookLeft();
        }
        else if (dx < dy) {
            if (mousePos.y > playerPos.y) world.me.lookDown();
            else if (mousePos.y < playerPos.y) world.me.lookUp();
        }
    })
    .on("click", (e) => {
        var bullet = world.me.shoot(e.data.global.x, e.data.global.y);
        bullet.addToStage(graphics.app);
        world.bullets.push(bullet);
    });

});
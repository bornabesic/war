define(["world"], function(world){

    /*
        Helper function from
        https://github.com/kittykatattack/learningPixi#keyboard
    */
    function keyboard(keyCode) {
        let key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        
        // Key down
        key.downHandler = event => {
            if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            }
            event.preventDefault();
        };
    
        // Key up
        key.upHandler = event => {
            if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            }
            event.preventDefault();
        };
    
        //Attach event listeners
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
    
        return key;
    }

    // Key events

    var left = keyboard(65), // A
        up = keyboard(87), // W
        right = keyboard(68), // D
        down = keyboard(83), // S
        space = keyboard(32); // Spacebar

    // LEFT
    left.press = () => {
        world.me.moveLeft();
    };

    left.release = () => {
        if (!right.isDown) {
            world.me.stopLeft();
        }
    };

    // RIGHT
    right.press = () => {
        world.me.moveRight();
    };

    right.release = () => {
        if (!left.isDown) {
            world.me.stopRight();
        }
    };

    // DOWN
    down.press = () => {
        world.me.moveDown();
    };

    down.release = () => {
        if (!up.isDown) {
            world.me.stopDown();
        }
    };

    // UP
    up.press = () => {
        world.me.moveUp();
    };

    up.release = () => {
        if (!down.isDown) {
            world.me.stopUp();
        }
    };

});



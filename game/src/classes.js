define(["colors", "constants"], function(colors, constants){

    class Entity {
        constructor(texture) {
            this.sprite =  new PIXI.Sprite(texture);
            this.sprite.interactive = true;
            this.sprite.anchor.set(0.5);
        }
    
        setPosition(x, y) {
            this.sprite.x = x;
            this.sprite.y = y;
        }

        getPosition() {
            return {
                x: this.sprite.x,
                y: this.sprite.y
            }
        }
    
        addToStage(app) {
            app.stage.addChild(this.sprite);
        }
    
        scale(x, y) {
            this.sprite.scale.set(x, y);
        }
    
        on(event, f){
            this.sprite.on(event, f);
        }
    
        update(delta) { }
    }

    class Bullet {
        constructor(startX, startY, endX, endY, socket, ownerName){

            this.socket = socket;
            this.owner = ownerName;

            this.startX = startX;
            this.startY = startY;

            var dx = endX - startX;
            var dy = endY - startY;

            var len = Math.sqrt(dx ** 2 + dy ** 2);

            this.velocityX = dx / len * constants.bullet.speed;
            this.velocityY = dy / len * constants.bullet.speed;

            var width = dx / len * constants.bullet.size;
            var height = dy / len * constants.bullet.size;

            this.bullet = new PIXI.Graphics();
            this.bullet.x = startX;
            this.bullet.y = startY;
            this.bullet.lineStyle(constants.bullet.thickness, colors.grey);
            this.bullet.moveTo(0, 0);
            this.bullet.lineTo(width, height);

            if (this.socket != null)
                this.socket.emit("BULLET", {
                    owner: this.owner,
                    click: {
                        x: endX,
                        y: endY
                    }
                });
        }

        update(delta) {
            this.bullet.x += this.velocityX * delta;
            this.bullet.y += this.velocityY * delta;
            // console.log(this.bullet.x, this.bullet.y);
        }

        getPosition() {
            return {
                x: this.bullet.x,
                y: this.bullet.y
            }
        }

        getSize() {
            return {
                width: this.bullet.width,
                height: this.bullet.height,
            }
        }

        addToStage(app) {
            app.stage.addChild(this.bullet);
        }

        destroy() {
            this.bullet.destroy();
        }
    }
    
    class Soldier extends Entity {
    
        constructor(resources, name, nameStyle, socket) {
            super(resources.soldierIdleSideways.texture);

            // Default values
            this.velocityX = 0;
            this.velocityY = 0;
            this.health = 100;
            this.speed = 1;

            this.socket = socket;
    
            this.states = {
                "idleUp": new PIXI.extras.AnimatedSprite([
                    resources.soldierIdleUp.texture
                ]),
                "idleDown": new PIXI.extras.AnimatedSprite([
                    resources.soldierIdleDown.texture
                ]),
                "idleSideways": new PIXI.extras.AnimatedSprite([
                    resources.soldierIdleSideways.texture
                ]),
                "shooting": new PIXI.extras.AnimatedSprite([
                    resources.soldierShooting1.texture,
                    resources.soldierShooting2.texture,
                ])
            };
    
            // Name display
            this.name = name;
            this.nameDisplay = new PIXI.Text(name, nameStyle);
            this.nameDisplay.anchor.set(0.5);
            this.nameDisplay.y = constants.nameDisplay.offsetY;

            // Health bar

            this.healthBar = new PIXI.Container();

            // Create the black background rectangle
            var innerBar = new PIXI.Graphics();
            innerBar.beginFill(colors.black);
            innerBar.drawRect(-constants.healthBar.width/2, -constants.healthBar.height/2, constants.healthBar.width, constants.healthBar.height);
            innerBar.endFill();
            this.healthBar.addChild(innerBar);
            this.healthBar.y = constants.healthBar.offsetY;
        
            this.updateHealthBar();
                
            // Assemble everything to be shown
            this.container = new PIXI.Container();
            this.container.addChild(this.sprite);
            this.container.addChild(this.nameDisplay);
            this.container.addChild(this.healthBar);
    
            this.lookRight();
          }

        hit() {
            if (this.socket != null)
                this.socket.emit("HIT", {
                    victim: this.name
                });
        }

        shoot(x, y) {
            var pos = this.getPosition();
            return new Bullet(pos.x, pos.y, x, y, this.socket, this.name);
        }

        setHealth(health) {
            this.health = health;
            this.updateHealthBar();
        }

        updateHealthBar() {
            if (this.outerBar) this.outerBar.destroy();

            var width = Math.round((this.health / 100) * constants.healthBar.width);

            var color;
            if (this.health > 65) color = colors.green;
            else if (this.health > 35) color = colors.yellow;
            else color = colors.red;

            this.outerBar = new PIXI.Graphics();
            this.outerBar.beginFill(color);
            this.outerBar.drawRect(-constants.healthBar.width/2, -constants.healthBar.height/2, width, constants.healthBar.height);
            this.outerBar.endFill();
            this.healthBar.addChild(this.outerBar);
        }

        hide() {
            this.container.visible = false;
        }

        show() {
            this.container.visible = true;
        }

        // LEFT
        lookLeft() {
            this.setState("idleSideways");
            this.scale(-1, 1);

            if (this.socket != null)
                this.socket.emit("LOOK", {
                    name: this.name,
                    direction: "LEFT"
                });
        }

        moveLeft() {
            this.velocityX = -this.speed;

            if (this.socket != null)
                this.socket.emit("MOVE", {
                    name: this.name,
                    direction: "LEFT"
                });
        }

        stopLeft() {
            this.velocityX = 0;

            if (this.socket != null)
                this.socket.emit("MOVE", {
                    name: this.name,
                    direction: "LEFT_STOP"
                });
        }

        // RIGHT
        lookRight() {
            this.setState("idleSideways");
            this.scale(1, 1);

            if (this.socket != null)
                this.socket.emit("LOOK", {
                    name: this.name,
                    direction: "RIGHT"
                });
        }

        moveRight() {
            // this.lookRight();
            this.velocityX = this.speed;

            if (this.socket != null)
                this.socket.emit("MOVE", {
                    name: this.name,
                    direction: "RIGHT"
                });
        }

        stopRight() {
            this.velocityX = 0;

            if (this.socket != null)
                this.socket.emit("MOVE", {
                    name: this.name,
                    direction: "RIGHT_STOP"
                });
        }

        // UP
        lookUp() {
            this.setState("idleUp");

            if (this.socket != null)
                this.socket.emit("LOOK", {
                    name: this.name,
                    direction: "UP"
                });
        }

        moveUp() {
            // this.lookUp();
            this.velocityY = -this.speed;

            if (this.socket != null)
                this.socket.emit("MOVE", {
                    name: this.name,
                    direction: "UP"
                });
        }

        stopUp() {
            this.velocityY = 0;

            if (this.socket != null)
                this.socket.emit("MOVE", {
                    name: this.name,
                    direction: "UP_STOP"
                });
        }

        // DOWN
        lookDown() {
            this.setState("idleDown");

            if (this.socket != null)
                this.socket.emit("LOOK", {
                    name: this.name,
                    direction: "DOWN"
                });
        }

        moveDown() {
            // this.lookDown();
            this.velocityY = this.speed;

            if (this.socket != null)
                this.socket.emit("MOVE", {
                    name: this.name,
                    direction: "DOWN"
                });
        }

        stopDown() {
            this.velocityY = 0;

            if (this.socket != null)
                this.socket.emit("MOVE", {
                    name: this.name,
                    direction: "DOWN_STOP"
                });
        }

        isMoving() {
            return this.velocityX != 0 || this.velocityY != 0;
        }
    
        setState(state) {
            this.container.removeChild(this.sprite);
            this.sprite = this.states[state];
            this.sprite.interactive = true;
            this.sprite.anchor.set(0.5);
            this.sprite.animationSpeed = 0.1;
            this.sprite.play();
            this.container.addChild(this.sprite);
        }
    
        setPosition(x, y) {
            this.container.x = x;
            this.container.y = y;
        }

        getPosition() {
            return {
                x: this.container.x,
                y: this.container.y
            }
        }

        getSize() {
            return {
                width: this.sprite.width,
                height: this.sprite.height
            }
        }

        destroy() {
            this.container.destroy();
        }
    
        addToStage(app) {
            app.stage.addChild(this.container);
        }
    
    
        update(delta) {
            super.update(delta);
            this.container.x += this.velocityX * delta;
            this.container.y += this.velocityY * delta;
        }
    
    }

    return {
        Entity: Entity,
        Soldier: Soldier
    }
    
});


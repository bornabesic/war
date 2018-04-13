define(["pixi", "constants", "colors"], function(PIXI, constants, colors) {

    var resources = null;

    // pixi.js initialization
    var app = new PIXI.Application({
        transparent: false,
        backgroundColor: colors.brown,
        width: constants.world.width,
        height: constants.world.height
    });

    // Add author info to the left upper corner
    var info = new PIXI.Text(
        constants.gameInfo.name + "\n" +
        constants.gameInfo.version + "\n" +
        constants.gameInfo.copyright,
        new PIXI.TextStyle({fontSize: 14, fill: "white"})
    );

    app.stage.addChild(info);

    // FPS counter
    var fpsCount = new PIXI.Text("0", new PIXI.TextStyle({fontSize: 14, fill: "white"}));
    fpsCount.y = info.height;

    app.stage.addChild(fpsCount);

    var fpsTime = 0;
    function updateFPS() {
        if (fpsTime > 1000) fpsTime = 0;

        if (fpsTime == 0) {
            var integral = Math.floor(app.ticker.FPS);
            fpsCount.text = "FPS: " + integral.toString();
        }

        fpsTime += app.ticker.elapsedMS;
    }

    // Add hit area for mouse events
    app.stage.interactive = true;
    app.stage.hitArea = new PIXI.Rectangle(0, 0, app.renderer.width, app.renderer.height);

    // Asset loading
    var loader = PIXI.loaders.shared
            .add("soldierIdleUp", "assets/soldier/idle/up.png")
            .add("soldierIdleDown", "assets/soldier/idle/down.png")
            .add("soldierIdleSideways", "assets/soldier/idle/sideways.png")
            .add("soldierShooting1", "assets/soldier/shooting/01.png")
            .add("soldierShooting2", "assets/soldier/shooting/02.png")
            .on("progress" /*, progressCallback*/)

    // function progressCallback(loader, resource) {
    //     console.log("[" + loader.progress + "] Loading: " + resource.url); 
    // }
    
    document.body.appendChild(app.view);

    return {
        app: app,
        loader: loader,
        resources: resources,
        updateFPS: updateFPS
    }

});
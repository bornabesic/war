define(function(){

    return {
        gameInfo: {
            name: "WAR",
            copyright: "© 2018. Borna Bešić",
            version: "v0.0.1"
        },
        world : {
            width: 1280,
            height: 720
        },
        nameDisplay: {
            offsetY: -30
        },
        healthBar: {
            width: 32,
            height: 4,
            offsetY: 30
        },
        bullet: {
            size: 10,
            thickness: 3,
            speed: 20,
        }
    };

});
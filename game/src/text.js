define(["pixi", "colors"], function(PIXI, colors){

    var soldierNameStyle = {
        fontFamily: "sans-serif",
        fontSize: 14,
        fill: "white",
        strokeThickness: 1
    };
    
    var teamBlueStyle = soldierNameStyle;
    teamBlueStyle.stroke = colors.blue;
    teamBlueStyle = new PIXI.TextStyle(teamBlueStyle);
    
    var teamRedStyle = soldierNameStyle;
    teamRedStyle.stroke = colors.red;
    teamRedStyle = new PIXI.TextStyle(teamRedStyle);

    return {
        teamRedStyle: teamRedStyle,
        teamBlueStyle: teamBlueStyle
    }

});




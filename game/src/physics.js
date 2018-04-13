define(["constants"], function(constants){

    function checkCollision(obj1, obj2) {

        var overlapX = obj1.x < obj2.x && obj1.x + obj1.width > obj2.x
                    || obj1.x < obj2.x + obj2.width && obj1.x + obj1.width > obj2.x + obj2.width
        
        var insideX = obj1.x > obj2.x && obj1.x + obj1.width < obj2.x + obj2.width;

        var overlapY = obj1.y < obj2.y && obj1.y + obj1.height > obj2.y
                    || obj1.y < obj2.y + obj2.height && obj1.y + obj1.height > obj2.y + obj2.height
        
        var insideY = obj1.y > obj2.y && obj1.y + obj1.height < obj2.y + obj2.height;

        return overlapX && overlapY ||
               overlapX && insideY ||
               overlapY && insideX ||
               insideX && insideY;
    }

    function bulletHits(bullet, soldier) {
        if (bullet.owner.id == soldier.id) return false;
        else return checkCollision(bullet.bullet, soldier.container);
    }

    function bulletOutside(bullet) {
        var pos = bullet.getPosition();
        var size = bullet.getSize();
        return pos.x >= constants.world.width ||
               pos.x + size.width < 0 ||
               pos.y >= constants.world.height ||
               pos.y + size.height < 0;
    }

    return {
        bulletHits: bulletHits,
        bulletOutside: bulletOutside
    }

});
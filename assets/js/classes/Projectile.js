var projectileTypes = {
    "single": {
        color: "pink",
        speed: 10,
        dimensions: { width: 10, height: 25 },
    },
    "circle": {
        color: "lightblue",
        speed: 5,
        dimensions: { width: 10, height: 10 }
    }
};

class Projectile {
    constructor(type) {
        this.type = type;
        this.speed = projectileTypes[type].speed;
    }

    spawn(x, y, to = { x: player.x + player.width, y: player.y + player.height / 2 }) {
        this.x = x;
        this.y = y;
        this.width = projectileTypes[this.type].dimensions.width;
        this.height = projectileTypes[this.type].dimensions.height;
        this.to = to;
        var delta = Math.sqrt(Math.pow(Math.abs(this.x - this.to.x), 2) + Math.pow(Math.abs(this.y - this.to.y), 2));
        this.xChange = (this.to.x - this.x) / (delta / this.speed);
        this.yChange = (this.to.y - this.y) / (delta / this.speed);
        this.projectile = Crafty.e("2D, Canvas, Color, projectile, " + this.type).attr({ x: x, y: y, w: this.width, h: this.height });
        this.projectile.bind("UpdateFrame", () => this.update());
        this.projectile.rotation = ((Math.atan2(this.to.y - this.projectile.y, this.to.x - this.projectile.x) * (180 / Math.PI)) + 90);
        this.projectile.z = 2;
    }

    update() {
        if (player.bombExploding) {
            var collectible = new Collectible("bombClearPoints");
            collectible.spawn(this.projectile.x, this.projectile.y);
            this.projectile.destroy();
        }
        this.projectile.x += this.xChange;
        this.x = this.projectile.x;
        this.projectile.y += this.yChange;
        this.y = this.projectile.y;
        if (this.y + this.height >= screenRes.height || this.y < 0 || this.x + this.width < 0 || this.x > screenRes.width) this.projectile.destroy();
    }
}
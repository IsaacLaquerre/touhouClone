class Projectile {
    constructor() {
        this.speed = 10;
    }

    spawn(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 25;
        this.to = { x: player.x + player.width, y: player.y + player.height / 2 };
        var delta = Math.sqrt(Math.pow(Math.abs(this.x - this.to.x), 2) + Math.pow(Math.abs(this.y - this.to.y), 2));
        this.xChange = (this.to.x - this.x) / (delta / this.speed);
        this.yChange = (this.to.y - this.y) / (delta / this.speed);
        this.projectile = Crafty.e("2D, Canvas, Color, projectile").attr({ x: x, y: y, w: this.width, h: this.height }).color("pink");
        this.projectile.bind("UpdateFrame", () => this.update());
        this.projectile.rotation = ((Math.atan2(this.to.y - this.projectile.y, this.to.x - this.projectile.x) * (180 / Math.PI)) + 90);
    }

    update() {
        this.projectile.x += this.xChange;
        this.x = this.projectile.x;
        this.projectile.y += this.yChange;
        this.y = this.projectile.y;
        if (this.y >= screenRes.height) this.projectile.destroy();
    }
}
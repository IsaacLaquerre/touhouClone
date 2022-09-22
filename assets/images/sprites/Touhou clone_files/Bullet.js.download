class Bullet {
    constructor(damage) {
        this.damage = damage;
        this.speed = 10;
    }

    spawn(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 25;
        this.bullet = Crafty.e("2D, Canvas, Color, bullet").attr({ x: x, y: y, w: this.width, h: this.height }).color("yellow");
        this.bullet.bind("UpdateFrame", () => this.update());
    }

    update() {
        this.y -= this.speed;
        this.bullet.y -= this.speed;
        if (this.y < screenRes.height * -1) this.bullet.destroy();
    }
}
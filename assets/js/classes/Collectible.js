var colors = {
    "power": "#8b0000",
    "points": "#00008b"
};

class Collectible {
    constructor(type) {
        this.type = type;
        this.color = colors[this.type];
    }


    spawn(x, y) {
        this.width = 25;
        this.height = 25;
        this.collectible = Crafty.e("2D, Canvas, Color, collectible, " + this.type).attr({ x: x, y: y, w: this.width, h: this.height }).color(this.color);
        this.collectible.bind("UpdateFrame", () => this.update());
    }

    update() {
        this.collectible.y += 1;
        if (this.y < screenRes.height * -1) this.collectible.destroy();
    }
}
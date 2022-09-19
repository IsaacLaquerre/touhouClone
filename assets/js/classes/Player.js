class Player {
    constructor(power, lives, bombs) {
        this.power = power;
        this.lives = lives;
        this.bombs = bombs;

        this.speed = 400;

        this.width = 16;
        this.height = 16;

        this.x = screenRes.width / 2 - 25;
        this.y = screenRes.height - 100;

        this.shooting = false;
        this.focus = false;
    }

    spawn() {
        this.hitbox = Crafty.e("2D, Canvas, Collision, Color, Keyboard, Multiway, player")
            .attr({ x: this.x, y: this.y, w: this.width, h: this.height, health: 1 })
            .color("blue")
            .multiway(this.speed, { UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180, W: -90, S: 90, D: 0, A: 180 })
            .bind("Move", () => {
                this.x = this.hitbox._x;
                this.y = this.hitbox._y;
                if (this.hitbox._x < 0) this.hitbox._x = 0;
                if (this.hitbox._x + this.width > screenRes.width) this.hitbox._x = screenRes.width - this.width;
                if (this.hitbox._y < 0) this.hitbox._y = 0;
                if (this.hitbox._y + this.height > screenRes.height) this.hitbox._y = screenRes.height - this.height;
            });

        this.hitbox.bind("UpdateFrame", () => {
            this.hitbox.color("blue");
        });

        this.hitbox.onHit("projectile", () => this.checkCollision());
        this.hitbox.onHit("minion", () => this.checkCollision());
        this.hitbox.onHit("collectible", hitEvent => this.buff(hitEvent));
    }

    checkCollision() {
        this.hitbox.color("green");
    }

    buff(e) {
        if (e[0].obj.__c.power) {
            this.power += 2;
        } else if (e[0].obj.__c.points) {
            score += Math.floor(Math.random() * 6) * 1000 + 40000;
            refreshScore();
        }
    }

    shoot() {
        if (this.shooting) return;
        this.shooting = true;
        var bullet = new Bullet(this.power);
        bullet.spawn(this.hitbox.x + this.width / 4, this.hitbox.y - this.height);
        var shoot = setInterval(() => {
            if (!this.shooting) return clearInterval(shoot);
            if (!paused) {
                var bullet = new Bullet(this.power);
                bullet.spawn(this.hitbox.x + this.width / 4, this.hitbox.y - this.height);
            }
        }, 100);
    }

    bomb() {

    }
}
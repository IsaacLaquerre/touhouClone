var deathSound = new Audio("assets/audio/sfx/death.mp3");
var bombSound = new Audio("assets/audio/sfx/bomb.wav");
var itemPickupSound = new Audio("assets/audio/sfx/itemPickup.wav");
var shootingSound = new Audio("assets/audio/sfx/shoot.wav");
deathSound.load();
bombSound.load();
itemPickupSound.load();
shootingSound.load();

class Player {
    constructor(power, lives, bombs, difficulty) {
        this.power = power;
        this.lives = lives;
        this.bombs = bombs;
        this.difficulty = difficulty;

        this.speed = 400;

        this.width = 16;
        this.height = 16;

        this.x = screenRes.width / 2 - 25;
        this.y = screenRes.height - 100;

        this.shooting = false;
        this.focus = false;
        this.invincible = true;

        this.animationQueue = [];
        this.lastAnim = null;
        this.moving = false;
    }

    spawn() {
        this.sprite = Crafty.e("2D, Canvas, Collision, SpriteAnimation, Keyboard, Multiway, idle1")
            .attr({ x: this.x - 20, y: this.y - 36, w: 56, h: 72 })
            .multiway(this.speed, { UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180, W: -90, S: 90, D: 0, A: 180 })
            .reel("flying", 500, ["idle1", "idle2", "idle3", "idle4"])
            .reel("turning", 300, ["turning1", "turning2", "turning3", "turning4"])
            .reel("turnedStrafing", 400, ["turned1", "turned2", "turned3"])
            .reel("unturning", 300, ["turning4", "turning3", "turning2"])
            .animate("flying", -1).bind("NewDirection", dir => {
                if (dir.x === -1) {
                    this.sprite.unflip("X");
                    this.animationQueue.shift();
                    this.animationQueue.push(["turning", 1]);
                    this.animationQueue.push(["turnedStrafing", 1]);
                    this.animate();
                } else if (dir.x === 1) {
                    this.sprite.flip("X");
                    this.animationQueue.shift();
                    this.animationQueue.push(["turning", 1]);
                    this.animationQueue.push(["turnedStrafing", 1]);
                    this.animate();
                }
            }).bind("Move", oldPos => {
                if (oldPos._x > this.sprite._x) {
                    this.moving = true;
                    this.sprite.unflip("X");
                    this.animationQueue.shift();
                    this.animationQueue.push(["unturning", 1]);
                    this.animate();
                } else if (oldPos._x < this.sprite._x) {
                    this.moving = true;
                    this.sprite.flip("X");
                    this.animationQueue.shift();
                    this.animationQueue.push(["unturning", 1]);
                    this.animate();
                }
            }).bind("AnimationEnd", () => this.animate());
        this.hitbox = Crafty.e("2D, Canvas, Collision, Color, Keyboard, Multiway, player")
            .attr({ x: this.x, y: this.y, w: this.width, h: this.height, health: 1 })
            .multiway(this.speed, { UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180, W: -90, S: 90, D: 0, A: 180 })
            .bind("Move", () => {
                this.x = this.hitbox._x;
                this.y = this.hitbox._y;
                this.sprite._x = this.x - 20;
                this.sprite._y = this.y - 36;
                if (this.hitbox._x < 13) {
                    this.hitbox._x = 14;
                    this.sprite._x = -6;
                }
                if (this.hitbox._x + this.width > screenRes.width - 13) {
                    this.hitbox._x = screenRes.width - this.width - 14;
                    this.sprite._x = screenRes.width - 50;
                }
                if (this.hitbox._y < 32) {
                    this.hitbox._y = 28;
                    this.sprite._y = -6;
                }
                if (this.hitbox._y + this.height > screenRes.height - 20) {
                    this.hitbox._y = screenRes.height - this.height - 16;
                    this.sprite._y = screenRes.height - 66;
                }
            });

        this.sprite.z = 1;

        this.hitbox.onHit("projectile", () => this.death());
        this.hitbox.onHit("minion", () => this.death());
        this.sprite.onHit("collectible", hitEvent => this.buff(hitEvent));
    }

    animate() {
        //console.log(this.lastAnim);
        this.sprite.pauseAnimation();
        this.sprite.resetAnimation();
        if (this.animationQueue.length > 0) {
            this.lastAnim = this.animationQueue[0][0];
            if (this.animationQueue[0][1] === -1) {
                this.sprite.animate(this.animationQueue[0][0], 1);
            } else {
                this.sprite.animate(this.animationQueue[0][0], this.animationQueue[0][1]);
                this.animationQueue.shift();
            }
        } else {
            if (this.lastAnim === "turning") this.sprite.animate("turnedStrafing", 1);
            else this.sprite.animate("flying", 1);
        }
    }

    death() {
        if (this.invincible) return;
        this.lives--;
        lives = this.lives;
        refreshLives();
        this.invincible = true;
        this.dead = true;
        this.sprite.visible = false;
        deathSound.volume = 0.15;
        deathSound.play();
        setTimeout(() => {
            this.sprite.visible = true;
            this.dead = false;
            this.hitbox._x = screenRes.width / 2 - 25;
            this.x = this.hitbox._x;
            this.hitbox._y = screenRes.height - 100;
            this.y = this.hitbox._y;
            var blinkIndex = 0;
            var blinking = setInterval(() => {
                if (blinkIndex >= 8) {
                    this.invincible = false;
                    return clearInterval(blinking);
                }
                this.sprite.visible = false;
                setTimeout(() => {
                    this.sprite.visible = true;
                }, 125);
                blinkIndex++;
            }, 250);
        }, 1500);
    }

    buff(e) {
        if (this.dead) return;
        for (var i = 0; i < e.length; i++) {
            e[i].obj.destroy();
        }
        if (e[0].obj.__c.smallPower) {
            if (this.power < 128) {
                this.power += 1;
                refreshPower();
            } else {
                score += Math.floor(Math.random() * 6) * 1000 + 10000;
                refreshScore();
            }
        } else if (e[0].obj.__c.points) {
            score += Math.floor(Math.random() * 6) * 1000 + 40000;
            refreshScore();
        } else if (e[0].obj.__c.bombClearPoints) {
            itemPickupSound.load();
            itemPickupSound.volume = 0.15;
            itemPickupSound.play();
            score += Math.floor(Math.random() * 3) * 1000 + 500;
            refreshScore();
        }
    }

    shoot() {
        if (this.shooting) return;
        this.shooting = true;
        var bullet = new Bullet(this.power);
        bullet.spawn(this.hitbox.x + this.width / 4, this.hitbox.y - this.height - 40);
        var shoot = setInterval(() => {
            if (!this.shooting) return clearInterval(shoot);
            if (!paused && !this.dead) {
                shootingSound.load();
                shootingSound.volume = 0.025;
                shootingSound.play();
                var bullet = new Bullet(this.power);
                bullet.spawn(this.hitbox.x + this.width / 4, this.hitbox.y - this.height - 40);
            }
        }, 100);
    }

    bomb() {
        if (this.dead) return;
        bombSound.volume = 0.25;
        bombSound.play();
        this.bombs--;
        bombs = this.bombs;
        this.bombExploding = true;
        refreshBombs();
        setTimeout(() => {
            this.bombExploding = false;
        }, 4500);
    }
}
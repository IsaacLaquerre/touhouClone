var radPerDeg = Math.PI / 180;

class Minion {
    spawn(x, y, group) {
        this.x = x;
        this.y = y;
        this.group = group;
        this.width = 32;
        this.height = 32;
        this.minion = Crafty.e("2D, Canvas, Collision, Color, minion").attr({ x: x, y: y, w: this.width, h: this.height }).color("red");
        this.minion.onHit("bullet", () => this.checkCollision());
        this.move();

        this.shootLoop = setInterval(() => {
            this.shoot();
        }, 1000);

        this.movementPatterns = [
            [
                { type: "line", from: { x: 50, y: -50 }, to: { x: 190, y: 120 } },
                { type: "arc", center: { x: 100, y: 125 }, radius: 90, length: 150 },
                { type: "line", from: { x: 22, y: 170 }, to: { x: -50, y: 65 } },
                { type: "destroy" }
            ],
            [
                { type: "line", from: { x: 490, y: -50 }, to: { x: 372, y: 170 } },
                { type: "arc", center: { x: 450, y: 125 }, radius: 90, length: 150 },
                { type: "line", from: { x: 540, y: 125 }, to: { x: 640, y: 65 } },
                { type: "destroy" }
            ]
        ];

        this.movementPattern = this.movementPatterns[this.group - 1];
    }

    move() {
        var movementIndex = 0;
        var moving = setInterval(() => {
                if (!paused) {
                    if (movementIndex >= this.movementPattern.length) return clearInterval(moving);
                    if (this.movementPattern[movementIndex].type === "line") {
                        var points = getLinePoints(this.movementPattern[movementIndex].from.x, this.movementPattern[movementIndex].from.y, this.movementPattern[movementIndex].to.x, this.movementPattern[movementIndex].to.y, 0.1);
                        this.movementPattern.shift();
                        points = points.reverse();
                        for (i in points) {
                            this.movementPattern.unshift(points[i]);
                        }
                    } else if (this.movementPattern[movementIndex].type === "arc") {
                        var points = getArcPoints(this.movementPattern[movementIndex].center.x, this.movementPattern[movementIndex].center.y, this.movementPattern[movementIndex].radius, this.movementPattern[movementIndex].length);
                        this.movementPattern.shift();
                        if (this.group === 1) points = points.reverse();
                        for (i in points) {
                            this.movementPattern.unshift(points[i]);
                        }
                    } else if (this.movementPattern[movementIndex].type === "destroy") {
                        this.movementPattern.shift();
                        this.minion.destroy();
                        clearInterval(this.shootLoop);
                        return clearInterval(moving);
                    } else {
                        this.minion.x = this.movementPattern[movementIndex].x;
                        this.minion.y = this.movementPattern[movementIndex].y;
                        this.movementPattern.shift();
                    }
                }
            },
            10);
    }

    shoot() {
        if (!paused) {
            var projectile = new Projectile();
            projectile.spawn(this.minion.x + this.width / 2 - 4, this.minion.y + this.height - 5);
        }
    }

    checkCollision() {
        var drop = Math.floor(Math.random() * 10);
        if ([1, 4].includes(drop)) {
            this.drop("power", this.minion.x, this.minion.y);
        } else if ([3, 5].includes(drop)) {
            this.drop("points", this.minion.x, this.minion.y);
        }
        score += Math.floor(Math.random() * 10);
        refreshScore();
        this.minion.destroy();
        clearInterval(this.shootLoop);
    }

    drop(type, x, y) {
        var collectible = new Collectible(type);
        collectible.spawn(x, y);
    }
}

function getLinePoints(x1, y1, x2, y2, dist) {
    var points = [];
    for (var i = 0; Crafty.math.lerp(x1, x2, i * dist).toFixed(1) != x2 && Crafty.math.lerp(y1, y2, i * dist).toFixed(1) != y2; i += dist) {
        points.push({ x: parseFloat(Crafty.math.lerp(x1, x2, i * dist).toFixed(1)), y: parseFloat(Crafty.math.lerp(y1, y2, i * dist).toFixed(1)) });
    }
    return points;
}

function getArcPoints(centerX, centerY, radius, length) {
    var points = [];
    for (var i = 0; i <= length; i += 0.5) {
        points.push({ x: centerX + (radius * Math.cos(i * radPerDeg)), y: centerY + (radius * Math.sin(i * radPerDeg)) });
    }
    return points;
}
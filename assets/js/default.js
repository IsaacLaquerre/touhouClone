var started = false;
var paused = false;

var highScore = 0;
var score = 0;
var power = 0;
var lives = 5;
var bombs = 4;

var screenRes = {
    width: document.querySelector("#cr-stage").clientWidth,
    height: document.querySelector("#cr-stage").clientHeight
};

var music = new Audio("assets/audio/music/U.N. Owen was her.mp3");

const player = new Player(power, lives, bombs);

var baseSpeed = 400;
var focusSpeed = 200;

var binds = {
    "Enter": {
        name: "Confirm",
        pressed: false,
        exec: () => {
            if (!started) start();
        }
    },
    "z": {
        name: "Shoot",
        pressed: false,
        exec: () => {
            player.shoot();
        }
    },
    "x": {
        name: "Use bomb",
        pressed: false,
        exec: () => {
            player.bomb();
        }
    },
    "Shift": {
        name: "Focus",
        pressed: false,
        exec: () => {
            player.focus = true;
            player.speed = focusSpeed;
            player.hitbox.speed(focusSpeed);
        }
    },
    "p": {
        name: "Pause",
        pressed: false,
        exec: () => {
            pause();
        }
    }
};

function start() {
    document.querySelector("#startScreen").remove();
    started = true;

    music.load();

    music.addEventListener("canplaythrough", () => {
        music.volume = 0.05;
        music.play();
    });
    music.onended = () => {
        music.play();
    };

    for (var i = 0; i < lives; i++) {
        document.querySelector("#lives").innerHTML += "<div class='lifeStar'></div>";
    }

    for (var i = 0; i < bombs; i++) {
        document.querySelector("#bombs").innerHTML += "<div class='bombStar'></div>";
    }

    Crafty.init(screenRes.width, screenRes.height);

    player.spawn();

    var group = 1;

    setInterval(() => {
        if (!paused) {
            var minion = new Minion();
            minion.spawn(50, 0, group);
            if (group === 1) group = 2;
            else group = 1;
        }
    }, 500);
}

function keyDown(e) {
    if (e.key === "r" && e.ctrlKey) return window.location.reload();
    if (binds[e.key] != undefined) {
        e.preventDefault();
        binds[e.key].exec();
        binds[e.key].pressed = true;
    }
}

function keyUp(e) {
    if (binds[e.key] != undefined) {
        e.preventDefault();
        if (e.key === getBind("Focus") && player.focus) {
            player.focus = false;
            player.speed = baseSpeed;
            player.hitbox.speed(baseSpeed);
        } else if (e.key === getBind("Shoot") && player.shooting) {
            player.shooting = false;
        }
        binds[e.key].pressed = false;
    }
}

function pause() {
    Crafty.pause();
    if (paused) paused = false;
    else paused = true;
}

function refreshScore() {
    var displayScore = score;
    if (score.toString().split("").length < 9) {
        for (var i = 0; i < (9 - score.toString().split("").length); i++) {
            displayScore = "0" + displayScore;
        }
    }
    document.querySelector("#score .amount").innerHTML = displayScore;
    if (score >= highScore) {
        highScore = score;
        refreshHighScore();
    }
}

function refreshHighScore() {
    var displayScore = highScore;
    if (highScore.toString().split("").length < 9) {
        for (var i = 0; i < (9 - highScore.toString().split("").length); i++) {
            displayScore = "0" + displayScore;
        }
    }
    document.querySelector("#highScore .amount").innerHTML = displayScore;
}

function getBind(query) {
    for (i in binds) {
        if (binds[i].name === query) return i;
    }
}
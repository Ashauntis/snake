debug = true;

function log(message) {
    if (debug) console.log(message);
}

// get high resolution time
function hrTime() {
    return performance.now() / 1000;
}

function placeFood() {
    food.x = 1 + Math.floor(Math.random() * 38);
    food.y = 1 + Math.floor(Math.random() * 38);
}

class Player {
    constructor(position) {
        this.position = position;
        this.body = [];
        this.heading = "s";
        this.last_heading = "s";
        this.time_last_move = hrTime();
        this.move_delay = 0.2;
        this.body_max_length = 4;
        this.score = 0;
        this.difficulty = 0.5; // 1 is no speed up, 0.5 is double speed. maybe .9 or .95 is good?
    }

    move() {
        // case heading
        if (time_current - this.last_move < this.move_delay) return;
        this.last_heading = this.heading;
        this.last_move = time_current;
        this.body.push({ ...this.position });

        if (this.body.length > this.body_max_length) {
            // log('removing')
            this.body.shift();
        }

        if (this.heading == "n") {
            this.position.y -= 1;
        }

        if (this.heading == "s") {
            this.position.y += 1;
        }

        if (this.heading == "e") {
            this.position.x += 1;
        }

        if (this.heading == "w") {
            this.position.x -= 1;
        }

        // check for food
        if (this.position.x == food.x && this.position.y == food.y) {
            this.body_max_length += 4;
            this.move_delay *= this.difficulty;
            this.score += 1;
            placeFood();
        }

        // check for death
        let death = false;
        if (this.position.x < 1) death = true;
        if (this.position.y < 1) death = true;
        if (this.position.x > 39) death = true;
        if (this.position.y > 39) death = true;

        for (var i = 0; i < this.body.length; i++) {
            if (this.position.x == this.body[i].x && this.position.y == this.body[i].y) {
                death = true;
            }
        }

        if (death) {
            log("game over!");
            scene = "gameover";
        }
    }
}
food = { x: 10, y: 10 };
player = new Player({ x: 20, y: 20 });
scene = "title";
last_key = "";
frame_time = performance.now();
time_current = hrTime();

addEventListener("keydown", ({ key }) => {
    last_key = key;
    log(key);
    if (key == "w" && player.heading != "s" && player.last_heading != 's') player.heading = "n";
    if (key == "s" && player.heading != "n" && player.last_heading != 'n') player.heading = "s";
    if (key == "a" && player.heading != "e" && player.last_heading != 'e') player.heading = "w";
    if (key == "d" && player.heading != "w" && player.last_heading != 'w') player.heading = "e";
});

function animate() {
    requestAnimationFrame(animate);
    time_current = hrTime();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // use the smallest of the two
    if (canvas.width > canvas.height) {
        canvas.block_size = canvas.height / 40;
    } else {
        canvas.block_size = canvas.width / 40;
    }
    // make this an integer
    canvas.block_size = Math.floor(canvas.block_size) - 1;
    if (canvas.block_size < 1) canvas.block_size = 1;

    // clear the canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // animate the current scene
    switch (scene) {
        case "title":
            animateTitle();
            break;
        case "game":
            animateGame();
            break;
        case "pause":
            animatePause();
            break;
        case "gameover":
            animateGameOver();
            break;
    }
}

function animateGameOver() {
    const base_font_size = canvas.block_size * 4;
    ctx.font = base_font_size + "px PressStart2P";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("You Died", canvas.width / 2, base_font_size * 2);
    ctx.fillStyle = "white";

    ctx.font = Math.floor(base_font_size / 2) + "px PressStart2P";

    ctx.fillText(
        "Score: " + player.score,
        canvas.width / 2,
        base_font_size * 4
    );


    ctx.fillText(
        "Press [Enter] to Continue",
        canvas.width / 2,
        base_font_size * 6
    );

    if (last_key == "Enter") {
        player = new Player({ x: 20, y: 20 });
        placeFood();
        last_key = "";
        scene = "game";
    }
}

function offsetFillRect(x, y, w, h) {

    let left_offset = Math.floor(canvas.width / 2 - canvas.block_size * 20);

    ctx.fillRect(left_offset + x, y, w, h);
}

function animateGame() {
    // draw a board outline of 40x40 of block_size
    // ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.fillStyle = "white";

    // draw the game borders
    // left edge
    offsetFillRect(0, 0, canvas.block_size, canvas.block_size * 40);

    // top edge
    offsetFillRect(0, 0, canvas.block_size * 40, canvas.block_size);

    // right edge
    offsetFillRect(
        canvas.block_size * 40,
        0,
        canvas.block_size,
        canvas.block_size * 40
    );

    // bottom edge
    offsetFillRect(
        0,
        canvas.block_size * 40,
        canvas.block_size * 41,
        canvas.block_size
    );

    // move the player
    player.move();

    // draw the player
    ctx.fillStyle = "green";
    offsetFillRect(
        player.position.x * canvas.block_size,
        player.position.y * canvas.block_size,
        canvas.block_size,
        canvas.block_size
    );

    // draw the player body
    ctx.fillStyle = "lightgreen";
    for (var i = 0; i < player.body.length; i++) {
        // log(player.body[i])
        offsetFillRect(
            player.body[i].x * canvas.block_size,
            player.body[i].y * canvas.block_size,
            canvas.block_size,
            canvas.block_size
        );
    }

    // draw the food
    ctx.fillStyle = "red";
    offsetFillRect(
        food.x * canvas.block_size,
        food.y * canvas.block_size,
        canvas.block_size,
        canvas.block_size
    );

    if (last_key == "Enter") {
        last_key = "";
        scene = "pause";
    }
}

function animatePause() {
    ctx.font = "30px PressStart2P";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);

    if (last_key == "Enter") {
        last_key = "";
        scene = "game";
    }
}

function animateTitle() {
    var font_size_title = 50;
    var font_size_subtitle = 20;

    ctx.font = font_size_title + "px PressStart2P";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Snake", canvas.width / 2, font_size_title);
    ctx.font = font_size_subtitle + "px PressStart2P";
    ctx.fillText(
        "A Jack Games Production",
        canvas.width / 2,
        font_size_title * 2
    );
    ctx.fillText(
        "Press [Enter] to Start and Pause",
        canvas.width / 2,
        font_size_title * 3
    );
    ctx.drawImage(snakeimg, canvas.width / 2, 100);

    if (last_key == "Enter") {
        placeFood();
        last_key = "";
        scene = "game";
    }
}

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// load a font from url
var myFont = new FontFace("PressStart2P", "url(./PressStart2P-Regular.ttf)");

myFont.load().then(function (font) {
    // with canvas, if this is ommited won't work
    document.fonts.add(font);
    log("Font loaded");
});

// load an image from a url
var myImage = new Image();
snakeimg = document.getElementById("source");
// snakeimg.textAlign = "center";

animate();

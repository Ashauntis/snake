debug = true;
performance_metrics = false;

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

function log_input_buffer() {
    log("input buffer: " + player.input_buffer);

}

class Player {
    constructor(position) {
        this.position = position;
        this.body = [];
        this.heading = "s";
        this.time_last_move = hrTime();
        this.move_delay = 0.2;
        this.body_max_length = 4;
        this.score = 0;
        this.difficulty = 0.9; // 1 is no speed up, 0.5 is double speed. maybe .9 or .95 is good?
        this.input_buffer = [];
        this.input_buffer_max_length = 3;
    }

    move() {
        // check if enough time has passed to move
        if (time_current - this.last_move < this.move_delay) return;
        this.last_move = time_current;

        // check our input buffer for the next move
        if (this.input_buffer.length > 0) {
            log('checking input buffer for movement:');
            log_input_buffer();

            let key = this.input_buffer.shift();
            switch (key) {
                case "w":
                    if (this.heading != "s") this.heading = "n";
                    break;
                case "a":
                    if (this.heading != "e") this.heading = "w";
                    break;
                case "s":
                    if (this.heading != "n") this.heading = "s";
                    break;
                case "d":
                    if (this.heading != "w") this.heading = "e";
                    break;
            }
        }

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

        // check for edge collision
        if (this.position.x < 1) death = true;
        if (this.position.y < 1) death = true;
        if (this.position.x > 39) death = true;
        if (this.position.y > 39) death = true;

        // check for body collision
        for (var i = 0; i < this.body.length; i++) {
            if (
                this.position.x == this.body[i].x && this.position.y == this.body[i].y
            ) {
                death = true;
            }
        }

        // if dead, set scene to game over
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
time_last = time_current;
time_delta = 0;

addEventListener("keydown", ({ key }) => {
    last_key = key;
    log("Key pressed: " + key);

    // check for movement keys and handle the input buffer
    valid_movement_keys = ["w", "a", "s", "d"];
    if (valid_movement_keys.includes(key)) {
        log("valid key pressed: " + key);

        // check if the input buffer is full
        if (player.input_buffer.length >= player.input_buffer_max_length) {
            log("input buffer full, not adding key");
        } else {
            push_key = false;

            // check if the last key placed in the input buffer is the same as the current key to be pushed
            if (player.input_buffer.length === 0) {
                push_key = true;
            } else if (player.input_buffer[player.input_buffer.length - 1] != key) {
                push_key = true;
            }

            if (push_key) {
                player.input_buffer.push(key);
                log("pushed key to input buffer: " + key);
                log_input_buffer();
            }
        }
    }

    // toggle performance metrics
    if (key == "p") {
        performance_metrics = !performance_metrics;
    }
});

function animate() {
    tick++;

    requestAnimationFrame(animate);
    time_current = hrTime();
    time_delta = time_current - time_last;
    time_last = time_current;


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

    // draw the performance metrics
    if (performance_metrics) {
        ctx.font = "20px PressStart2P";
        ctx.fillStyle = "red";
        ctx.textAlign = "left";
        ctx.fillText("FPS: " + Math.floor(1 / time_delta), 10, canvas.height - 60);
        ctx.fillText("Score: " + player.score, 10, canvas.height - 40);
        ctx.fillText("Move Speed: " + player.move_delay.toFixed(4), 10, canvas.height - 20);
        ctx.fillText("Frame Time: " + time_delta.toFixed(4), 10, canvas.height);
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
        base_font_size * 4,
    );

    ctx.fillText(
        "Press [Enter] to Continue",
        canvas.width / 2,
        base_font_size * 6,
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
        canvas.block_size * 40,
    );

    // bottom edge
    offsetFillRect(
        0,
        canvas.block_size * 40,
        canvas.block_size * 41,
        canvas.block_size,
    );

    // move the player
    player.move();

    // draw the player
    ctx.fillStyle = "green";
    offsetFillRect(
        player.position.x * canvas.block_size,
        player.position.y * canvas.block_size,
        canvas.block_size,
        canvas.block_size,
    );

    // draw the player body
    ctx.fillStyle = "lightgreen";
    for (var i = 0; i < player.body.length; i++) {
        // log(player.body[i])
        offsetFillRect(
            player.body[i].x * canvas.block_size,
            player.body[i].y * canvas.block_size,
            canvas.block_size,
            canvas.block_size,
        );
    }

    // draw the food
    ctx.fillStyle = "red";
    offsetFillRect(
        food.x * canvas.block_size,
        food.y * canvas.block_size,
        canvas.block_size,
        canvas.block_size,
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

function fillAndStrokeText(text, x, y) {
    ctx.fillText(text, x, y);
    ctx.strokeText(text, x, y);

}

function animateTitle() {

    // draw the snake image in the center of the screen with a slight transparency
    ctx.globalAlpha = 0.8;
    ctx.drawImage(snakeimg, canvas.width / 2 - snakeimg.width / 2, canvas.height / 2 - snakeimg.height / 2);
    ctx.globalAlpha = 1;

    var font_size_title = canvas.block_size * 4;
    var font_size_subtitle = canvas.block_size * 2;

    ctx.font = font_size_title + "px PressStart2P";
    ctx.textAlign = "center";


    // create some gradients to use
    const gradient_stroke = ctx.createLinearGradient(0, 0, canvas.width, 0);
    const gradient_fill = ctx.createLinearGradient(0, 0, canvas.width, 0);

    gradient_fill.addColorStop("0.0", '#ffd319');
    gradient_fill.addColorStop("0.5", "#ff901f");
    gradient_fill.addColorStop("1.0", '#ff901f');

    gradient_stroke.addColorStop("0", "#f222ff");
    gradient_stroke.addColorStop("1.0", "#8c1eff");

    // Fill with gradient
    ctx.fillStyle = gradient_fill;
    ctx.strokeStyle = gradient_stroke;
    ctx.lineWidth = 2 + Math.sin(tick / 40) * 1;

    fillAndStrokeText("Snake", canvas.width / 2, font_size_title + 4);

    ctx.font = font_size_subtitle + "px PressStart2P";
    fillAndStrokeText(
        "©️ 1975 Jack Games",
        canvas.width / 2,
        font_size_title * 10,
    );

    ctx.textAlign = "center";

    fillAndStrokeText(
        "Move",
        canvas.width / 2,
        font_size_title * 3.25,
    );
    fillAndStrokeText(
        "[w,a,s,d]",
        canvas.width / 2,
        font_size_title * 4,
    );

    fillAndStrokeText(
        "Start/Pause",
        canvas.width / 2,
        font_size_title * 5.25
    );

    fillAndStrokeText(
        "[Enter]",
        canvas.width / 2,
        font_size_title * 6,
    );
    fillAndStrokeText(
        "Toggle Data",
        canvas.width / 2,
        font_size_title * 7.25
    );

    fillAndStrokeText(
        "[p]",
        canvas.width / 2,
        font_size_title * 8,
    );


    if (last_key == "Enter") {
        placeFood();
        last_key = "";
        scene = "game";
    }
}

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

var tick = 0;

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

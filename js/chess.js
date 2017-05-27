//Simple Chess Game

const CHESS = (function() {

    //Canvas stuff

    const canvas = document.getElementById("game_canvas");
    const ctx = canvas.getContext("2d");
    const style = window.getComputedStyle(canvas);
    //const border_width = style.getPropertyValue("border-width");
    const border = {
        top: parseInt(style.getPropertyValue("border-top-width"), 0),
        bottom: parseInt(style.getPropertyValue("border-bottom-width"), 0),
        left: parseInt(style.getPropertyValue("border-left-width"), 0),
        right: parseInt(style.getPropertyValue("border-right-width"), 0)
    };

    const res = {
        x: canvas.width,
        y: canvas.height
    };
    const aspect_ratio = res.x / res.y;

    const target_framerate = 0;

    //Mouse stuff

    var mouse = {
        x: 0,
        y: 0
    };

    window.addEventListener("mousemove", function(event) {
        mouse.x = event.pageX - canvas.offsetLeft - border.left;
        mouse.y = event.pageY - canvas.offsetTop - border.top;
    });

    //Keyboard stuff

    var key_state = {};

    window.addEventListener("keydown", function(event) {
        key_state[event.keyCode || event.which] = true;
    });

    window.addEventListener("keyup", function(event) {
        key_state[event.keyCode || event.which] = false;
    });

    //Cells stuff

    const cells_per_side = 8;

    const cells = {
        x: cells_per_side * aspect_ratio,
        y: cells_per_side
    };

    var board = new Array(cells.x * cells.y);

    //Logic stuff

    var current_cell = {
        x: 0,
        y: 0
    };

    function select_cell() {
        current_cell.x = Math.floor((mouse.x / res.x) * 8);
        current_cell.y = Math.floor((mouse.y / res.y) * 8);
    }

    function logic() {
        select_cell();
    }

    //Render stuff

    function clear() { 
        ctx.clearRect(0, 0, res.x, res.y);
    };

    function draw_quads() {
        for (var x = 0; x < cells.x; ++x) {
            for (var y = 0; y < cells.y; ++y) {
                //First let's paint a "background"
                ctx.fillStyle = "#f00";
                ctx.fillRect(res.x / cells.x * x, res.y / cells.y * y, res.x / cells.x, res.y / cells.y);

                //Now if it's the one selected we'll only paint part of it's center to make a border effect
                ctx.fillStyle = (x % 2 == y % 2) ? "#fff" : "#000";
                if (current_cell.x == x && current_cell.y == y)
                    ctx.fillRect(
                        res.x / cells.x * x + 5, 
                        res.y / cells.y * y + 5, 
                        res.x / cells.x - 10, //the w/h padding needs to be doubled here to compensate the x/y padding
                        res.y / cells.y - 10
                    );
                else
                    ctx.fillRect(
                        res.x / cells.x * x, 
                        res.y / cells.y * y, 
                        res.x / cells.x, 
                        res.y / cells.y
                    );
            }
        }
    }

    function draw_circle() {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = "#f00";
        ctx.fill();
        ctx.closePath();
    }

    function render() {
        clear();
        draw_quads();
        //draw_circle();
    }

    //Stats stuff

    const stats_span = document.getElementById("stats_text");
    var stats_text = [];

    function stats() {
        stats_text.push("Cells: (" + cells.x + ", " + cells.y + "), " + (cells.x * cells.y) + " total");
        stats_text.push("Mouse Position: (" + mouse.x + ", " + mouse.y + ")");
        stats_text.push("Current Cell: (" + current_cell.x + ", " + current_cell.y + ")");
        stats_text.push("Border Width: (" + border.top + ", " + border.bottom + ", " + border.left + ", " + border.right + ")");

        stats_span.innerText = stats_text.join("\n");
        stats_text = [];
    }

    function main() {
        logic();
        render();
        stats();
    }

    setInterval(main, target_framerate == 0 ? 0 : 1 / target_framerate * 1000);
}());

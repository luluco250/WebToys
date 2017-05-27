//Simple Chess Game

(function() {

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
        y: 0,
        button: null,
        released: [false, false, false],
        pressed: [false, false, false],
        held: [false, false, false]
    };

    window.addEventListener("mousemove", function(event) {
        mouse.x = event.pageX - canvas.offsetLeft - border.left;
        mouse.y = event.pageY - canvas.offsetTop - border.top;
    });

    window.addEventListener("mousedown", function(event) {
        mouse.held[event.button] = true;
        mouse.button = event.button;
    });

    window.addEventListener("mouseup", function(event) {
        mouse.held[event.button] = false;
        mouse.button = null;
    });

    function mouse_handling() {
        
    }

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

    //Size of the selection border in pixels
    const selection_border_size = 5;
    const selection_border_color = "#f00";

    function draw_cells() {
        //First let's paint a "background"
        ctx.fillStyle = selection_border_color;
        ctx.fillRect(0, 0, res.x, res.y);

        var padding = 0;
        for (var x = 0; x < cells.x; ++x) {
            for (var y = 0; y < cells.y; ++y) {
                //Now if it's the one selected we'll only paint part of it's center to make a border effect
                ctx.fillStyle = (x % 2 == y % 2) ? "#fff" : "#000";
                padding = (current_cell.x == x && current_cell.y == y) ? selection_border_size : 0;
                ctx.fillRect(
                    res.x / cells.x * x + padding,
                    res.y / cells.y * y + padding,
                    res.x / cells.x - padding * 2, //the w/h padding needs to be doubled to compensate the x/y padding
                    res.y / cells.y - padding * 2
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
        draw_cells();
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
        stats_text.push("Mouse Pressed: (" + mouse.pressed[0] + ", " + mouse.pressed[1] + ", " + mouse.pressed[2] + ")");
        stats_text.push("Mouse Released: (" + mouse.released[0] + ", " + mouse.released[1] + ", " + mouse.released[2] + ")");
        stats_text.push("Mouse Held: (" + mouse.held[0] + ", " + mouse.held[1] + ", " + mouse.held[2] + ")");
        stats_text.push("Mouse Button: " + mouse.button);

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

//Simple Paint Program

const PAINT = (function() {
    //var pub = {}; //public members, but we won't use them right now

    const e = ENGINE.initialize("game_canvas", 0);
    const ctx = e.context;
    
    const stats = document.getElementById("game_stats");
    
    const color_input = document.getElementById("color_input");
    const color_text = document.getElementById("color_text");

    const size_input = document.getElementById("size_input");
    const size_text = document.getElementById("size_text");

    const timescale_input = document.getElementById("timescale_input");
    const timescale_text = document.getElementById("timescale_text");

    var text_stats = [];

    e.loop_logic(function() {
        e.timescale = timescale_input.value;
        timescale_text.innerText = e.timescale;

        color_text.innerText = color_input.value;
        size_text.innerText = size_input.value;

        text_stats.push("FPS: " + (1 / e.deltatime_unscaled));
        text_stats.push("Delta Time: " + (e.deltatime_unscaled * 1000) + "ms");
        stats.innerText = text_stats.join("\n");
        text_stats = [];
    });

    e.loop_render(function() {
        //e.clear(0);
        //e.clear(0.5); //"trails"/"motion blur" effect
        if (e.mouse_state[0] == true) {
            ctx.beginPath();
            ctx.arc(e.mouse_x, e.mouse_y,
            size_input.value, 0, Math.PI * 2);
            ctx.fillStyle = color_input.value;
            ctx.fill();
            ctx.closePath();
        }
    });

    //return pub; //where we expose our public members
}());

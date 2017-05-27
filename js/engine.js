//Simple 2D Engine

const ENGINE = (function() {
    var pub = {};

    pub.key_state = {};
    pub.mouse_state = {};

    //pub.targetFPS = 60;
    pub.timescale = 1;
    pub.deltatime = 0;
    pub.deltatime_unscaled;

    var time_current = 0;
    var time_last = Date.now();
    
    pub.loop_logic = function(func) {
        setInterval(function() {
            func();
        }, 0);
    }

    pub.loop_render = function(func) {
        setInterval(function() {
            time_current = Date.now();
            pub.deltatime_unscaled = (time_current - time_last) * 0.001;
            pub.deltatime *= pub.timescale;
            time_last = time_current;

            func();
        }, pub.targetFPS == 0 ? 0 : 1 / pub.targetFPS * 1000);
    }

    pub.initialize = function(canvasId, targetFPS) {
        pub.targetFPS = targetFPS;
        pub.canvas = document.getElementById(canvasId);
        pub.context = pub.canvas.getContext("2d");

        pub.width = pub.canvas.width;
        pub.height = pub.canvas.height;

        window.addEventListener("mousemove", function(event) {
            pub.mouse_x = event.pageX - pub.canvas.offsetLeft;
            pub.mouse_y = event.pageY - pub.canvas.offsetTop;
        });

        window.addEventListener("keydown", function(event) {
            pub.key_state[event.keyCode || event.which] = true;
        });

        window.addEventListener("keyup", function(event) {
            pub.key_state[event.keyCode || event.which] = false;
        });

        window.addEventListener("mousedown", function(event) {
            pub.mouse_state[event.button] = true;
        });

        window.addEventListener("mouseup", function(event) {
            pub.mouse_state[event.button] = false;
        });

        return pub;
    }

    pub.clear = function() {
        pub.context.clearRect(0, 0, pub.width, pub.height);
    }

    return pub;
}());

//Simple Pong Game

(function() {

	const key_map = {
		up: 38,
		down: 40,
		left: 37,
		right: 39
	};

	const Vector2 = function(x = 0, y = 0) {
		this.x = x;
		this.y = y;

		this.toString = function() {
			return "(" + this.x + ", " + this.y + ")";
		};

		this.magnitude = function() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		};

		this.operate = function(func) {
			func(this.x);
			func(this.y);
		};

		this.flip = function() {
			return new Vector2(this.y, this.x);
		};
	};

	function clamp(n, min, max) {
		return n < min ? min : n > max ? max : n;
	}

	function clamp_magnitude(vec2, mag) {
		var len = vec2.magnitude();

		//normalize the vector
		vector.x /= len;
		vector.y /= len;

		len = clamp(len, -mag, mag);

		//de-normalize the vector with the modified magnitude
		vector.x *= len;
		vector.y *= len;

		return vector;
	}

	function degs2rads(degrees) {
		return degrees * 0.01745329251994329576923690768489;
	}

	function rads2degs(radians) {
		return radians * 57.295779513082320876798154814105;
	}

	function rot2D(offset, angle) {
		angle = degs2rads(angle);
		return new Vector2(Math.cos(angle) * offset, Math.sin(angle) * offset);
	}

	function get_angle(vec2_a, vec2_b) {
		return rads2degs(Math.atan2(vec2_b.x - vec2_a.x, vec2_b.y - vec2_a.y));
	}

	const canvas = document.getElementById("game_canvas");
	const ctx = canvas.getContext("2d");
	const res = new Vector2(canvas.width, canvas.height);

	const mouse = {
		pos: new Vector2(),
		held: [false, false, false],
		pressed: [false, false, false],
		released: [false, false, false],
		last: [false, false, false]
	};

	const key_state = {};

	window.addEventListener("mousemove", function(e) {
		mouse.pos.x = e.pageX - canvas.offsetLeft;
		mouse.pos.y = e.pageY - canvas.offsetTop;
	});

	window.addEventListener("mousedown", function(e) {
		mouse.held[e.button] = true;
	});

	window.addEventListener("keydown", function(e) {
		key_state[e.keyCode] = true;
	});

	window.addEventListener("keyup", function(e) {
		key_state[e.keyCode] = false;
	});

	window.addEventListener("mouseup", function(e) {
		mouse.held[e.button] = false;
	});
	
	const ball = {
		pos: new Vector2(),
		vel: new Vector2(),
		radius: 15,
		color: "#0af",
		outline: {
			color: "#000",
			radius: 10
		},
		speed: 0
	};

	const paddle = {
		pos: new Vector2(mouse.pos.x, res.y - 50),
		size: new Vector2(75, 15),
		color: "#0af"
	};

	const score = {
		player: 0,
		record: 0
	};

	var timescale = 1.0;
	var delta = 0.0;
	var delta_unscaled = 0.0;
	var time_current = Date.now();
	var time_last = time_current;

	function update_delta() {
		time_current = Date.now();
		delta_unscaled = (time_current - time_last) * 0.001;
		delta = delta_unscaled * timescale;
		time_last = time_current;
	}

	function handle_mouse() {
		for (var i = 0; i < 3; ++i) {
			mouse.pressed[i] = mouse.held[i] && !mouse.last[i];
			mouse.released[i] = !mouse.held[i] && mouse.last[i];

			mouse.last[i] = mouse.held[i];
		}
	}

	function move_paddle_player() {
		paddle.pos.x = clamp(mouse.pos.x, paddle.size.x * 0.5, res.x - paddle.size.x * 0.5);
	}

	function handle_input() {
		handle_mouse();

		if (mouse.pressed[2])
			init(); //restart

		move_paddle_player();
	}

	function launch_ball(offset = 0) {
		ball.pos = new Vector2(res.x * 0.5, res.y * 0.5);
		ball.speed = 300;
		ball.vel = rot2D(ball.speed, Math.random() * 150 + 15 + offset);
	}

	function move_ball() {
		ball.pos.x += ball.vel.x * delta;
		ball.pos.y += ball.vel.y * delta;

		//ball.speed = sqrt(ball.vel.x * ball.vel.x + ball.vel.y * ball.vel.y);
	}

	function flip_ball_vel(vec2_a, vec2_b) {
		ball.vel.x = ball.pos.x < vec2_a.x ? Math.abs(ball.vel.x) : ball.pos.x > vec2_b.x ? -Math.abs(ball.vel.x) : ball.vel.x;
		ball.vel.y = ball.pos.y < vec2_a.y ? Math.abs(ball.vel.y) : ball.pos.y > vec2_b.y ? -Math.abs(ball.vel.y) : ball.vel.y;
	}

	function is_colliding(
		a_pos, b_pos, 
		a_size = new Vector2(), 
		b_size = new Vector2()
	) {
		return (a_pos.x + a_size * 0.5) > (b_pos.x - b_size.x * 0.5)
			&& (a_pos.x - a_size * 0.5) < (b_pos.x + b_size.x * 0.5)
			&& (a_pos.y + a_size * 0.5) > (b_pos.y - b_size.y * 0.5)
			&& (a_pos.y - a_size * 0.5) < (b_pos.y + b_size.y * 0.5);
	}

	var border_collision = false;
	var paddle_collision = false;

	function collision_paddle() {
		if (ball.pos.x > paddle.pos.x - paddle.size.x * 0.5
		 && ball.pos.x < paddle.pos.x + paddle.size.x * 0.5
		 && ball.pos.y > paddle.pos.y - paddle.size.y * 0.5
		 && ball.pos.y < paddle.pos.y + paddle.size.y * 0.5
		) {
			ball.speed += !paddle_collision ?  25 : 0;
			ball.vel = rot2D(ball.speed, get_angle(ball.pos, paddle.pos) + 180).flip();
			paddle_collision = true;
		} else {
			paddle_collision = false;
		}
	}

	function collision_borders() {
		if (ball.pos.y > res.y) {
			init();
		}
		if (ball.pos.y < 0) {
			ball.speed += 25;
			score.player += !border_collision ? 1 : 0;
			border_collision = true;
		} else {
			border_collision = false;
		}
		score.record = score.player > score.record ? score.player : score.record;
		flip_ball_vel(new Vector2(), res);
	}

	function collision() {
		collision_paddle();
		collision_borders();
	}

	function logic() {
		update_delta();
		handle_input();
		move_ball();
		collision();
	}

	const stats_span = document.getElementById("game_stats");
	function stats() {
		var text = [];

		stats_span.innerText = text.join('\n');
	}

	function clear() {
		ctx.clearRect(0, 0, res.x, res.y);
	}

	function draw_ball() {
		ctx.beginPath();

		ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, Math.PI * 2);
		ctx.fillStyle = ball.color;
		ctx.fill();

		ctx.closePath();
	}

	function draw_paddle() {
		ctx.fillStyle = paddle.color;
		ctx.fillRect(
			paddle.pos.x - paddle.size.x * 0.5, 
			paddle.pos.y - paddle.size.y * 0.5, 
			paddle.size.x, 
			paddle.size.y
		);
	}

	function draw_score() {
		const pos = new Vector2(res.x * 0.025, res.y * 0.075);

		ctx.font = "20px Arial";
		ctx.fillStyle = "#000";
		ctx.fillText("Player: " + score.player, pos.x, pos.y);
		ctx.fillText("Record: " + score.record, pos.x, pos.y + 20);
	}

	function render(time) {
		clear();
		
		draw_ball();
		draw_paddle();
		draw_score();

		window.requestAnimationFrame(render);
	}

	const targetFPS = 60;

	var interval_logic = null;
	var interval_stats = null;

	function init() {
		console.log("Initializing...");

		if (interval_logic)
			clearInterval(interval_logic);
		if (interval_stats)
			clearInterval(interval_stats);

		score.player = 0;
		score.enemy = 0;

		interval_logic = setInterval(logic, 0);
		interval_stats = setInterval(stats, 1 / 10 * 1000);
		window.requestAnimationFrame(render);

		launch_ball();
	}

	setTimeout(init(), 1000);
}());

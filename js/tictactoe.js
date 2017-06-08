//Not-So-Simple TicTacToe game

(function() {
	const Vector2 = function(x, y) {
		this.x = x || 0;
		this.y = y || 0;

		this.toString = function() {
			return "(" + this.x + ", " + this.y + ")";
		}
	}

	const canvas = document.getElementById("game_canvas");
	const ctx = canvas.getContext("2d");
	const res = new Vector2(canvas.width, canvas.height);
	const style = window.getComputedStyle(canvas);
	const border = {
		top: parseInt(style.getPropertyValue("border-top-width"), 0),
        bottom: parseInt(style.getPropertyValue("border-bottom-width"), 0),
        left: parseInt(style.getPropertyValue("border-left-width"), 0),
        right: parseInt(style.getPropertyValue("border-right-width"), 0)
	};
	const stats_text = document.getElementById("game_stats");

	const mouse = {
		position: new Vector2(),
		held: [false, false, false],
		pressed: [false, false, false],
		released: [false, false, false]
	};

	const current_cell = new Vector2();

	window.addEventListener("mousemove", function(e) {
		mouse.position.x = e.pageX - canvas.offsetLeft - border.left;
		mouse.position.y = e.pageY - canvas.offsetTop - border.top;

		current_cell.y = Math.floor(mouse.position.x / res.x * 3);
		current_cell.x = Math.floor(mouse.position.y / res.y * 3);
	});

	window.addEventListener("mousedown", function(e) {
		mouse.held[e.button] = true;
	});

	window.addEventListener("mouseup", function(e) {
		mouse.held[e.button] = false;
	});

	const Cell = {
		NONE: 0,
		CROSS: 1,
		CIRCLE: 2
	};

	const board = [
		[Cell.NONE, Cell.NONE, Cell.NONE],
		[Cell.NONE, Cell.NONE, Cell.NONE],
		[Cell.NONE, Cell.NONE, Cell.NONE]
	];

	function cell2pos(column, row) {
		row -= 0.5; column -= 0.5; //center
		row /= 3;   column /= 3;   //range
		return new Vector2(res.x * row, res.y * column);
	}

	function row_won(n) {
		return (board[0][n]) && (board[0][n] == board[1][n]) && (board[1][n] == board[2][n]);
	}

	function column_won(n) {
		return (board[n][0]) && (board[n][0] == board[n][1]) && (board[n][1] == board[n][2]);
	}

	function diagonal_won(b) {
		return b ? ((board[0][0]) && (board[0][0] == board[1][1]) && (board[1][1] == board[2][2]))
			 	 : ((board[2][0]) && (board[2][0] == board[1][1]) && (board[1][1] == board[0][2]));
	}

	function check_victory() {
		//check rows
		for (var row = 0; row < 3; ++row) {
			if (row_won(row)) {
				gameover = true;
				result.type = ResultType.VERTICAL;
				result.row = row;
				return;
			}
		}

		//check columns
		for (var column = 0; column < 3; ++column) {
			if (column_won(column)) {
				gameover = true;
				result.type = ResultType.HORIZONTAL;
				result.column = column;
				return;
			}
		}

		//check backslash diagonals
		if (diagonal_won(true)) {
			gameover = true;
			result.type = ResultType.DIAGONAL;
			result.is_backslash = true;
			return;
		}

		//check slash diagonals
		if (diagonal_won(false)) {
			gameover = true;
			result.type = ResultType.DIAGONAL;
			result.is_backslash = false;
			return;
		}

		if (cells_filled >= 9) {
			gameover = true;
			result.type = ResultType.TIE;
			return;
		}
	}

	var player2 = false;
	var gameover = false;
	var cells_filled = 0;
	
	const ResultType = {
		NONE: 0,
		VERTICAL: 1,
		HORIZONTAL: 2,
		DIAGONAL: 3,
		TIE: 4
	};

	var result = {
		type: ResultType.NONE,
		column: 0,
		row: 0,
		is_backslash: false
	};
	
	const last_mouse = {
		position: new Vector2(),
		button: [false, false, false]
	};

	function handle_last_mouse() {
		last_mouse.position = mouse.position;

		for (var i = 0; i < 3; ++i) {
			mouse.pressed[i] = mouse.held[i] && !last_mouse.button[i];
			mouse.released[i] = !mouse.held[i] && last_mouse.button[i];
			last_mouse.button[i] = mouse.held[i];
		}
	}

	function logic() {
		handle_last_mouse();

		if (mouse.pressed[2])
			restart();

		check_victory();

		if (!gameover) {
			if (mouse.pressed[0]) {
				if (board[current_cell.x][current_cell.y] == Cell.NONE) {
					board[current_cell.x][current_cell.y] = player2 ? Cell.CIRCLE : Cell.CROSS;
					player2 = !player2;
					++cells_filled;
				}
			}
		}
	}

	function draw_outlined_line(
		pos_start, pos_end,
		line_size, line_color,
		outline_size, outline_color,
		general_size = 0
	) {
		ctx.beginPath();

		const fixed_size = outline_size / Math.PI;

		const offset = new Vector2();
		offset.x = pos_start.x < pos_end.x ? -general_size - fixed_size : general_size + fixed_size;
		offset.y = pos_start.y < pos_end.y ? -general_size - fixed_size : general_size + fixed_size;

		ctx.moveTo(
			pos_start.x + offset.x, 
			pos_start.y + offset.y
		);
		ctx.lineTo(
			pos_end.x - offset.x,
			pos_end.y - offset.y
		);

		ctx.lineWidth = line_size + outline_size;
		ctx.strokeStyle = outline_color;
		ctx.stroke();

		ctx.closePath();
		ctx.beginPath();

		offset.x = pos_start.x < pos_end.x ? -general_size : general_size;
		offset.y = pos_start.y < pos_end.y ? -general_size : general_size;

		ctx.moveTo(
			pos_start.x + offset.x, 
			pos_start.y + offset.y
		);
		ctx.lineTo(
			pos_end.x + offset.x,
			pos_end.y + offset.y
		);

		ctx.lineWidth = line_size;
		ctx.strokeStyle = line_color;
		ctx.stroke();

		ctx.closePath();
	}

	const cell_size = 50;
	const cell_width = 7.5;
	const cell_outline = 3;
	const cross_outline = cell_outline / Math.PI;

	function draw_cross(pos) {
		/*draw_outlined_line(
			new Vector2(pos.x, pos.y), 
			new Vector2(pos.x, pos.y),
			7.5, "#f00",
			3, "#000",
			cell_size
		);

		draw_outlined_line(
			new Vector2(pos.x, pos.y), 
			new Vector2(pos.x, pos.y),
			7.5, "#f00",
			3, "#000",
			cell_size
		);*/

		ctx.beginPath();

		ctx.moveTo(pos.x - cell_size - cross_outline, pos.y - cell_size - cross_outline);
		ctx.lineTo(pos.x + cell_size + cross_outline, pos.y + cell_size + cross_outline);

		ctx.moveTo(pos.x + cell_size + cross_outline, pos.y - cell_size - cross_outline);
		ctx.lineTo(pos.x - cell_size - cross_outline, pos.y + cell_size + cross_outline);

		ctx.lineWidth = cell_width + cell_outline;
		ctx.strokeStyle = "#000";
		ctx.stroke();

		ctx.closePath();
		ctx.beginPath();

		ctx.moveTo(pos.x - cell_size, pos.y - cell_size);
		ctx.lineTo(pos.x + cell_size, pos.y + cell_size);

		ctx.moveTo(pos.x + cell_size, pos.y - cell_size);
		ctx.lineTo(pos.x - cell_size, pos.y + cell_size);

		ctx.lineWidth = cell_width;
		ctx.strokeStyle = "#f00";
		ctx.stroke();

		ctx.closePath();
	}

	function draw_circle(pos) {ctx.beginPath();
		ctx.beginPath();

		ctx.arc(pos.x, pos.y, cell_size, 0, 2 * Math.PI);
		
		ctx.lineWidth = cell_width + 3;
		ctx.strokeStyle = "#000";
		ctx.stroke();

		ctx.lineWidth = cell_width;
		ctx.strokeStyle = "#f00";
		ctx.stroke();

		ctx.closePath();
	}

	function draw_cells() {
		for (var x = 0; x < 3; ++x) {
			for (var y = 0; y < 3; ++y) {
				if (board[x][y] == Cell.CIRCLE)
					draw_circle(cell2pos(x + 1, y + 1));
				if (board[x][y] == Cell.CROSS)
					draw_cross(cell2pos(x + 1, y + 1));
			}
		}
	}

	function draw_layout() {
		ctx.lineWidth = 5;
		ctx.strokeStyle = "#000";

		ctx.beginPath();
		
		ctx.moveTo(res.x / 3, 0);
		ctx.lineTo(res.x / 3, res.y);
		
		ctx.moveTo(res.x / 3 * 2, 0);
		ctx.lineTo(res.x / 3 * 2, res.y);
		
		ctx.moveTo(0, res.y / 3);
		ctx.lineTo(res.x, res.y / 3);

		ctx.moveTo(0, res.y / 3 * 2);
		ctx.lineTo(res.x, res.y / 3 * 2);

		ctx.stroke();
		ctx.closePath();
	}

	const line_size = 7.5;
	const line_color = "#0af";
	const line_outline_size = 12;
	const line_outline_size_fixed = line_outline_size / (Math.PI * 2);
	const line_outline_color = "#000";

	function draw_line_vertical(column) {
		var pos_start = cell2pos(1, column + 1);
		var pos_end = cell2pos(3, column + 1);

		ctx.beginPath();

		ctx.moveTo(pos_start.x, pos_start.y - cell_size - line_outline_size_fixed);
		ctx.lineTo(pos_end.x, pos_end.y + cell_size + line_outline_size_fixed);

		ctx.lineWidth = line_outline_size;
		ctx.strokeStyle = line_outline_color;
		ctx.stroke();

		ctx.closePath();
		ctx.beginPath();

		ctx.moveTo(pos_start.x, pos_start.y - cell_size);
		ctx.lineTo(pos_end.x, pos_end.y + cell_size);

		ctx.lineWidth = line_size;
		ctx.strokeStyle = line_color;
		ctx.stroke();

		ctx.closePath();
	}

	function draw_line_horizontal(row) {
		var pos_start = cell2pos(row + 1, 1);
		var pos_end = cell2pos(row + 1, 3);
		
		ctx.beginPath();

		ctx.moveTo(pos_start.x - cell_size - line_outline_size_fixed, pos_start.y);
		ctx.lineTo(pos_end.x + cell_size + line_outline_size_fixed, pos_end.y);

		ctx.lineWidth = line_outline_size;
		ctx.strokeStyle = line_outline_color;
		ctx.stroke();

		ctx.closePath();
		ctx.beginPath();

		ctx.moveTo(pos_start.x - cell_size, pos_start.y);
		ctx.lineTo(pos_end.x + cell_size, pos_end.y);

		ctx.lineWidth = line_size;
		ctx.strokeStyle = line_color;
		ctx.stroke();

		ctx.closePath();
	}

	function draw_line_diagonal(is_backslash) {
		if (is_backslash) {
			var pos_start = cell2pos(1, 1);
			var pos_end = cell2pos(3, 3);

			ctx.beginPath();

			ctx.moveTo(pos_start.x - cell_size - line_outline_size_fixed, pos_start.y - cell_size - line_outline_size_fixed);
			ctx.lineTo(pos_end.x + cell_size + line_outline_size_fixed, pos_end.y + cell_size + line_outline_size_fixed);

			ctx.lineWidth = line_outline_size;
			ctx.strokeStyle = line_outline_color;
			ctx.stroke();

			ctx.closePath();
			ctx.beginPath();

			ctx.moveTo(pos_start.x - cell_size, pos_start.y - cell_size);
			ctx.lineTo(pos_end.x + cell_size, pos_end.y + cell_size);

			ctx.lineWidth = line_size;
			ctx.strokeStyle = line_color;
			ctx.stroke();

			ctx.closePath();
		} else {
			var pos_start = cell2pos(1, 3);
			var pos_end = cell2pos(3, 1);

			ctx.beginPath();

			ctx.moveTo(pos_start.x + cell_size + line_outline_size_fixed, pos_start.y - cell_size - line_outline_size_fixed);
			ctx.lineTo(pos_end.x - cell_size - line_outline_size_fixed, pos_end.y + cell_size + line_outline_size_fixed);

			ctx.lineWidth = line_outline_size;
			ctx.strokeStyle = line_outline_color;
			ctx.stroke();

			ctx.closePath();
			ctx.beginPath();

			ctx.moveTo(pos_start.x + cell_size, pos_start.y - cell_size);
			ctx.lineTo(pos_end.x - cell_size, pos_end.y + cell_size);

			ctx.lineWidth = line_size;
			ctx.strokeStyle = line_color;
			ctx.stroke();

			ctx.closePath();
		}
	}

	const result_box_size = 50;

	function draw_result_text() {
		const pos = new Vector2(res.x / 2, res.y / 2);
		ctx.font = "30px Arial";
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";

		const text = result.type == ResultType.TIE ? "It's a tie!" : player2 ? "Player 1 won!" : "Player 2 won!";

		ctx.strokeStyle = "#000";
		ctx.lineWidth = 3;
		ctx.strokeText(text, pos.x, pos.y);

		ctx.fillStyle = "#fff";
		ctx.fillText(text, pos.x, pos.y);
	}

	function draw_result() {
		if (result.type) {
			if (result.type == ResultType.VERTICAL)
				draw_line_vertical(result.row);
			if (result.type == ResultType.HORIZONTAL)
				draw_line_horizontal(result.column);
			if (result.type == ResultType.DIAGONAL)
				draw_line_diagonal(result.is_backslash);
			
			draw_result_text();
		}
	}

	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		draw_layout();
		draw_cells();
		draw_result();
	}

	function stats() {
		var text = [];
		
		text.push("Mouse Position: " + mouse.position);
		text.push("Mouse Buttons: " + mouse.held);
		text.push("Current Cell: " + current_cell);
		text.push("Player: " + (player2 ? '2' : '1'));

		stats_text.innerText = text.join('\n');
	}

	function main() {
		logic();
		stats();
		render();
	}

	function restart() {
		//reset board
		for (var x = 0; x < 3; ++x) {
			for (var y = 0; y < 3; ++y) {
				board[x][y] = Cell.NONE;
			}
		}

		player2 = false;
		gameover = false;
		cells_filled = 0;
		
		result.type = ResultType.NONE;
		result.row = 0;
		result.column = 0;
		result.is_backslash = false;
	}

	const targetFPS = 20;

	setInterval(main, targetFPS == 0 ? 0 : 1 / targetFPS * 1000);
}());

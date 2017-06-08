//Simple Chess Game

window.onload = function() {

	const Vector2 = function(x = 0, y = 0) {
		this.x = x;
		this.y = y;
		this.toString = function() { 
			return "(" + this.x + ", " + this.y + ")" 
		};
	};

	const Vector3 = function(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.toString = function() {
			return "(" + this.x + ", " + this.y + ", " + this.z + ")";
		};
	};

	const Vector4 = function(x = 0, y = 0, z = 0, w = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
		this.toString = function() {
			return "(" + this.x + ", " + this.y + ", " + this.z + ", " + this.w + ")";
		};
	};

	const Color = function(r, g, b, a = 255) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
		this.toString = function() {
			return "(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
		};
		this.toRGBA = function() {
			return "rgba" + this.toString();
		};
	};
	
	function Array2D(width, height, value = 0) {
		var arr = [];
		for (var x = 0; x < width; ++x) {
			arr[x] = [];
			for (var y = 0; y < height; ++y) {
				arr[x][y] = value;
			}
		}
		return arr;
	}

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

	const res = new Vector2(canvas.width, canvas.height);
    const aspect_ratio = res.x / res.y;

    const target_framerate = 0;

    //Mouse stuff

    const mouse = {
        position: new Vector2(0, 0),
        button: null,
        released: [false, false, false],
        pressed: [false, false, false],
        held: [false, false, false]
    };

    window.addEventListener("mousemove", function(event) {
        mouse.position.x = event.pageX - canvas.offsetLeft - border.left;
        mouse.position.y = event.pageY - canvas.offsetTop - border.top;
    });

    window.addEventListener("mousedown", function(event) {
        mouse.held[event.button] = true;
        mouse.button = event.button;
    });

    window.addEventListener("mouseup", function(event) {
        mouse.held[event.button] = false;
        mouse.button = null;
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
	const cells = new Vector2(cells_per_side * aspect_ratio, cells_per_side);
	const cell_size = new Vector2(
		canvas.width / 8,
		canvas.height / 8
	);

	const cell = (function() {
		var pub = {};

		pub.per_side = 8;
		pub.total = new Vector2(pub.per_side * aspect_ratio, pub.per_side);
		pub.size = new Vector2(canvas.width / pub.total.x, canvas.height / pub.total.y);

		return pub;
	}());

	//Create board 2D array
	const board = new Array2D(cells.x, cells.y);

    //const board = new Array(cells.x * cells.y);

	//Pieces stuff

	const Piece = {
		NONE: 0,
		WPAWN: 1,
		WKNIGHT: 2,
		WROOK: 3,
		WBISHOP: 4,
		WQUEEN: 5,
		WKING: 6,
		BPAWN: 7,
		BKNIGHT: 8,
		BROOK: 9,
		BBISHOP: 10,
		BQUEEN: 11,
		BKING: 12
	};

	const PieceID = [
		"",
		"sprite_white_pawn",
		"sprite_white_knight",
		"sprite_white_rook",
		"sprite_white_bishop",
		"sprite_white_queen",
		"sprite_white_king",
		"sprite_black_pawn",
		"sprite_black_knight",
		"sprite_black_rook",
		"sprite_black_queen",
		"sprite_black_king",
	];

	const board_template = [
		[Piece.BROOK,	Piece.BKNIGHT,	Piece.BBISHOP,	Piece.BQUEEN,	Piece.BKING,	Piece.BBISHOP,	Piece.BKNIGHT,	Piece.BROOK],
		[Piece.BPAWN,	Piece.BPAWN,	Piece.BPAWN,	Piece.BPAWN,	Piece.BPAWN,	Piece.BPAWN,	Piece.BPAWN,	Piece.BPAWN],
		[Piece.NONE,	Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE],
		[Piece.NONE,	Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE],
		[Piece.NONE,	Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE],
		[Piece.NONE,	Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE,		Piece.NONE],
		[Piece.WPAWN,	Piece.WPAWN,	Piece.WPAWN,	Piece.WPAWN,	Piece.WPAWN,	Piece.WPAWN,	Piece.WPAWN,	Piece.WPAWN],
		[Piece.WROOK,	Piece.WKNIGHT,	Piece.WBISHOP,	Piece.WQUEEN,	Piece.WKING,	Piece.WBISHOP,	Piece.WKNIGHT,	Piece.WROOK]
	];

	const ChessPiece = function(id, x, y, isBlack) {
		this.image = document.getElementById(id);
		this.position = new Vector2(x, y);
		this.isBlack = isBlack;
		this.draw = function() {
			ctx.drawImage(
				this.image, 
				this.position.x * cell.size.x, 
				this.position.y * cell.size.y,
				cell.size.x,
				cell.size.y
			);
		};
	};

	//Creating pieces

	for (var x = 0; x < cell.total.x; ++x) {
		for (var y = 0; y < cell.total.y; ++y) {
			if (board_template[x][y] == Piece.NONE) 
				continue;

			var id = PieceID[board_template[x][y]];

			board[x][y] = new ChessPiece(id, x, y, board_template[x][y] > 6);
		}
	}

    //Logic stuff

	const current_cell = new Vector2(0, 0);

    function select_cell() {
        current_cell.x = Math.floor((mouse.position.x / res.x) * 8);
        current_cell.y = Math.floor((mouse.position.y / res.y) * 8);
    }

    function logic() {
        select_cell();

		if (mouse.held[0]
		 && current_cell.x >= 0 && current_cell.x < cells.x
		 && current_cell.y >= 0 && current_cell.y < cells.y
		) {
			console.log("Clicking at " + current_cell.toString());
		}
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
                ctx.fillStyle = (x % 2 == y % 2) ? "#fed" : "#432";
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
        ctx.arc(mouse.position.x, mouse.position.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = "#f00";
        ctx.fill();
        ctx.closePath();
    }

	function draw_pieces() {
		//ctx.drawImage(white_king.image, white_king.position.x, white_king.position.y);
		//white_king.draw();
		
		for (var x = 0; x < cell.total.x; ++x) {
			for (var y = 0; y < cell.total.y; ++y) {
				if (board[x][y]) {
					//console.log("Drawing " + board[x][y].image.id + " at " + board[x][y].position);
					board[x][y].draw();
				}
				//board[x][y].draw();
				//console.log("PieceID: " + board[x][y].position);
			}
		}
		
	}

    function render() {
        clear();
        draw_cells();
        //draw_circle();
		draw_pieces();
    }

    //Stats stuff

    const stats_span = document.getElementById("stats_text");
    var stats_text = [];

    function stats() {
        stats_text.push("Cells: " + cells + ", " + (cells.x * cells.y) + " total");
        stats_text.push("Mouse Position: " + mouse.position);
        stats_text.push("Current Cell: " + current_cell);
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
	//draw_pieces();
};

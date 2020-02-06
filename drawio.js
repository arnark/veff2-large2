var canvas,
    ctx,
    mouse,
    drawStack,
    undoStack,
    paintCoords,
    move = false,
    index = 0,
    savedPaintings;

function paint() {
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();

    // Push the drawDot to the drawStroke array
    canvas.drawDot.toX = mouse.x;
    canvas.drawDot.toY = mouse.y;
    canvas.drawDot.lineWidth = ctx.lineWidth;
	canvas.drawDot.strokeStyle = ctx.strokeStyle;
	canvas.drawStroke.push(canvas.drawDot);

	// Reset drawDot
	canvas.drawDot = { index: index, fromX: mouse.x, fromY: mouse.y };
};

function rePaint(stack = drawStack) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Preserver current settings
	let currLineWidth = ctx.lineWidth;
	let currStrokeStyle = ctx.strokeStyle

	// Completely repaint each dot on the canvas from the drawStack
	stack.forEach(stroke => {
		stroke.forEach(dot => {
			ctx.lineWidth = dot.lineWidth;
			ctx.strokeStyle = dot.strokeStyle;
  			ctx.beginPath();
    		ctx.moveTo(dot.fromX, dot.fromY);
    		ctx.lineTo(dot.toX, dot.toY);
    		ctx.stroke();
		});
	});

	// Revert to old settings
	ctx.lineWidth = currLineWidth;
	ctx.strokeStyle = currStrokeStyle;
};

function undo() {
	let poppedDraw = drawStack.pop();
	if (poppedDraw !== undefined) {
		undoStack.push(poppedDraw);
		rePaint();
	}
}

function redo() {
	let redoDraw = undoStack.pop();
	if (redoDraw !== undefined) {
		drawStack.push(redoDraw);
		rePaint();
	}
}

function setLineWidth(width) {
	ctx.lineWidth = width;
}

function setLineColor(colorCode) {
	ctx.strokeStyle = colorCode;
}

function moveItems() {
	let strokeList = [];

	drawStack.forEach(stroke => {
		stroke.forEach(dot => {
			if(dot.fromX >= 0 && dot.toX <= window.innerWidth && dot.fromY >= 0 && dot.toY <= window.innerHeight - 100) {
				if (!strokeList.includes(stroke)) {
					strokeList.push(stroke);
				}
			}
		});
	});

	strokeList.forEach(stroke => {
		stroke.forEach(dot => {
			dot.fromX = dot.fromX + 200
			dot.toX = dot.toX + 200
			dot.fromY = dot.fromY + 100
			dot.toY = dot.toY + 100
		});
	});
	rePaint();
}

function toggleMove() {
	if (move) {
		move = false;
	} else {
		move = true;
	}
}

function savePainting() {
	savedPaintings.push(drawStack);
	localStorage.setItem("paintings", JSON.stringify(savedPaintings));
}

function loadPainting(index) {
	for (let i = 0; i < savedPaintings.length; i++) {
		if (i == index) {
			rePaint(savedPaintings[i]);
		}
	}
}

function loadSavedPaintings() {
	for (let i = 0; i < savedPaintings.length; i++) {
		let savedOptions = document.getElementById("saved")
		let option = document.createElement('option');
    	option.value = i;
    	option.innerHTML = i;
    	savedOptions.appendChild(option);
	};
}

function init() {
	// Initialize draw and undo stacks
	drawStack = [];
	undoStack = [];
	
	// Find the canvas element and set the size
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight - 100;
	
	mouse = {x: 0, y: 0};

	// Load saved paintings into dropdown
	savedPaintings = JSON.parse(localStorage.getItem("paintings"));
	if(savedPaintings === null) { savedPaintings = []; }
	loadSavedPaintings();

	// Update mouse position on mousemove
	canvas.addEventListener('mousemove', function(e) {
	  mouse.x = e.pageX - this.offsetLeft;
	  mouse.y = e.pageY - this.offsetTop;
	}, false);
	
	// Initial draw tool settings
	ctx.lineWidth = 10;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	ctx.strokeStyle = '#000';
	
	// Mousedown / mousemove listener
	canvas.addEventListener('mousedown', function(e) {
		canvas.drawStroke = [];
		canvas.drawDot = { index: index, fromX: mouse.x, fromY: mouse.y }

		if (move === true) {
			moveItems();
		}
		
	    ctx.beginPath();
	    ctx.moveTo(mouse.x, mouse.y);
	 	paint();
	    canvas.addEventListener('mousemove', paint, false);
	}, false);
	 
	// Mouseup listener
	canvas.addEventListener('mouseup', function() {
	    canvas.removeEventListener('mousemove', paint, false);
	    console.log(canvas.drawStroke);
	    drawStack.push(canvas.drawStroke);
	    index++;
	}, false);
}

window.addEventListener('load', init, false);
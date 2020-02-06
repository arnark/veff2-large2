var canvas,
    ctx,
    mouse,
    drawStack,
    undoStack;

function paint() {
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();

    // Push the drawDot to the drawStroke array
    canvas.drawDot.toX = mouse.x;
    canvas.drawDot.toY = mouse.y;
	canvas.drawStroke.push(canvas.drawDot);

	// Reset drawDot
	canvas.drawDot = { fromX: mouse.x, fromY: mouse.y };
};

function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function rePaint() {
	// Completely repaint each dot on the canvas from the drawStack
	drawStack.forEach(stroke => {
		stroke.forEach(dot => {
  			ctx.beginPath();
    		ctx.moveTo(dot.fromX, dot.fromY);
    		ctx.lineTo(dot.toX, dot.toY);
    		ctx.stroke();
		});
	});
};

function undo() {
	let poppedDraw = drawStack.pop();
	if (poppedDraw !== undefined) {
		undoStack.push(poppedDraw);
		clearCanvas();
		rePaint();
	}
}

function redo() {
	let redoDraw = undoStack.pop();
	if (redoDraw !== undefined) {
		drawStack.push(redoDraw);
		clearCanvas();
		rePaint();
	}
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
		canvas.drawDot = { fromX: mouse.x, fromY: mouse.y }
	    ctx.beginPath();
	    ctx.moveTo(mouse.x, mouse.y);
	 	paint();
	    canvas.addEventListener('mousemove', paint, false);
	}, false);
	 
	// Mouseup listener
	canvas.addEventListener('mouseup', function() {
	    canvas.removeEventListener('mousemove', paint, false);
	    drawStack.push(canvas.drawStroke);
	}, false);
}

window.addEventListener('load', init, false);
// Initialize draw and undo stacks
let drawStack = [];
let undoStack = [];

// Find the canvas element and set the size
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;

let mouse = {x: 0, y: 0};

// Update mouse position on mousemove
canvas.addEventListener('mousemove', function(e) {
  mouse.x = e.pageX - this.offsetLeft;
  mouse.y = e.pageY - this.offsetTop;
}, false);

// Draw tool settings
ctx.lineWidth = 10;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.strokeStyle = '#000';

canvas.addEventListener('mousedown', function(e) {
	canvas.drawStroke = [];
	canvas.drawDot = { fromX: mouse.x, fromY: mouse.y }
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
 	onPaint();
    canvas.addEventListener('mousemove', onPaint, false);
}, false);
 
canvas.addEventListener('mouseup', function() {
    canvas.removeEventListener('mousemove', onPaint, false);
    drawStack.push(canvas.drawStroke);
}, false);

var onPaint = function() {

    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();

    // Push the drawDot to the drawStroke array
    canvas.drawDot.toX = mouse.x;
    canvas.drawDot.toY = mouse.y;
	canvas.drawStroke.push(canvas.drawDot);

	// Reset drawDot
	canvas.drawDot = { fromX: mouse.x, fromY: mouse.y };
};

var clearCanvas = function() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

var rePaint = function() {
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

var undo = function() {
	let poppedDraw = drawStack.pop();
	if (poppedDraw !== undefined) {
		undoStack.push(poppedDraw);
		clearCanvas();
		rePaint();
	}
}

var redo = function() {
	let redoDraw = undoStack.pop();
	if (redoDraw !== undefined) {
		drawStack.push(redoDraw);
		clearCanvas();
		rePaint();
	}
}

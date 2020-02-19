var canvas,
	ctx,
	mouse,
	tool,
	drawStack,
	undoStack,
	startX,
	startY,
	moveFromX,
	moveToX,
	moveFromY,
	moveToY,
	savedPaintings,
	textFont,
	fontSize,     
	textInputStartX,
	strokeList = [],
	move = false,
	areaSelected = false;

function init() {

	// Initialize draw and undo stacks
	drawStack = [];
	undoStack = [];

	// Find the canvas element and set the size
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight - 70;

	// Initial draw tool settings
	ctx.lineWidth = 10;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	ctx.strokeStyle = '#000';
	tool = 'pencil';
	mouse = { x: 0, y: 0 };

	// Text input
	canvas.setAttribute('tabindex','0');
	ctx.font ='16px Arial';
	ctx.fillStyle = '#000';
	textFont = 'Arial';
	fontSize = '16';

	// Load saved paintings into dropdown
	savedPaintings = JSON.parse(localStorage.getItem("paintings"));
	if (savedPaintings === null) { savedPaintings = []; }
	loadSavedPaintings();

	// Update mouse position on mousemove
	canvas.addEventListener('mousemove', function (e) {
		mouse.x = e.pageX - this.offsetLeft;
		mouse.y = e.pageY - this.offsetTop;
	}, false);

	// Text input listener
	canvas.addEventListener('keydown', function(e) {
		paint(e);
	}, false);

	// Mousedown / mousemove listener
	canvas.addEventListener('mousedown', function (e) {

		startX = mouse.x;
		startY = mouse.y;
		textInputStartX = mouse.x;

		// Move is toggled
		if (move === true) {
			if (areaSelected === false) {
				canvas.addEventListener('mousemove', paintSelectedArea, false);
			} else {
				removeSelectedArea();
				strokeList = [];
				canvas.addEventListener('mousemove', moveItems, false);
			}
		} 
		// Draw is toggled
		else {
			canvas.drawStroke = [];
			canvas.drawDot = { fromX: mouse.x, fromY: mouse.y }

			ctx.beginPath();
			ctx.moveTo(mouse.x, mouse.y);
			paint();
			canvas.addEventListener('mousemove', paint, false);
		}

	}, false);

	// Mouseup listener
	canvas.addEventListener('mouseup', function () {

		// Move is toggled
		if (move === true) {
			if (areaSelected === false) {
				areaSelected = true;
				canvas.removeEventListener('mousemove', paintSelectedArea, false);
				removeSelectedArea();
			} else {
				areaSelected = false;
				toggleMove();
				canvas.removeEventListener('mousemove', moveItems, false);
			}
		}
		// Draw is toggled
		else {
			canvas.removeEventListener('mousemove', paint, false);
			drawStack.push(canvas.drawStroke);
		}

	}, false);

}

// Import all functions
document.write("<script src='js/paint.js'></script>");
document.write("<script src='js/styling.js'></script>");
document.write("<script src='js/move.js'></script>");
document.write("<script src='js/save.js'></script>");
document.write("<script src='js/stack.js'></script>");
document.write("<script src='js/icon.js'></script>");

window.addEventListener('load', init, false);
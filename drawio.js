var canvas,
    ctx,
    mouse,
    drawStack,
    undoStack,
    paintCoords,
    startX,
    startY,
    moveFromX,
    moveToX,
    moveFromY,
    moveToY,
    savedPaintings,
    strokeList = [],
    move = false,
    areaSelected = false,
    index = 0;
    

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

function removeSelectedArea() {
    let selectedArea = document.getElementById("selected-area");
    if (selectedArea) {
    	selectedArea.remove();
    }
    document.getElementById("canvas-move").style.cursor = "move";
}

function paintSelectedArea() {

	moveFromX = startX;
    moveToX = mouse.x;
    moveFromY = startY;
    moveToY = mouse.y;

	if (!document.getElementById("selected-area")) {
		let selectedAreaDiv = document.createElement("div");
  		selectedAreaDiv.id = "selected-area";
  		document.getElementById("canvas-container").appendChild(selectedAreaDiv);
	}

	let selectedArea = document.getElementById("selected-area");

	// Default height and styles
  	let height = moveToY - moveFromY;
  	let width = moveToX - moveFromX;
  	selectedArea.style.top = moveFromY + 100 + "px";
  	selectedArea.style.left = moveFromX + "px";

  	// Updated given circumstances
  	if (height < 0) {
  		height = moveFromY - 5 - moveToY;
  		selectedArea.style.top = moveFromY + 100 - height + "px";
  	}

  	if (width < 0) {
  		width = moveFromX - 5 - moveToX;
  		selectedArea.style.left = moveFromX - width + "px";
  	}

  	// Set width and height
  	selectedArea.style.height = height - 5 + "px";
  	selectedArea.style.width = width - 5 + "px";

}

function moveItems() {

	// Select the elements that are to be moved
	if (strokeList.length === 0) {

		let height = moveToY - moveFromY;
  		let width = moveToX - moveFromX;

		drawStack.forEach(stroke => {
			stroke.forEach(dot => {
				// Check for all possible area selectors 
				if (height < 0) {
					if (dot.fromX >= moveFromX && dot.toX <= moveToX && dot.fromY <= moveFromY && dot.toY >= moveToY) {
						if (!strokeList.includes(stroke)) {
							strokeList.push(stroke);
						}
					} else if (dot.fromX <= moveFromX && dot.toX >= moveToX && dot.fromY <= moveFromY && dot.toY >= moveToY) {
						if (!strokeList.includes(stroke)) {
							strokeList.push(stroke);
						}
					}
				} else if (width < 0) {
					if (dot.fromX <= moveFromX && dot.toX >= moveToX && dot.fromY >= moveFromY && dot.toY <= moveToY) {
						if (!strokeList.includes(stroke)) {
							strokeList.push(stroke);
						}
					}
				} else {
					if (dot.fromX >= moveFromX && dot.toX <= moveToX && dot.fromY >= moveFromY && dot.toY <= moveToY) {
						if (!strokeList.includes(stroke)) {
							strokeList.push(stroke);
						}
					}
				}
			});
		});
	}

	// Get relative movement pixels to where the users clicks
	let Xmove = - startX + mouse.x;
	let Ymove = - startY + mouse.y;

	// Update each and every dot
	strokeList.forEach(stroke => {
		stroke.forEach(dot => {
			dot.fromX = dot.fromX + Xmove;
			dot.toX = dot.toX + Xmove;
			dot.fromY = dot.fromY + Ymove;
			dot.toY = dot.toY + Ymove;
		});
	});

	startX = mouse.x;
	startY = mouse.y;
	rePaint();
}

function toggleMove() {

	// Reset default
    areaSelected = false;
	strokeList = [];

	if (move) {
		document.getElementById("canvas-move").style.cursor = "auto";
		document.getElementById("canvas-move").id = "canvas";
		move = false;
	} else {
		document.getElementById("canvas").style.cursor = "crosshair";
		document.getElementById("canvas").id = "canvas-move";
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
			drawStack = savedPaintings[i];
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
	
	// Initial draw tool settings
	ctx.lineWidth = 10;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	ctx.strokeStyle = '#000';
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
	
	// Mousedown / mousemove listener
	canvas.addEventListener('mousedown', function(e) {
		// Move is toggled
		if (move === true) {
			startX = mouse.x;
			startY = mouse.y;
			
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
			canvas.drawDot = { index: index, fromX: mouse.x, fromY: mouse.y }
		
	    	ctx.beginPath();
	    	ctx.moveTo(mouse.x, mouse.y);
	 		paint();
	    	canvas.addEventListener('mousemove', paint, false);
	    }
	}, false);
	
	// Mouseup listener
	canvas.addEventListener('mouseup', function() {
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
	    	index++;
		}

	}, false);

}

window.addEventListener('load', init, false);
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

function paint(e = {}) {

	// Common attributes
	canvas.drawDot.lineWidth = ctx.lineWidth;
	canvas.drawDot.strokeStyle = ctx.strokeStyle;
	canvas.drawDot.tool = tool;

	if (tool === 'pencil') {
		ctx.lineTo(mouse.x, mouse.y);
		ctx.stroke();

		// Push the drawDot to the drawStroke array
		canvas.drawDot.toX = mouse.x;
		canvas.drawDot.toY = mouse.y;
		if (!canvas.drawStroke.includes(canvas.drawDot)) {
			canvas.drawStroke.push(canvas.drawDot);
		}

		// Reset drawDot
		canvas.drawDot = { fromX: mouse.x, fromY: mouse.y };

	} else if (tool === 'circle') {
		let radius = Math.abs(- startX + mouse.x);
		rePaint();
		ctx.beginPath();
		ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
		ctx.stroke();

		// Push circle to drawStroke array
		canvas.drawDot.arc = { xPos: startX, yPos: startY, radius: radius, sAngle: 0, eAngle: 2 * Math.PI };
		if (!canvas.drawStroke.includes(canvas.drawDot)) {
			canvas.drawStroke.push(canvas.drawDot);
		}

	} else if (tool === 'line') {

		// Create new line if it doesn't exist already
		if (canvas.drawStroke.length == 0) {
				canvas.drawDot.toX = mouse.x;
				canvas.drawDot.toY = mouse.y;

			if (!canvas.drawStroke.includes(canvas.drawDot)) {
				canvas.drawStroke.push(canvas.drawDot);
			}
		}
		
		// Update the line end position
		canvas.drawStroke[0].toX = mouse.x;
		canvas.drawStroke[0].toY = mouse.y;

		// Custom paint method while dragging line for animation		
		let dot = canvas.drawStroke[0];
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		rePaint();
		ctx.lineWidth = dot.lineWidth;
		ctx.strokeStyle = dot.strokeStyle;
		ctx.beginPath();
		ctx.moveTo(dot.fromX, dot.fromY);
		ctx.lineTo(dot.toX, dot.toY);
		ctx.stroke();

	} else if (tool === 'text' && 'key' in e) {
		// If enter is pressed go to next line
		if (e.keyCode === 13) {

			canvas.drawDot = {};
			startX = textInputStartX;
			startY += (fontSize ? parseInt(fontSize, 10) : 12) + 4;

			// DrawDot attributes
			canvas.drawDot.fromX = startX;
			canvas.drawDot.fromY = startY;
			canvas.drawDot.toX = startX + ctx.measureText(e.key).width;
			canvas.drawDot.toY = parseInt(startY) + parseInt(fontSize);
			canvas.drawDot.font = `${(fontSize ? fontSize : '12')}px ${(textFont ? textFont : 'Arial')}`;
			canvas.drawDot.fillStyle = ctx.fillStyle;
			canvas.drawDot.text = '';

			if (!canvas.drawStroke.includes(canvas.drawDot)) {
				canvas.drawStroke.push(canvas.drawDot);
			}

		}
		// Excludes Caps and shift will return text Shift and CapsLock
		else if (e.keyCode !== 9 && e.keyCode !== 20 && e.keyCode !== 16) {

			if (canvas.drawStroke.length == 0) {
				// DrawDot attributes
				canvas.drawDot.fromX = startX;
				canvas.drawDot.fromY = startY;
				canvas.drawDot.toX = startX + ctx.measureText(e.key).width;
				canvas.drawDot.toY = parseInt(startY) + parseInt(fontSize);
				canvas.drawDot.font = `${(fontSize ? fontSize : '12')}px ${(textFont ? textFont : 'Arial')}`;
				canvas.drawDot.fillStyle = ctx.fillStyle;
				canvas.drawDot.text = '';

				if (!canvas.drawStroke.includes(canvas.drawDot)) {
					canvas.drawStroke.push(canvas.drawDot);
				}
			}

			// Update the line end position
			canvas.drawStroke[canvas.drawStroke.length - 1].text += e.key;
			canvas.drawStroke[canvas.drawStroke.length - 1].toX = startX + ctx.measureText(canvas.drawStroke[canvas.drawStroke.length - 1].text).width;
			//canvas.drawStroke[canvas.drawStroke.length - 1].toY = ctx.measureText(canvas.drawStroke[canvas.drawStroke.length - 1].text).height;
			rePaint();
			startX += ctx.measureText(e.key).width;
		}
	} else if (tool === 'rectangle') {

		// Create new rect drawStroke if it doesn't exist
		if (canvas.drawStroke.length == 0) {

			canvas.drawDot.fromX = startX;
			canvas.drawDot.fromY = startY;
			canvas.drawDot.toX = - startX + mouse.x;
			canvas.drawDot.toY = - startY + mouse.y;

			if (!canvas.drawStroke.includes(canvas.drawDot)) {
				canvas.drawStroke.push(canvas.drawDot);
			}
		}
		
		canvas.drawStroke[0].fromX = startX;
		canvas.drawStroke[0].fromY = startY;
		canvas.drawStroke[0].toX = - startX + mouse.x;
		canvas.drawStroke[0].toY = - startY + mouse.y;

		rePaint();
		ctx.beginPath();
		ctx.rect(startX, startY, - startX + mouse.x, - startY + mouse.y);
		ctx.stroke();
	}
};

function rePaint(stack = drawStack) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Preserver current settings
	let currLineWidth = ctx.lineWidth;
	let currStrokeStyle = ctx.strokeStyle;
	let oldFont = ctx.font;
	let oldFillStyle = ctx.fillStyle;

	// Completely repaint each dot on the canvas from the drawStack
	stack.forEach(stroke => {
		stroke.forEach(dot => {
			if (dot.tool === 'pencil' || dot.tool === 'line') {
				ctx.lineWidth = dot.lineWidth;
				ctx.strokeStyle = dot.strokeStyle;
				ctx.beginPath();
				ctx.moveTo(dot.fromX, dot.fromY);
				ctx.lineTo(dot.toX, dot.toY);
				ctx.stroke();
			} else if (dot.tool === 'circle') {
				ctx.lineWidth = dot.lineWidth;
				ctx.strokeStyle = dot.strokeStyle;
				ctx.beginPath();
				ctx.arc(dot.arc.xPos, dot.arc.yPos, dot.arc.radius, dot.arc.sAngle, dot.arc.eAngle);
				ctx.stroke();
			} else if (dot.tool === 'text') {
				ctx.font = dot.font;
				ctx.fillStyle = dot.fillStyle;
				ctx.fillText(dot.text, dot.fromX, dot.fromY);
			} else if (dot.tool === 'rectangle') {
				ctx.beginPath();
				ctx.rect(dot.fromX, dot.fromY, dot.toX, dot.toY);
				ctx.stroke();
			}
		});
	});

	// Revert to old settings
	ctx.lineWidth = currLineWidth;
	ctx.strokeStyle = currStrokeStyle;
	ctx.font = oldFont;
	ctx.fillStyle = oldFillStyle;
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
	ctx.fillStyle = colorCode;
}

function setPencilType(pencilType) {
	tool = pencilType;
}

function setFontSize(_fontSize) {
	fontSize = _fontSize;
	ctx.font = `${fontSize}px ${(textFont ? textFont : 'Arial')}`;
}

function setTextFont(_textFont) {
	textFont = _textFont;
	ctx.font = `${(fontSize ? fontSize : '12')}px ${textFont}`;
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
	selectedArea.style.top = moveFromY + 70 + "px";
	selectedArea.style.left = moveFromX + "px";

	// Updated given circumstances
	if (height < 0) {
		height = moveFromY - 5 - moveToY;
		selectedArea.style.top = moveFromY + 70 - height + "px";
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
				if (dot.tool === 'pencil' || dot.tool === 'line' || dot.tool === 'text' || dot.tool === 'rectangle') {

					// Check for all possible elements within selected area
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

				} else if (dot.tool === 'circle') {

					// Reused values
					let fromX = dot.arc.xPos - dot.arc.radius;
					let toX = dot.arc.xPos + dot.arc.radius;
					let fromY = dot.arc.yPos - dot.arc.radius;
					let toY = dot.arc.yPos + dot.arc.radius;

					// Check if selected area contains a circle
					if (height < 0) {
						if (fromX >= moveFromX && fromY <= moveFromY) {
							if (!strokeList.includes(stroke)) {
								strokeList.push(stroke);
							}
						} else if (fromX <= moveFromX && toX >= moveToX && fromY <= moveFromY && toY >= moveToY) {
							if (!strokeList.includes(stroke)) {
								strokeList.push(stroke);
							}
						}
					} else if (width < 0) {
						if (fromX <= moveFromX & toX >= moveToX && fromY >= moveFromY && toY <= moveToY) {
							if (!strokeList.includes(stroke)) {
								strokeList.push(stroke);
							}
						}
					} else {
						if (fromX >= moveFromX & toX <= moveToX && fromY >= moveFromY & toY <= moveToY) {
							if (!strokeList.includes(stroke)) {
								strokeList.push(stroke);
							}
						}
					}

				}

			});
		});
	}

	// Get relative movement pixels to where the users clicks
	let xMove = - startX + mouse.x;
	let yMove = - startY + mouse.y;

	// Update each and every dot
	strokeList.forEach(stroke => {
		stroke.forEach(dot => {
			if (dot.tool === 'pencil' || dot.tool === 'line' || dot.tool === 'text') {
				dot.fromX += xMove;
				dot.toX += xMove;
				dot.fromY += yMove;
				dot.toY += yMove;
			} else if (dot.tool === 'circle') {
				dot.arc.xPos += xMove;
				dot.arc.yPos += yMove;
			} else if (dot.tool === 'rectangle') {
				dot.fromX += xMove;
				dot.fromY += yMove;
			}
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
		$('.icon').removeClass('selected');
		move = false;
	} else {
		document.getElementById("canvas").style.cursor = "crosshair";
		document.getElementById("canvas").id = "canvas-move";
		move = true;
	}
}

function savePainting() {
	let saveName = prompt("Name of this masterpiece: ", "The Scream");
	savedPaintings.push({ artName: saveName, drawData: drawStack });
	localStorage.setItem("paintings", JSON.stringify(savedPaintings));
	alert("Painting saved successfully!");
}

function loadPainting(index) {
	for (let i = 0; i < savedPaintings.length; i++) {
		if (i == index) {
			drawStack = savedPaintings[i].drawData;
			rePaint(savedPaintings[i].drawData);
		}
	}
}

function loadSavedPaintings() {
	for (let i = 0; i < savedPaintings.length; i++) {
		let savedOptions = document.getElementById("saved")
		let option = document.createElement('option');
		option.value = i;
		option.innerHTML = savedPaintings[i].artName;
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

window.addEventListener('load', init, false);
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
				if (dot.tool === 'pencil' || dot.tool === 'line' || dot.tool === 'text' || dot.tool === 'rectangle' || dot.tool === 'circle') {

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
			dot.fromX += xMove;
			dot.fromY += yMove;
			dot.toX += xMove;
			dot.toY += yMove;
			if (dot.tool === 'circle') {
				dot.arc.xPos += xMove;
				dot.arc.yPos += yMove;
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

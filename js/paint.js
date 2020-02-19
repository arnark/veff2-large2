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
		canvas.drawDot.fromX = startX - radius;
		canvas.drawDot.fromY = startY - radius;
		canvas.drawDot.toX = startX + radius;
		canvas.drawDot.toY = startY + radius;

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
			canvas.drawDot.toX = ctx.measureText(e.key).width + startX;
			canvas.drawDot.toY = parseInt(startY) + parseInt(fontSize);
			canvas.drawDot.font = `${(fontSize ? fontSize : '12')}px ${(textFont ? textFont : 'Arial')}`;
			canvas.drawDot.fillStyle = ctx.fillStyle;
			canvas.drawDot.text = '';

			if (!canvas.drawStroke.includes(canvas.drawDot)) {
				canvas.drawStroke.push(canvas.drawDot);
			}

		} else if (e.keyCode !== 9 && e.keyCode !== 20 && e.keyCode !== 16 && e.keyCode !== 8) {

			// Excludes Caps and shift will return text Shift and CapsLock
			if (canvas.drawStroke.length == 0) {
				// DrawDot attributes
				canvas.drawDot.fromX = startX;
				canvas.drawDot.fromY = startY;
				canvas.drawDot.toX = ctx.measureText(e.key).width + startX;
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
			canvas.drawStroke[canvas.drawStroke.length - 1].toX += ctx.measureText(e.key).width;

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
		
		let sizeX = - startX + mouse.x;
		let sizeY = - startY + mouse.y;
		canvas.drawStroke[0].fromX = startX;
		canvas.drawStroke[0].fromY = startY;
		canvas.drawStroke[0].toX = startX + sizeX;
		canvas.drawStroke[0].toY = startY + sizeY;
		canvas.drawStroke[0].sizeX = sizeX;
		canvas.drawStroke[0].sizeY = sizeY;

		rePaint();
		ctx.beginPath();
		ctx.rect(startX, startY, - startX + mouse.x, - startY + mouse.y);
		ctx.stroke();
	}
};

function rePaint(stack = drawStack) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Preserve current settings
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
				ctx.lineWidth = dot.lineWidth;
				ctx.strokeStyle = dot.strokeStyle;
				ctx.beginPath();
				ctx.rect(dot.fromX, dot.fromY, dot.sizeX, dot.sizeY);
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

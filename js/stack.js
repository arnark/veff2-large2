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

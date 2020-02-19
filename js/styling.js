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
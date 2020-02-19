function savePainting() {
	let saveName = prompt("Name of this masterpiece: ", "The Scream");
	if (saveName !== null) {
		savedPaintings.push({ artName: saveName, drawData: drawStack });
		localStorage.setItem("paintings", JSON.stringify(savedPaintings));
		alert("Painting saved successfully!");

		let savedOptions = document.getElementById("saved")
		let option = document.createElement('option');
		option.value = savedPaintings.length - 1;
		option.innerHTML = savedPaintings[savedPaintings.length - 1].artName;
		$("#saved").append(option)

	}
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

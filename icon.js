$('.icon').on('click', function () {
    $('.icon').removeClass('selected');
    $(this).addClass('selected');
    var myTitle = $(this).attr('title');
    $(this).click(setPencilType(myTitle));
});


$('.colorpick').on('click', function () {
    $('.colorpick').removeClass('selectedTwo');
    $(this).addClass('selectedTwo');
    var colorTitle = $(this).attr('title');
    $(this).click(setLineColor(colorTitle));
});


// Adds the saved painting to the load select
$(function() {
    $("#savepainting").click(function() {
		let savedOptions = document.getElementById("saved")
		let option = document.createElement('option');
		option.value = savedPaintings.length - 1;
		option.innerHTML = savedPaintings[savedPaintings.length - 1].artName;
       $("#saved").append(option)
    })
  })
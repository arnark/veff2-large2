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

window.onload = function() {
    $('#loading-spiner').css('display', 'none')
    $('#main-container').css('display', 'inherit')
    $('#menuHeader').css('display', 'inherit')
    $('.parallax-container').css('display', 'inherit')
    $('html, body').animate({
        scrollTop: 2
    }, 50);
    return false;
}

$(".button-collapse").sideNav();

window.setTimeout(function() {
}, 100);


$(document).ready(function() {
    $('.parallax').parallax();
});

$(document).ready(function() {
    $('.scrollspy').scrollSpy();
});


window.setTimeout(function() {

}, 50);


$(".button-check").click(function(evt) {

    evt.currentTarget.children[1].src = "contents/check-ativo.png";

});


$(document).ready(function() {
    $('.materialboxed').materialbox();
});


$(document).ready(function() {
    $('.carousel').carousel();
});

UIkit.grid(element, options);

$(function() {
    var nav = $('#menuHeader');
    $(window).scroll(function() {
        if ($(this).scrollTop() > 500) {
            nav.addClass("menu-fixo");
            $('body').css('padding-top', 70);
        } else {
            nav.removeClass("menu-fixo");
            $('body').css('padding-top', 0);
        }
    });
});
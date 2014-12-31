/*
 * DYNAMIC STYLING
 */


// Dynamic styling
Template.layout.rendered = function() {
    wWidth = $(window).width();
    wHeight = $(window).height();

    $('div.background-image').height(wHeight);
    $('div.background-gradient').height(wHeight);
    $('div.wrapper').height(wHeight);
    $('div.pane').height(wHeight);
}
/*
 * DYNAMIC STYLING
 */


// Dynamic styling
Template.layout.rendered = function() {
    wWidth = $(window).width();
    wHeight = $(window).height();

    $('div.background-effects').height(wHeight);
    $('div.pane').height(wHeight);
}
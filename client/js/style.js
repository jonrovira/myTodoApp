/*
 * DYNAMIC STYLING
 */


// Dynamic styling
Template.layout.rendered = function() {
    wHeight = $(window).height();

    $('div.background-effects').height(wHeight);
    $('section#dashboard-main').height(wHeight - $('section#dashboard-main').offset().top);
    $('section#dashboard-pane').height(wHeight - $('section#dashboard-header').offset().top);
}


Template.commitment.rendered = function() {
	$('ul.task-list').each(function() {
		var w = 0

		$(this).children('li.task').each(function() {
			w += $(this).width();
		});

		$(this).width(w);
	});
}
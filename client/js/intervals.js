/*
 * METEOR INTERVALS
 */


var updateTaskAge = function(age, createdAt) {
	var startColor = [136, 219, 97];
	var endColor   = [250, 107, 91];
	var endColorString = "rgb(" + endColor[0] + ", " + endColor[1] + ", " + endColor[2] + ")";
	var dr = endColor[0] - startColor[0];
	var dg = endColor[1] - startColor[1];
	var db = endColor[2] - startColor[2];

	var diff = new Date() - createdAt;
	var frac = diff / 86400000;
	var yMax = $('li.task').height();
	var yNew = Math.round(yMax * frac);
	var cNew = [Math.round((dr * frac) + startColor[0]), 
	            Math.round((dg * frac) + startColor[1]),
	            Math.round((db * frac) + startColor[2])];
	var cString = "rgb(" + cNew[0] + ", " + cNew[1] + ", " + cNew[2] + ")";

	if (yNew < yMax) {
		$(age).height(yNew);
		$(age).css('background-color', cString);
	}
	else {
		$(age).height(yMax);
		$(age).css('background-color', endColorString);
	}
};


Template.task.rendered = function() {
	var age       = this.find('div.task-age');
	var createdAt = this.data.createdAt;

	updateTaskAge(age, createdAt);
	Meteor.setInterval(function() {
		updateTaskAge(age, createdAt);
	}, 5000);
}
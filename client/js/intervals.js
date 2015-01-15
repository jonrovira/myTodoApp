/*
 * METEOR INTERVALS
 */

// Helper Functions
 var arrayToRgb = function(a) {
 	return "rgb(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
 }
 var interpolateColor = function(min, max, frac) {
 	var dr = max[0] - min[0];
 	var dg = max[1] - min[1];
 	var db = max[2] - min[2];
 	var color = [Math.round((dr * frac) + min[0]), 
	             Math.round((dg * frac) + min[1]),
	             Math.round((db * frac) + min[2])];
	return arrayToRgb(color);
 }



var updateTaskAge = function(age, createdAt) {
	var minColor  = [136, 219, 97];
	var maxColor  = [250, 107, 91];
	var doneColor = [114, 92, 164];
	var maxRgb    = arrayToRgb(maxColor);
	var doneRgb   = arrayToRgb(doneColor);

	var diff = new Date() - createdAt;
	var frac = diff / 86400000; //86400000 ms per day
	var yMax = $('li.task').height();
	var yNew = Math.round(yMax * frac);

	var newRgb = interpolateColor(minColor, maxColor, frac);

	if (yNew < yMax) {
		$(age).height(yNew);
		$(age).css('background-color', newRgb);
	}
	else {
		$(age).height(yMax);
		$(age).css('background-color', maxRgb);
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
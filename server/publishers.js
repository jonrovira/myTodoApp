/*
 * APPLICATION PUBLISHERS
 */


 /* Publish commitments collection */
 Meteor.publish("commitments", function() {
     return Commitments.find();
 });

 /* Publish tasks collection */
 Meteor.publish("tasks", function() {
     return Tasks.find();
 });
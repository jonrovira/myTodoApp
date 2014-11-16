Commitments = new Mongo.Collection("commitments");
Tasks       = new Mongo.Collection("tasks");


if (Meteor.isClient) {

    /* body */
    Template.body.helpers({
        commitments: function() {
            return Commitments.find({}, {sort: {createdAt: -1}});
        }
    });

    /* addCommitment */
    Template.addCommitment.events({
        "submit form": function(event) {

            // Get new commitment string
            var text = event.target.commitment.value;

            // Add commitment to commitments collection
            Commitments.insert({
                commitment: text,
                createdAt: new Date()
            });

            // Cleanup: clear input, void default submit
            event.target.commitment.value = "";
            return false;
        }
    });

    /* addTask */
    Template.addTask.events({
        "submit form": function(event) {

            // Get new task string
            var task = event.target.task.value;

            // Add task to tasks collection
            Tasks.insert({
                task: task,
                createdAt: new Date() 
            });

            // Cleanup: clear input, void default submit
            event.target.task.value = "";
            return false;
        }
    });

    /* commitment */
    Template.commitment.helpers({
        tasks: function() {
            return Tasks.find({}, {sort: {createdAt: -1}});
        }
    });
    Template.commitment.events({
        "click .toggle-checked": function() {
            Commitments.update(this._id, {$set: {checked: ! this.checked}});
        },
        "click .delete": function() {   
            Commitments.remove(this._id);
        }
    });
}




if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}

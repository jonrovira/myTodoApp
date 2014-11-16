Commitments = new Mongo.Collection("commitments");
Tasks       = new Mongo.Collection("tasks");


if (Meteor.isClient) {

    /* body */
    Template.body.helpers({
        commitments: function() {
            if (Session.get("hideCompleted")) {
                  return Commitments.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
            }
            else {
                return Commitments.find({}, {sort: {createdAt: -1}});
            }
        },
        incompleteCount: function () {
            return Tasks.find({checked: {$ne: true}}).count();
        }
    });

    /* hideCompleted */
    Template.hideCompleted.helpers({
        hideCompleted: function() {
            return Session.get("hideCompleted");
        }
    });
    Template.hideCompleted.events({
        "change input": function (event) {
            Session.set("hideCompleted", event.target.checked);
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

    /* task */
    Template.task.events({
        "click .toggle-checked": function() {
            Tasks.update(this._id, {$set: {checked: ! this.checked}});
        },
        "click .delete": function() {
            Tasks.remove(this._id);
        }
    });
}




if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}

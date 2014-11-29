Commitments = new Mongo.Collection("commitments");
Tasks       = new Mongo.Collection("tasks");


if (Meteor.isClient) {

    Meteor.subscribe("commitments");
    Meteor.subscribe("tasks");

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
            Meteor.call("addCommitment", text);

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
                createdAt: new Date(),
                owner: Meteor.userId(),
                username: Meteor.user().username
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
        },
        isOwner: function() {
            return this.owner === Meteor.userId();
        }
    });
    Template.commitment.events({
        "click .toggle-checked": function() {
            Commitments.update(this._id, {$set: {checked: ! this.checked}});
        },
        "click .delete": function() {   
            Commitments.remove(this._id);
        },
        "click .toggle-private": function() {
            Meteor.call("setPrivate", this._id, ! this.private);
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

    /* Meteor Accounts */
    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}


Meteor.methods({
    addCommitment: function (text) {
        // Make sure the user is logged in before inserting a task
        if (! Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        Commitments.insert({
            commitment: text,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username
        });
    },
    deleteCommitment: function (commitmentId) {
        var commitment = Commitments.findOne(commitmentId);

        if (commitment.private && commitment.owner !== Meteor.userId()) {
            // If the commitment is private, make sure only the owner can delete it
            throw new Meteor.Error("not-authorized");
        }
        Commitments.remove(commitmentId);
    },
    setChecked: function (commitmentId, setChecked) {
        var commitment = Commitments.findOne(commitmentId);

        if (commitment.private && commitment.owner !== Meteor.userId()) {
            // If the commitment is private, make sure only the owner can check it off
            throw new Meteor.Error("not-authorized");
        }
        
        Commitments.update(commitmentId, { $set: { checked: setChecked} });
    },
    setPrivate: function (commitmentId, setToPrivate) {
        var commitment = Commitments.findOne(commitmentId);

        if (commitment.owner !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        Commitments.update(commitmentId, { $set: { private: setToPrivate } });
    }
});




if (Meteor.isServer) {

    /* Publishers */
    Meteor.publish("commitments", function() {
        return Commitments.find({
            $or: [
                { private: {$ne: true} },
                { owner: this.userId }
            ]
        });
    });
    Meteor.publish("tasks", function() {
        return Tasks.find();
    });



    Meteor.startup(function () {
        // code to run on server at startup
    });
}

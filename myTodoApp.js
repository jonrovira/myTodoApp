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
        "submit form": function(event, template) {

            // Get new task string
            var taskContent  = event.target.task.value;
            var commitmentId = template.data._id;

            // Add task to tasks collection
            Meteor.call("addTask", taskContent, commitmentId);

            // Cleanup: clear input, void default submit
            event.target.task.value = "";
            return false;
        }
    });

    /* commitment */
    Template.commitment.helpers({
        tasks: function() {
            var commitmentId = this._id;
            return Tasks.find({commitmentId: commitmentId}, {sort: {createdAt: -1}});
        },
        isOwner: function() {
            return this.owner === Meteor.userId();
        }
    });
    Template.commitment.events({
        "click .commitment-toggle-checked": function() {
            Meteor.call("setCommitmentChecked", this._id, !this.checked);
        },
        "click .commitment-delete": function() {   
            Meteor.call("deleteCommitment", this._id);
        },
        "click .commitment-toggle-private": function() {
            Meteor.call("setPrivate", this._id, !this.private);
        }
    });

    /* task */
    Template.task.events({
        "click .task-toggle-checked": function() {
            Meteor.call("setTaskChecked", this._id, !this.checked);
        },
        "click .task-delete": function() {
            Meteor.call("deleteTask", this._id);
        }
    });

    /* twilio playground */
    Template.twilioPlayground.events({
        "click button.send": function () {
            Meteor.call("sendSMS");
        },
        "click button.list": function () {
            Meteor.call("listSMS");
        }
    });

    /* Meteor Accounts */
    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}




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


    /* Methods */
    Meteor.methods({
        addCommitment: function (name) {
            // Make sure the user is logged in before inserting a commitment
            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }

            Commitments.insert({
                commitmentName: name,
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
        addTask: function (taskContent, commitmentId) {
            // Make sure the user is logged in before inserting a task
            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }

            Tasks.insert({
                task: taskContent,
                commitmentId: commitmentId,
                createdAt: new Date(),
                owner: Meteor.userId(),
                username: Meteor.user().username
            });
        },
        deleteTask: function (taskId) {
            var task = Tasks.findOne(taskId);

            if (task.owner !== Meteor.userId()) {
                // Make sure the task is owned by the current user
                throw new Meteor.Error("not-authorized");
            }
            Tasks.remove(taskId);
        },
        setCommitmentChecked: function (commitmentId, setChecked) {
            var commitment = Commitments.findOne(commitmentId);

            if (commitment.private && commitment.owner !== Meteor.userId()) {
                // If the commitment is private, make sure only the owner can check it off
                throw new Meteor.Error("not-authorized");
            }

            Commitments.update(commitmentId, {$set: {checked: setChecked} });
        },
        setTaskChecked: function (taskId, setChecked) {
            var task = Tasks.findOne(taskId);

            if (task.owner !== Meteor.userId()) {
                // Make sure owner is current user
                throw new Meteor.Error("not-authorized");
            }

            Tasks.update(taskId, { $set: { checked: setChecked} });
        },
        setPrivate: function (commitmentId, setToPrivate) {
            var commitment = Commitments.findOne(commitmentId);

            if (commitment.owner !== Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }

            Commitments.update(commitmentId, { $set: { private: setToPrivate } });
        },
        sendSMS: function () {
            twilio = Twilio('ACb1ab2eb7e44612d7dfa05a6679792ed3', '631a30a7f6f2c1d59ea35419197b70da');
            twilio.sendSms({
                to:'+17199634882', 
                from: '+17194530451', 
                body: 'word to your mother.'
            }, function(err, responseData) { //this function is executed when a response is received from Twilio
                if (!err) { // "err" is an error received during the request, if any
                  // "responseData" is a JavaScript object containing data received from Twilio.
                  // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
                  // http://www.twilio.com/docs/api/rest/sending-sms#example-1
                  console.log(responseData.from); // outputs "+14506667788"
                  console.log(responseData.body); // outputs "word to your mother."
                }
                else {
                    console.log(err);
                }
            });
        },
        listSMS: function () {
            twilio = Twilio('ACb1ab2eb7e44612d7dfa05a6679792ed3', '631a30a7f6f2c1d59ea35419197b70da');
            twilio.listSms({
                from:'+17199634882'
            }, function (err, responseData) {
                responseData.smsMessages.forEach(function(message) {
                    console.log('Message sent on: '+message.dateCreated.toLocaleDateString());
                    console.log(message.body);
                });
            });
        }
    });



    Meteor.startup(function () {
        // code to run on server at startup
    });
}



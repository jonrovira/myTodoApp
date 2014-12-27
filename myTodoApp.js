Commitments = new Mongo.Collection("commitments");
Tasks       = new Mongo.Collection("tasks");


if (Meteor.isClient) {

    Meteor.subscribe("commitments");
    Meteor.subscribe("tasks");

    /* body */
    Template.home.helpers({
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
            var original = event.target.commitment.value;
            normalized = original.toLowerCase();

            // Add commitment to commitments collection
            Meteor.call("addCommitment", original, normalized);

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
        }
    });
    Template.commitment.events({
        "click .commitment-toggle-checked": function() {
            Meteor.call("setCommitmentChecked", this._id, !this.checked);
        },
        "click .commitment-delete": function() {   
            Meteor.call("deleteCommitment", this._id);
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
        return Commitments.find();
    });
    Meteor.publish("tasks", function() {

        return Tasks.find();
    });


    /* Methods */
    Meteor.methods({
        addCommitment: function (original, normalized) {
            Commitments.insert({
                commitmentName: original,
                normalizedName: normalized,
                createdAt: new Date()
            });
        },
        deleteCommitment: function (commitmentId) {
            var commitment = Commitments.findOne(commitmentId);
            Commitments.remove(commitmentId);
        },
        addTask: function (taskContent, commitmentId) {
            Tasks.insert({
                task: taskContent,
                commitmentId: commitmentId,
                createdAt: new Date(),
            });
        },
        deleteTask: function (taskId) {
            var task = Tasks.findOne(taskId);
            Tasks.remove(taskId);
        },
        setCommitmentChecked: function (commitmentId, setChecked) {
            var commitment = Commitments.findOne(commitmentId);
            Commitments.update(commitmentId, {$set: {checked: setChecked} });
        },
        setTaskChecked: function (taskId, setChecked) {
            var task = Tasks.findOne(taskId);
            Tasks.update(taskId, { $set: { checked: setChecked} });
        },
        sendSMS: function () {
            twilio = Twilio('ACb1ab2eb7e44612d7dfa05a6679792ed3', '631a30a7f6f2c1d59ea35419197b70da');
            twilio.sendSms({
                to:'+17199634882', 
                from: '+17194530451', 
                body: 'Response from your site!'
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
        }
    });


    Meteor.startup(function () {
        // code to run on server at startup
    });
}


/* Home route */
Router.route('/', function () {
    this.render('home');
});

/* On POST from Twilio */
Router.route('/text/', function(){
    this.response.statusCode = 200;
    this.response.setHeader("Content-Type", "text/xml");

    // parse text
    var body  = this.request.body.Body;
    var split = body.split(":");
    var commitment = split[0];
    var task       = split[1];

    // search for commitment
    var commitmentId = Commitments.findOne({normalizedName: commitment.toLowerCase()})._id;

    // add task
    Meteor.call("addTask", task, commitmentId)

    // respond to text
    // var reply = "<h1>New task has successfully been added!</h1><ul><li>Commitment: " + commitment + "</li><li>Task: " + task + "</li></ul>";
    var reply = '<?xml version="1.0" encoding="UTF-8" ?><Response><Message><Body>|&#13;&#13;New task has successfully been added!&#13;     Commitment: ' + commitment + '&#13;     Task: ' + task + '</Body></Message></Response>'
    this.response.end(reply);
}, {where: 'server'});



/*
    Sources: 
      • http://blog.benmcmahen.com/post/41741539120/building-a-customized-accounts-ui-for-meteor
      • http://docs.meteor.com/#/full/
      • 
*/


Commitments = new Mongo.Collection("commitments");
Tasks       = new Mongo.Collection("tasks");

/* helper functions */
var trimInput = function(val) {

    return val.replace(/^\s*|\s*$/g, "");
}
var isValidPassword = function(val, field) {
    if (val.length >= 6) {
        return true;
    }
    else {
        Session.set('displayMessage', 'Error &amp; Too short.');
        return false;
    }
}


if (Meteor.isClient) {

    Meteor.subscribe("commitments");
    Meteor.subscribe("tasks");

    /* Reactive context for ui messages */
    Meteor.autorun(function() {
        //whenever session variable changes, run this
        var message = Session.get('displayMessage');
        if (message) {
            var stringArray = message.split('&amp;');
            console.log(stringArray);

            Session.set('displayMessage', null);
        }
    });

    /* login */
    Template.login.events({
        "submit #login-form" : function(e, t) {
            e.preventDefault();
            //get form info
            var email    = t.find('#login-email').value,
                password = t.find('#login-password').value;

            //validate info
            email = trimInput(email);

            //login with info (should validate)
            Meteor.loginWithPassword(email, password, function(err) {
                if (err) {
                    console.log(err);
                }
                else {
                    window.location.href = "/home/";
                }
            });
            return false; //avoid default form submit
        }
    });

    /* register */
    Template.register.events({
        "submit #register-form": function(e, t) {
            e.preventDefault();
            //get form info
            var email    = t.find('#account-email').value,
                password = t.find('#account-password').value;

            //validate info
            email = trimInput(email);
            if (isValidPassword(password)) {

                //create user account with info (should validate)
                Accounts.createUser({email: email, password: password}, function(err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        window.location.href = "/home/";
                    }
                });
            }

            return false; //avoid default form submit
        }
    });

    /* home */
    Template.home.events({
        "click #logout": function() {
            Meteor.logout();
        }
    });
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


/* Login route */
Router.route('/', function() {
    if (Meteor.userId()) {
        this.render('home');
    }
    else {
        this.render('login');
    }
});

/* Register route */
Router.route('/register/', function() {
    this.render('register');
});

/* Home route */
Router.route('/home/', function() {
    if (Meteor.userId()) {
        this.render('home');
    }
    else {
        this.redirect('/');
    }
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
    var reply = '<?xml version="1.0" encoding="UTF-8" ?>\<Response><Message><Body>|&#13;&#13;New task has successfully been added!&#13;     Commitment: ' + commitment + '&#13;     Task: ' + task + '</Body></Message></Response>'
    this.response.end(reply);
}, {where: 'server'});



/*
 * TEMPLATE EVENTS
 */



/* Helper functions for event processing */
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



/* Reactive context for ui messages during event processing*/
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
                window.location.href = "/dashboard/";
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
                    window.location.href = "/dashboard/";
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

/* hideCompleted */
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
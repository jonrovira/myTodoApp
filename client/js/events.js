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

/* dashboardPane */
Template.dashboardPane.events({
    "click #logout": function() {
        Meteor.logout();
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
    },
    "click .move-left": function(e) {
        // Get jQuery elements
        var $wrap = $(e.target).parent().siblings('div.task-list-wrapper');
        var $ul   = $wrap.children('ul.task-list');
        var $li   = $ul.children('li.task');

        // Stop any current animations
        $ul.stop();

        // Get element dimensions and positions
        var liWidth = $li.width();
        var firstPos = $ul.offset().left - $wrap.offset().left;

        // Transition!
        if (firstPos < (-1 * liWidth)) {
            $ul.transition({
                left: "+=" + liWidth
            }, {
                duration: 200
            });
        }
        else {
            $ul.transition({
                left: "0"
            }, {
                duration: 200
            });
        }
    },
    "click .move-right": function(e) {
        // Get jQuery elements
        var $wrap = $(e.target).parent().siblings('div.task-list-wrapper');
        var $ul   = $wrap.children('ul.task-list');
        var $li   = $ul.children('li.task');

        // Stop any current animations
        $ul.stop();

        // Get element dimensions and positions
        var wrapWidth = $wrap.width();
        var ulWidth = $ul.width();
        var liWidth = $li.width();
        var firstPos = $ul.offset().left - $wrap.offset().left;
        var hidden = ulWidth - wrapWidth + firstPos;

        // Transition!
        if (hidden > liWidth) {
            $ul.transition({
                left: "+=" + (-1 * liWidth)
            }, {
                duration: 200
            });
        }
        else {
            $ul.transition({
                left: (-1 * (ulWidth - wrapWidth))
            }, {
                duration: 200
            });
        }
    },
    "click div.tasks div.commitment-header div.right": function(e) {
        // get jQuery element
        $el = $(e.target);

        // correctly select div.right
        if (! $el.hasClass('right')) {
            $el = $el.parents('div.right');
        }

        // toggle active class
        $el.toggleClass('active');
    }
});

/* task */
Template.task.events({
    "click .task-toggle-checked": function() {
        Meteor.call("setTaskChecked", this._id, !this.checked);
    },
    "click .task-delete": function() {
        Meteor.call("deleteTask", this._id);
    },
    "click li.task": function(e) {
        // get clicked element
        var $el = $(e.target);

        // get respective task element
        if (! $el.hasClass('task')) {
            $el = $el.parents('li.task');
        }

        // give active class to element
        if (! $el.hasClass('active')) {
            $('li.task').removeClass('active');
            $el.addClass('active');
        }

        return;
    },
});
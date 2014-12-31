/*
 * TEMPLATE HELPERS
 */

/* home */
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

/* rightPane */
Template.rightPane.helpers({
    commitments: function() {
        if (Session.get("hideCompleted")) {
            return Commitments.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
        }
        else {
            return Commitments.find({}, {sort: {createdAt: -1}});
        }
    }
});

/* hideCompleted */
Template.hideCompleted.helpers({
    hideCompleted: function() {
        return Session.get("hideCompleted");
    }
});

/* commitment */
Template.commitment.helpers({
    tasks: function() {
        var commitmentId = this._id;
        return Tasks.find({commitmentId: commitmentId}, {sort: {createdAt: -1}});
    }
});
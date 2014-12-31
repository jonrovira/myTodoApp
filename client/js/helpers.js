/*
 * TEMPLATE HELPERS
 */

/* home */
Template.home.helpers({
    commitments: function() {
        return Commitments.find({}, {sort: {createdAt: -1}});
    },
    incompleteCount: function () {
        return Tasks.find({checked: {$ne: true}}).count();
    }
});

/* dashboardMain */
Template.dashboardMain.helpers({
    commitments: function() {
        return Commitments.find({}, {sort: {createdAt: -1}});
    }
});

/* dashboardPane */
Template.dashboardPane.helpers({
    commitments: function() {
        return Commitments.find({}, {sort: {createdAt: -1}});
    }
});

/* commitment */
Template.commitment.helpers({
    tasks: function() {
        var commitmentId = this._id;
        return Tasks.find({commitmentId: commitmentId}, {sort: {createdAt: -1}});
    }
});
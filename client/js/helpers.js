/*
 * TEMPLATE HELPERS
 */


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
    },
    progress: function() {
        var commitmentId = this._id;
        var done  = Tasks.find({commitmentId: commitmentId, checked: true}).count();
        var total = Tasks.find({commitmentId: commitmentId}).count();
        var percent = Math.ceil(done / total * 10000) / 100;
        percent += "%";
        return percent;
    }
});
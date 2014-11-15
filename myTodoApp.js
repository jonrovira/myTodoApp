Commitments = new Mongo.Collection("commitments");


if (Meteor.isClient) {

    Template.body.helpers({
        commitments: function() {
            return Commitments.find({});
        }
    });
}




if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}

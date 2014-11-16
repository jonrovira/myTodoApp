Commitments = new Mongo.Collection("commitments");


if (Meteor.isClient) {

    Template.body.helpers({
        commitments: function() {
            return Commitments.find({}, {sort: {createdAt: -1}});
        }
    });
    Template.addCommitment.events({
        "submit form": function(event) {

            // Get new commitment name
            var text = event.target.name.value;

            // Add it to commitment collection
            Commitments.insert({
                name: text,
                createdAt: new Date() // current time
            });

            // Cleanup: Clear input, void default submit
            event.target.name.value = "";
            return false;
        }
    });
    Template.commitment.events({
        "click .toggle-checked": function() {
            Commitments.update(this._id, {$set: {checked: ! this.checked}});
        },
        "click .delete": function() {
            console.log('hi');
            Commitments.remove(this._id);
        }
    });
}




if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}

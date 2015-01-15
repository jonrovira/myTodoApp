/*
 * APPLICATION METHODS
 */

Meteor.methods({

    /* Add item to commitments collection */
    addCommitment: function (original, normalized, concatenized) {
        Commitments.insert({
            commitmentName: original,
            normalizedName: normalized,
            concatenizedName: concatenized,
            createdAt: new Date()
        });
    },

    /* Delete item from commitments collection */
    deleteCommitment: function (commitmentId) {
        var commitment = Commitments.findOne(commitmentId);
        Commitments.remove(commitmentId);
    },

    /* Add item to tasks collection */
    addTask: function (taskContent, commitmentId, checked) {
        Tasks.insert({
            task: taskContent,
            commitmentId: commitmentId,
            checked: checked,
            createdAt: new Date(),
        });
    },

    /* Delete item from tasks collection */
    deleteTask: function (taskId) {
        var task = Tasks.findOne(taskId);
        Tasks.remove(taskId);
    },

    /* Set an item in tasks collcetion to "checked" */
    setTaskChecked: function (taskId, setChecked) {
        var task = Tasks.findOne(taskId);
        Tasks.update(taskId, { $set: { checked: setChecked} });
    },

    /* Send an SMS message */
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
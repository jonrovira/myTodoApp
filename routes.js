/*
 * APPLICATION ROUTER
 */


/* Configurations */
Router.configure({
    layoutTemplate: 'layout'
});


/* Login */
Router.route('/', function() {
    if (Meteor.userId()) {
        this.render('dashboard');
    }
    else {
        this.render('login');
    }
});


/* Register */
Router.route('/register/', function() {
	
    this.render('register');
});


/* Dashboard */
Router.route('/dashboard/', function() {
    if (Meteor.userId()) {
        this.render('dashboard');
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
// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User            = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {
            // find a user whose username is the same as the forms username
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'username' :  username }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // check to see if theres already a user with that username
                if (user) {
                    return done(null, false, {message: 'username already exists'});
                } else {
                    // if there is no user with that username
                    // check is theres a user with username
                    User.findOne({'username': req.body.username}, function(err, user) {
                        if (user) {
                            return done(null, false, {message: 'Username already exists'})
                        } else {
                            // create the user
                            const newUser = new User();

                            // set the user's local credentials
                            newUser.username = req.body.username
                            newUser.password = newUser.generateHash(password);

                            // save the user
                            newUser.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    }) 
                }
            });   
        });
    }));

    passport.use('local-login', new LocalStrategy({
        // These are the fields the route uses to confirm a user. Can be changed (i.e., changing 'username' to 'email' matches a user with same email)
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with username and password from our form

        // find a user whose username is the same as the forms username
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, "Username doesn't exist");

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, "Wrong Password");

            // all is well, return successful user
            return done(null, user);
        });
    }));
};
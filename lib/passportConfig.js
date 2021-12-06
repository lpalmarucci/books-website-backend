const LocalStrategy = require('passport-local').Strategy;

function initializePassport(passport, getUserByUsername) {

    passport.use(new LocalStrategy(async (username, password, done) => {
        const user = await getUserByUsername(username);
        return done(null, user);
    }))

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user))
}

module.exports = initializePassport
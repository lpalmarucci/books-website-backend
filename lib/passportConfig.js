const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initializePassport(passport, getUserByUsername) {

    passport.use(new LocalStrategy(async (username, password, done) => {
        const user = await getUserByUsername(username);
        if (user.errorMessage) {
            return done(user, false);
        }

        const pwdCompare = await bcrypt.compare(password, user.password);
        if (!pwdCompare) {
            return done({ errorMessage: 'Incorrect password' }, false);
        }
        return done(null, user);
    }))

    passport.serializeUser((user, done) => done(null, user.user_id))
    passport.deserializeUser((user, done) => done(null, user))
}

module.exports = initializePassport
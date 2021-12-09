// IMPORT
const express = require('express');
const app = express();
require('dotenv').config();
const passport = require('passport');
const passportConfig = require('./lib/passportConfig');
const connect2db = require('./lib/db');
const connection = connect2db();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
// END OF IMPORT

/****** START IMPORT ROUTES ******/
const booksRoutes = require('./routes/books');
const { authenticationRoutes } = require('./routes/auth');
/****** END IMPORT ROUTES ******/

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET_KEY));

app.use(session({
    secret: process.env.COOKIE_SECRET_KEY,
    resave: true,
    saveUninitialized: false,
    cookie: { secure: false }
}))

app.use(passport.initialize());
app.use(passport.session());

passportConfig(passport, (username) => {
    return new Promise((resolve, reject) => {
        connection.query(`
        SELECT *
        FROM tUsers
        WHERE username ='${username}'
    `, (err, res) => {
            if (res.length > 0) {
                resolve(res[0])
            } else {
                resolve({ errorMessage: 'User not found' })
            }
        })
    }, (err) => {
        reject({ errorMessage: 'Error while fetching info about user' });
    })

});
authenticationRoutes(app, connection, passport);

booksRoutes(app, connection);

app.listen(process.env.SERVER_PORT, () => console.log(`Listening on port ${process.env.SERVER_PORT}`));
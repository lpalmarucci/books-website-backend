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
const { getFormattedDate } = require('./lib/date');
// END OF IMPORT

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
            console.log(res);
            if (res.length > 0) {
                resolve(res[0])
            } else {
                resolve({ errorMessage: 'User not found' })
            }
        })
    }, (err) => {
        console.log('errore promise ', err);
        reject('Error while fetching info about user');
    })

});

app.post('/register', async (req, resp) => {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        connection.query(`SELECT COUNT(*) as NUM_RECORDS FROM tUsers WHERE username = '${username}'`, (err, res) => {

            if (res.length === 0 || res[0].NUM_RECORDS > 0) {
                resp.json({
                    status: 200,
                    severity: 'Warning',
                    body: {
                        errorMessage: 'User already registered, please log in'
                    }
                })
            } else {
                try {
                    const date = getFormattedDate(new Date);
                    console.log('data', date);
                    connection.query(`INSERT INTO tUsers (email,username, password, last_update) VALUES('${email}','${username}','${hashedPassword}','${date}')`, (err, res) => {
                        console.log(res);
                        if (!err && res.affectedRows === 1) {
                            resp.json({
                                status: 200,
                                severity: 'no-error',
                                body: {
                                    message: 'Registration completed'
                                }
                            })
                        } else {
                            resp.json({
                                status: 200,
                                severity: 'Error',
                                body: {
                                    errorMessage: 'Unable to complete registration'
                                }
                            })
                        }
                    })
                } catch (e) {
                    console.log('e', e);
                    resp.json({
                        status: 400,
                        severity: 'Warning',
                        body: {
                            errorMessage: 'Username already taken'
                        }
                    })
                }
            }
        });
    } catch (e) {
        resp.json({
            status: 200,
            severity: 'Error',
            body: {
                errorMessage: e
            }
        })
    }
})


app.post('/login', (req, res) => {
    passport.authenticate('local', (err, user) => {
        if (err) {
            res.json({ status: 400, body: { errorMessage: `Error during authentication! Error: ${err}` } }).end();
        } else {
            req.logIn(user, (err) => {
                if (err) {
                    res.json({ status: 400, body: { errorMessage: `Error during login! Error: ${err}` } }).end();
                } else {
                    res.json({ status: 200, body: { message: 'Authenticated' } })
                }
            })
        }
    })(req, res)
})

app.listen(process.env.SERVER_PORT, () => console.log(`Listening on port ${process.env.SERVER_PORT}`));
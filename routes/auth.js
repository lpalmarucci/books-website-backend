const { getFormattedDate } = require("../lib/date");

const checkAuthentication = (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
        res.json({ status: 403, severity: 'error', body: { errorMessage: 'Not authenticated' } }).end();
    }
    next();
}

const authenticationRoutes = (app, connection, passport) => {

    app.post('/register', async (req, resp) => {
        const { email, username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            connection.query(`SELECT COUNT(*) as NUM_RECORDS FROM tUsers WHERE username = '${username}'`, (err, res) => {

                if (res.length === 0 || res[0].NUM_RECORDS > 0) {
                    resp.json({
                        status: 456,
                        severity: 'Warning',
                        body: {
                            errorMessage: 'User already registered, please log in'
                        }
                    })
                } else {
                    try {
                        const date = getFormattedDate(new Date);
                        connection.query(`INSERT INTO tUsers (email,username, password, last_update) VALUES('${email}','${username}','${hashedPassword}','${date}')`, (err, res) => {
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
                                    status: 500,
                                    severity: 'Error',
                                    body: {
                                        errorMessage: 'Unable to complete registration'
                                    }
                                })
                            }
                        })
                    } catch (e) {
                        resp.json({
                            status: 445,
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
                status: 500,
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
                res.json({ status: 444, body: { errorMessage: err.errorMessage } }).end();
            } else {
                req.logIn(user, (err) => {
                    if (err) {
                        const errorMessage = 'Error during login! ' + JSON.stringify(err);
                        res.json({ status: 444, body: { errorMessage } }).end();
                    } else {
                        res.json({ status: 200, body: { message: 'Authenticated' } })
                    }
                })
            }
        })(req, res)
    })

    app.post('/authenticated', checkAuthentication, (req, res) => res.json({ status: 200, severity: 'no-error', body: { message: 'Authenticated' } }));

    app.use('/api', checkAuthentication)
}

module.exports = { authenticationRoutes, checkAuthentication };
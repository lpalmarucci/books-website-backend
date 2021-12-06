
const mysql = require('mysql');

function connect2db() {

    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    })


    connection.connect((err) => {
        if (err) {
            console.log(`Error while connecting to DB --> ${err}`);
        } else {
            console.log('Connected to DB');
        }
    })

    return connection;

}

module.exports = connect2db;
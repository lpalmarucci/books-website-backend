const nodemon = require("nodemon");
const { getFormattedDate } = require("../lib/date");

/**
 * Wrapper delle routes dei libri
 * @param {*} app 
 * @param {*} connection 
 */
const booksRoutes = (app, connection) => {

    /**
     * Aggiunge un nuovo libro alla raccolta dei libri salvati
     */
    app.post('/api/books/save', (req, response) => {
        const { bookId } = req.body;
        const user_id = req.user;
        console.log(user_id, bookId, getFormattedDate(new Date));
        connection.query(`SELECT * FROM tSavedBooks WHERE book_id = '${bookId}'`, (err, result) => {
            if (result.length > 0) {
                response.json({ status: 455, severity: 'warning', body: { errorMessage: 'Book already saved' } }).end();
            } else {
                const insDate = getFormattedDate(new Date);
                console.log(`insDate ${insDate}`);
                connection.query(`INSERT INTO tSavedBooks (book_id, user_id, inserted_at) VALUES ('${bookId}','${user_id}', '${insDate}')`, (err, result) => {
                    if (!err && result.affectedRows === 1) {
                        response.json({ status: 200, severity: 'no-error', body: { message: 'Book saved correctly' } }).end();
                    } else {
                        response.json({ status: 500, severity: 'error', body: { errorMessage: 'Unable to save the book, please try again' } }).end()
                    }
                });
            }
        })
    })

    /**
     * Ritorna la lista dei libri salvati in base all'utente
     */
    app.post('/api/books/saved', (req, res) => {
        const user_id = req.user;
        connection.query(`
            SELECT book_id
            FROM tSavedBooks
            WHERE user_id = '${user_id}'
            ORDER BY inserted_at
        `, (err, result) => {
            if (err) {
                res.json({ status: 500, severity: 'error', body: { errorMessage: 'Unable to retrieve books, please try again later' } }).end();
            } else {
                res.json({ status: 200, severity: 'no-error', body: { books: result } }).end()
            }
        })
    })

    app.delete('/api/books/delete', (req, response) => {
        console.log(req.body);
        const { bookId } = req.body;
        const user_id = req.user;
        console.log('user_id ', user_id);
        connection.query(`DELETE FROM tSavedBooks WHERE book_id = '${bookId}'`, (err, res) => {
            if (!err) {
                response.json({ status: 200, status: 'no-error', body: { message: 'Removed from the saved books' } }).end();
            } else {
                response.json({ status: 500, status: 'error', body: { errorMessage: 'Error while deleting the book, please retry' } }).end();
            }
        })
    })
}

module.exports = booksRoutes
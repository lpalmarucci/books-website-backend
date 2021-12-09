const nodemon = require("nodemon");

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
        connection.query(`SELECT * FROM tSavedBooks WHERE book_id = '${bookId}'`, (err, result) => {
            if (result.length > 0) {
                response.json({ status: 455, severity: 'warning', body: { errorMessage: 'Book already saved' } }).end();
            } else {
                connection.query(`INSERT INTO tSavedBooks (book_id, user_id) VALUES ('${bookId}','${user_id}')`, (err, result) => {
                    if (result.affectedRows === 1) {
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
        `, (err, result) => {
            if (err) {
                res.json({ status: 500, severity: 'error', body: { errorMessage: 'Unable to retrieve books, please try again later' } }).end();
            } else {
                res.json({ status: 200, severity: 'no-error', body: { books: result } })
            }
        })
    })
}

module.exports = booksRoutes
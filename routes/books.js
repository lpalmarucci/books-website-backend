
const booksRoutes = (app, connection) => {
    app.post('/api/books/save', (req, response) => {
        const { bookId } = req.body;
        const { username } = req.user;
        //Salvare il libro sulla tBooks
        connection.query(`SELECT * FROM tSavedBooks WHERE book_id = '${bookId}'`, (err, result) => {
            console.log(result);
            if (result.length > 0) {
                response.json({ status: 455, severity: 'warning', body: { errorMessage: 'Book already saved' } });
            } else {
                const bookId = result[0].book_id;
                connection.query(`INSERT INTO tSavedBooks (book_id, user_id) VALUES ('${bookId}','${username}')`, (err, result) => {
                    if (result.affectedRows === 1) {
                        response.json({ status: 200, severity: 'no-error', body: { message: 'Book saved correctly' } })
                    } else {
                        response.json({ status: 500, severity: 'error', body: { errorMessage: 'Unable to save the book, please try again' } })
                    }
                });
            }
        })
    })
}

module.exports = booksRoutes
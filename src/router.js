import express from 'express';
import { 
    getBooksHandler,
    getBookByIdHandler 
} from './controller/books.js';

    import { 
        getAllAuthors,
        getAuthorById,
        createAuthor,
	    updateAuthor,
	    deleteAuthor, 
} from './controller/authors.js';


const router = express.Router();





/**
 * @openapi
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       '200':
 *         description: A list of books, or an empty array if none exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   author:
 *                     type: string
 *                   title:
 *                     type: string
 *                   publicationDate:
 *                     type: string
 *       '500':
 *         description: An internal server or database error occurred.
 */
// Define the route for getting all books
router.get('/books', getBooksHandler);

/**
 * @openapi
 * /books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The book's unique ID.
 *         schema:
 *           type: string
 *         example: b1
 *     responses:
 *       '200':
 *         description: The matching book.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 author:
 *                   type: string
 *                 title:
 *                   type: string
 *                 publicationDate:
 *                   type: string
 *       '404':
 *         description: No book with the specified ID was found.
 *       '500':
 *         description: An internal server or database error occurred.
 */
// Define the route for getting a book by ID
router.get('/books/:id', getBookByIdHandler);



/**
 * @openapi
 * /authors:
 *   get:
 *     summary: Get all authors
 *     tags:
 *       - Authors
 *     responses:
 *       '200':
 *         description: A list of authors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: a1
 *                   name:
 *                     type: string
 *                     example: Jane Austen
 *                   birthYear:
 *                     type: integer
 *                     example: 1775
 *       '500':
 *         description: Unable to retrieve authors
 */
router.get('/authors', getAllAuthors);




/**
 * @openapi
 * /authors/{id}:
 *   get:
 *     summary: Get an author by ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The author's unique ID.
 *         schema:
 *           type: string
 *         example: a1
 *     responses:
 *       '200':
 *         description: The matching author.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 birthYear:
 *                   type: integer
 *       '404':
 *         description: No author with the specified ID was found.
 *       '500':
 *         description: An internal server or database error occurred.
 */
router.get('/authors/:id', getAuthorById);

/**
 * @openapi
 * /authors:
 *   post:
 *     summary: Create an author
 *     tags:
 *       - Authors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - birthYear
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               birthYear:
 *                 type: number
 *           example:
 *             id: a4
 *             name: Example Author
 *             birthYear: 1980
 *     responses:
 *       '201':
 *         description: Author created
 *       '400':
 *         description: Missing required author fields or author ID already exists
 *       '500':
 *         description: Unable to create author
 */
router.post('/authors', createAuthor);

/**
 * @openapi
 * /authors/{id}:
 *   put:
 *     summary: Update an author by ID
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The author ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - birthYear
 *             properties:
 *               name:
 *                 type: string
 *               birthYear:
 *                 type: number
 *           example:
 *             name: Updated Author
 *             birthYear: 1981
 *     responses:
 *       '200':
 *         description: Author updated
 *       '400':
 *         description: Missing required author fields
 *       '404':
 *         description: Author not found
 *       '500':
 *         description: Unable to update author
 */
router.put('/authors/:id', updateAuthor);

/**
 * @openapi
 * /authors/{id}:
 *   delete:
 *     summary: Delete an author by ID
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The author ID.
 *     responses:
 *       '204':
 *         description: Author deleted
 *       '404':
 *         description: Author not found
 *       '409':
 *         description: Author cannot be deleted because they still have books
 *       '500':
 *         description: Unable to delete author
 */
router.delete('/authors/:id', deleteAuthor);

export default router;

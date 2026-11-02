import express from 'express';
import { getBooksHandler, getBookByIdHandler } from './controller/books.js';


const router = express.Router();


/**
 * @openapi
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       '200':
 *         description: A list of books. Returns an empty array if no books exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
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
 *               $ref: '#/components/schemas/Book'
 *       '404':
 *         description: No book with the specified ID was found.
 *       '500':
 *         description: An internal server or database error occurred.
 */
// Define the route for getting a book by ID
router.get('/books/:id', getBookByIdHandler);

export default router;

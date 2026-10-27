import express from 'express';
import { getBooksHandler, getBookByIdHandler } from './controller/books.js';


const router = express.Router();

// Define the route for getting all books
router.get('/books', getBooksHandler);

// Define the route for getting a book by ID
router.get('/books/:id', getBookByIdHandler);

export default router;

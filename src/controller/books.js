import {
    getAllBooks,
    getBookById,
    createBook as createBookModel,
    updateBook as updateBookModel,
    deleteBook as deleteBookModel, 
} from '../models/books.js';

import { getAuthorById } from '../models/authors.js';

const getBooksHandler = async (req, res) => {
    try {
        const books = await getAllBooks();
        return res.status(200).json(books);

    } catch (error) {
        console.error('Failed to retrieve books:', error.message);
        return res.status(500).json({ message: 'Internal server error' });

    };
};

const getBookByIdHandler =  async (req, res) => {
    const bookId = req.params.id;

    try {
        const book = await getBookById(bookId);

        if (!book) {
            return res.status(404).json({ "message": "Book not found" });
        };


        return res.status(200).json(book);



    } catch (error) {
        console.error('An error occurred while retrieving the book:', error.message);
        return res.status(500).json({message: 'Internal server error'});
    };
};


const createBookHandler = async (req, res) => {
    try {
        const { id, authorId, title, publicationDate } = req.body;

        // 1. Validate required fields and data types
        if (
            typeof id !== 'string' || !id.trim() ||
            typeof authorId !== 'string' || !authorId.trim() ||
            typeof title !== 'string' || !title.trim() ||
            typeof publicationDate !== 'string' || !publicationDate.trim()
        ) {
            return res.status(400).json({
                message: 'All fields are required.'
            });
        }

        // 2. Check whether the book ID already exists
        const existingBook = await getBookById(id.trim());

        if (existingBook) {
            return res.status(400).json({
                message: 'A book with this ID already exists.'
            });
        }

        // 3. Create an object containing only allowed fields
        const bookData = {
            id: id.trim(),
            authorId: authorId.trim(),
            title: title.trim(),
            publicationDate: publicationDate.trim()
        };

        // 4. Create the book using the model
        const book = await createBookModel(bookData);

        // 5. Reject an authorId that does not exist
        if (!book) {
            return res.status(400).json({
                message: 'The specified authorId does not exist. Please provide a valid authorId.'
            });
        }

        // 6. Return the newly created book
        return res.status(201).json(book);

    } catch (error) {

        // 7. Handle MongoDB duplicate-key errors
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'A book with this ID already exists.'
            });
        }

        // 8. Handle unexpected errors
        console.error('An error occurred while creating the book:', error.message);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};


const updateBookHandler = async (req, res) => {
    try {
        const bookId = req.params.id;

        const { authorId, title, publicationDate } = req.body;

        // 1. Reject attempts to change the book ID
        if (Object.hasOwn(req.body, 'id')) {
            return res.status(400).json({
                message: 'The book ID cannot be updated.'
            });
        }

        // 2. Validate required fields and data types
        if (
            typeof authorId !== 'string' || !authorId.trim() ||
            typeof title !== 'string' || !title.trim() ||
            typeof publicationDate !== 'string' || !publicationDate.trim()
        ) {
            return res.status(400).json({
                message: 'All fields are required.'
            });
        }

        // 3. Check whether the book exists
        const existingBook = await getBookById(bookId);

        if (!existingBook) {
            return res.status(404).json({
                message: 'Book not found.'
            });
        }

        // 4. Verify that the author exists
        const author = await getAuthorById(authorId.trim());

        if (!author) {
            return res.status(400).json({
                message: 'The specified authorId does not exist.'
            });
        }

        // 5. Construct the updated book data
        const bookData = {
            authorId: authorId.trim(),
            title: title.trim(),
            publicationDate: publicationDate.trim()
        };

        // 6. Update the book
        const updatedBook = await updateBookModel(bookId, bookData);

        if (!updatedBook) {
            return res.status(404).json({
                message: 'Book not found.'
            });
        }

        // 7. Return the updated book
        return res.status(200).json(updatedBook);

    } catch (error) {
        console.error('Error updating book:', error.message);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const deleteBookHandler = async (req, res) => {
    const bookId = req.params.id;

    try {
        const result = await deleteBookModel(bookId);

        if (!result) {
            return res.status(404).json({
                message: 'Book not found.'
            });
        }

        return res.status(200).json({
            message: 'Book deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting book:', error.message);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

export { getBooksHandler, getBookByIdHandler, createBookHandler, updateBookHandler, deleteBookHandler };
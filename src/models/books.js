import {getDb} from '../db/connect.js';
import { getAllAuthors, getAuthorById } from './authors.js';


const getAllBooks = async () => {

    const db = getDb();
    const collection = db.collection('books');
    const books = await collection.find({}).toArray();

    return books;
};


const getBookById = async (bookId) => {
    const db = getDb();
    const collection = db.collection('books');

    const book = await collection.findOne({ id: bookId});

    return book;

};

const createBook = async (book) => {
    const db = getDb();
    const collection = db.collection('books');

    const author = await getAuthorById(book.authorId);
    
    if (!author) {
        return null;
    }

    await collection.insertOne(book);

    return book;

} 


const updateBook = async (bookId, bookData) => {
    const db = getDb();
    const collection = db.collection('books');

    const updatedBook = await collection.findOneAndUpdate(
        { id: bookId },
        { $set: bookData },
        { returnDocument: 'after' }
    );

    return updatedBook;
};
     
const deleteBook = async (bookId) => {
    const db = getDb();
    const collection = db.collection('books'); 
    const result = await collection.deleteOne({ id: bookId });

    return result.deletedCount > 0;
};

export { getAllBooks, getBookById, createBook, updateBook, deleteBook };
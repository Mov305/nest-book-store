import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooSchema } from 'mongoose';
import { CANNOT_PURCHASE_MORE_THAN_ONE_COPY_EXCEPTION } from '../common/exceptions/user.exceptions';
import { BuyBookInput } from './dto/buy-book.input';
import { CreateBookInput } from './dto/create-book.input';
import { UpdateBookInput } from './dto/update-book.input';
import { Book, BookDocument } from './entities/book.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name)
    private bookModel: Model<BookDocument>,
  ) {}

  createBook(createBookInput: CreateBookInput) {
    const createdBook = new this.bookModel(createBookInput);
    return createdBook.save();
  }

  async findAllBooks(limit: number, skip: number) {
    const booksCount = await this.bookModel.countDocuments();
    const books = await this.bookModel
      .find()
      .populate('author')
      .populate('readers')
      .skip(skip)
      .limit(limit);

    return {
      books,
      booksCount,
    };
  }

  getBookById(
    id: MongooSchema.Types.ObjectId,
    readersSkip: number,
    readersLimit: number,
  ) {
    return this.bookModel
      .findById(id)
      .populate('author')
      .populate({
        path: 'readers',
        options: {
          limit: readersLimit,
          skip: readersSkip,
        },
      });
  }

  updateBook(
    id: MongooSchema.Types.ObjectId,
    updateBookInput: UpdateBookInput,
  ) {
    return this.bookModel.findByIdAndUpdate(id, updateBookInput, { new: true });
  }

  removeBook(id: MongooSchema.Types.ObjectId) {
    return this.bookModel.deleteOne({ _id: id });
  }

  // BUY BOOK FEATURE
  async isPurchased(buyBookInput: BuyBookInput) {
    const books = await this.bookModel.find({
      'readers._id': buyBookInput.userId,
    });

    return books.length >= 1;
  }

  async buyBook(buyBookInput: BuyBookInput) {
    // first check if the user exists in the readers array
    // if not, push the user to the array
    const book = await this.bookModel.findById(buyBookInput.bookId);
    const isUserExists = book?.readers?.some(
      (reader) => reader._id.toString() === buyBookInput.userId.toString(),
    );

    if (isUserExists) {
      throw CANNOT_PURCHASE_MORE_THAN_ONE_COPY_EXCEPTION;
    }

    return this.bookModel
      .findByIdAndUpdate(
        buyBookInput.bookId,
        {
          $push: {
            readers: buyBookInput.userId,
          },
        },
        { new: true },
      )
      .populate('readers');
  }
}

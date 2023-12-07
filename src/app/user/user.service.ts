import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooSchema } from 'mongoose';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User, UserDocument } from './entities/user.entity';
import { CANNOT_PURCHASE_MORE_THAN_ONE_COPY_EXCEPTION } from '../common/exceptions/user.exceptions';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async createUser(createUserInput: CreateUserInput) {
    // GENERATE HASH PASSWORD TO SAVE

    const createdUser = new this.userModel(createUserInput);

    return createdUser.save();
  }

  findAll(skip = 0, limit = 10) {
    // To implement later
    return this.userModel.find().skip(skip).limit(limit).select('-password');
  }

  async findOneByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  getUserById(id: MongooSchema.Types.ObjectId) {
    return this.userModel.findById(id).select('-password');
  }

  async updateUser(
    id: MongooSchema.Types.ObjectId,
    updateUserInput: UpdateUserInput,
  ) {
    return await this.userModel.findByIdAndUpdate(id, updateUserInput, {
      new: true,
    });
  }

  async updateUserBooks(
    userId: MongooSchema.Types.ObjectId,
    bookId: MongooSchema.Types.ObjectId,
  ) {
    const user = await this.userModel.findById(userId);
    if (user.books.some((book) => book.toString() === bookId.toString())) {
      throw CANNOT_PURCHASE_MORE_THAN_ONE_COPY_EXCEPTION;
    }
    return this.userModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          books: bookId,
        },
      },
      { new: true },
    );
  }
}

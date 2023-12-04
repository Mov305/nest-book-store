import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookResolver } from './book.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './entities/book.entity';
import { UserModule } from '../user/user.module';
import { AuthorModule } from '../author/author.module';

@Module({
  providers: [BookResolver, BookService],
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    AuthorModule,
    UserModule,
  ],
})
export class BookModule {}

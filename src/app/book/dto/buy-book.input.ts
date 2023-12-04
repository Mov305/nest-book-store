import { Field, InputType, ID } from '@nestjs/graphql';
import { Schema as MongooSchema } from 'mongoose';

@InputType()
export class BuyBookInput {

  @Field(() => ID)
  userId: MongooSchema.Types.ObjectId

  @Field(() => ID)
  bookId: MongooSchema.Types.ObjectId
}

import { Field, InputType } from 'type-graphql';

@InputType()
export class AiOcrReceiptInput {
  @Field()
  imageUrl: string;
}

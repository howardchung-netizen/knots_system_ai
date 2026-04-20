import { Field, InputType } from 'type-graphql';

@InputType()
export class AiChatMessageInput {
  @Field()
  message: string;
}

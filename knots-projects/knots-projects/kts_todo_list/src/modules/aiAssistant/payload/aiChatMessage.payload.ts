import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class AiChatMessagePayload {
  @Field()
  response: string;
}

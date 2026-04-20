import { Field, ObjectType, Float } from 'type-graphql';

@ObjectType()
export class AiOcrReceiptPayload {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  amount?: number;

  @Field({ nullable: true })
  desc?: string;

  @Field({ nullable: true })
  date?: string;

  @Field({ nullable: true })
  supplier?: string;

  @Field({ nullable: true })
  error?: string;
}

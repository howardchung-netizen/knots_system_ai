import { InputType, Field, ID } from 'type-graphql';
import { User } from '../user.entity';

@InputType()
export class UserInput {
  @Field(type => ID, { nullable: true })
  id?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  nameCht?: string;

  @Field({ nullable: true })
  nameEn?: string;

  @Field({ nullable: true })
  tel?: string;

  @Field({ nullable: true })
  tel2?: string;

  @Field({ nullable: true })
  whatsapp?: string;

  @Field({ nullable: true })
  whatsapp2?: string;

  @Field({ nullable: true })
  email?: string;

  @Field()
  status: number;

  @Field(type => [String], { nullable: true })
  roles?: string[];

  @Field({ nullable: true })
  color?: string
}

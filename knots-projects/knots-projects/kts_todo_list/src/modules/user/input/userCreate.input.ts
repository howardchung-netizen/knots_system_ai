import { InputType, Field, ID } from 'type-graphql';
import { User } from '../user.entity';

@InputType()
export class UserCreateInput {

  @Field()
  username: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  nameCht?: string;

  @Field({ nullable: true })
  nameEn?: string;

  @Field({ nullable: true })
  tel1?: string;

  @Field({ nullable: true })
  tel2?: string;

  @Field({ nullable: true })
  whatsApp?: string;

  @Field({ nullable: true })
  whatsapp2?: string;

  @Field({ nullable: true })
  email?: string;

  @Field()
  status: number;

  @Field(type => [String], { nullable: true })
  roles?: string[];

  @Field({ nullable: true })
  color?: string;
}

import { InputType, Field, ID } from 'type-graphql';
import { ServiceAccount } from '../serviceAccount.entity';

@InputType()
export class ServiceAccountUpdateInput {
  @Field(type => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  disabled?: Boolean;

  @Field(type => [String], { nullable: true })
  roles?: string[];
}

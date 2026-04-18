import { InputType, Field, ID } from 'type-graphql';
import { ServiceAccount } from '../serviceAccount.entity';

@InputType()
export class ServiceAccountCreateInput {
  @Field()
  name: string;

  @Field(type => [String], { nullable: true })
  roles?: string[];
}

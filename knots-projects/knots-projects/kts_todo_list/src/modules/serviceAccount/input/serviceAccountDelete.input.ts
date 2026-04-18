import { InputType, Field, ID } from 'type-graphql';
import { ServiceAccount } from '../serviceAccount.entity';

@InputType()
export class ServiceAccountDeleteInput {
  @Field(type => ID)
  id: string;
}

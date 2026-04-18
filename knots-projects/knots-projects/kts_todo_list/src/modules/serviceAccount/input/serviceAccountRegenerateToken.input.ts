import { InputType, Field, ID } from 'type-graphql';
import { ServiceAccount } from '../serviceAccount.entity';

@InputType()
export class ServiceAccountRegenerateTokenInput implements Partial<ServiceAccount> {
  @Field(type => ID)
  id: string;
}

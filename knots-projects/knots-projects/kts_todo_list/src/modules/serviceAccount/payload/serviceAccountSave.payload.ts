import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ServiceAccount } from '../serviceAccount.entity';

@ObjectType()
export class ServiceAccountSavePayload extends MutationPayload {
  @Field(type => ServiceAccount, { nullable: true })
  serviceAccount?: ServiceAccount;
}

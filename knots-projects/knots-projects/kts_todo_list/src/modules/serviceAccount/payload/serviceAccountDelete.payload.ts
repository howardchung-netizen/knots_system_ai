import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ServiceAccount } from '../serviceAccount.entity';

@ObjectType()
export class ServiceAccountDeletePayload extends MutationPayload {
  @Field({ nullable: true })
  deletedServiceAccountId?: string;
}

import {Field, ObjectType} from 'type-graphql';
import {MutationPayload} from '../../common/mutationPayload.type';
import { ClientContacts } from '../clientContacts.entity';

@ObjectType()
export class ClientContactsPayload extends MutationPayload {
  @Field(
    type => ClientContacts,
    {
      nullable: true,
    },
  )
  clientContacts?: ClientContacts;
}

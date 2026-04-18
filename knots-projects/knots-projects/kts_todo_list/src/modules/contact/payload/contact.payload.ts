import {Field, ObjectType} from 'type-graphql';
import {MutationPayload} from '../../common/mutationPayload.type';
import { Contact } from '../contact.entity';

@ObjectType()
export class ContactPayload extends MutationPayload {
  @Field(
    type => Contact,
    {
      nullable: true,
    },
  )
  contact?: Contact;
}

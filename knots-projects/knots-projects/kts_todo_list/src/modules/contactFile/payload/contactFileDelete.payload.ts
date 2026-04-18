
import {Field, ObjectType} from 'type-graphql';
import {MutationPayload} from '../../common/mutationPayload.type';
import {ContactFile} from '../contactFile.entity';

@ObjectType()
export class ContactFileDeletePayload extends MutationPayload {
  @Field(
    type => ContactFile,
    {
      nullable: true,
    }
  )
  contactFile?: ContactFile;
}

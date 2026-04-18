import {Field, ID, InputType} from 'type-graphql';
import {ContactFile} from '../contactFile.entity';

@InputType()
export class ContactFileDeleteInput implements Partial<ContactFile> {
  @Field(type => ID)
  id: string;

}

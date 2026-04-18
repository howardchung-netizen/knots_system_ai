import {Field, ID, InputType} from 'type-graphql';
import {ClaimFormFile} from '../claimFormFile.entity';

@InputType()
export class ClaimFormFileDeleteInput implements Partial<ClaimFormFile> {
  @Field(type => ID)
  id: string;

}

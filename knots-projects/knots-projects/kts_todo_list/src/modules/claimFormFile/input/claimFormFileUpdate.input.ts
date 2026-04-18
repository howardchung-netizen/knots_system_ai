import {Field, ID, InputType} from 'type-graphql';
import {ClaimFormFile} from '../claimFormFile.entity';

@InputType()
export class ClaimFormFileUpdateInput implements Partial<ClaimFormFile> {
  @Field(type => ID)
  id: string;
}

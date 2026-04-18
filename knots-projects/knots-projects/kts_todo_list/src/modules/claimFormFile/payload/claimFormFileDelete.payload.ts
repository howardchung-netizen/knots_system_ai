
import {Field, ObjectType} from 'type-graphql';
import {MutationPayload} from '../../common/mutationPayload.type';
import {ClaimFormFile} from '../claimFormFile.entity';

@ObjectType()
export class ClaimFormFileDeletePayload extends MutationPayload {
  @Field(
    type => ClaimFormFile,
    {
      nullable: true,
    }
  )
  claimFormFile?: ClaimFormFile;
}

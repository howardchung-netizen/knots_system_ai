import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ProjectHashtag } from '../projectHashtag.entity';

@ObjectType()
export class ProjectHashtagPayload extends MutationPayload{
  @Field({ nullable: true })
  projectHashtag?: ProjectHashtag;
}

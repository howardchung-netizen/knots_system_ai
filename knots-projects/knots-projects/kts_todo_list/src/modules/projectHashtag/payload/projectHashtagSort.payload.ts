import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ProjectHashtag } from '../projectHashtag.entity';

@ObjectType()
export class ProjectHashtagSortPayload extends MutationPayload{
  @Field({ nullable: true })
  result?: boolean;
}

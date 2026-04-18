import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ProjectItem } from '../projectItem.entity';

@ObjectType()
export class ProjectItemSortPayload extends MutationPayload{
  @Field({ nullable: true })
  result?: boolean;
}

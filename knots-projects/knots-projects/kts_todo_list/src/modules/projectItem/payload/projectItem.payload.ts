import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ProjectItem } from '../projectItem.entity';

@ObjectType()
export class ProjectItemPayload extends MutationPayload{
  @Field({ nullable: true })
  projectItem?: ProjectItem;
}

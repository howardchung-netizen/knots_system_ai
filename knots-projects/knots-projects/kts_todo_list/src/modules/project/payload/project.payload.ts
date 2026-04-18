import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { Project } from '../project.entity';

@ObjectType()
export class ProjectPayload extends MutationPayload{
  @Field({ nullable: true })
  project?: Project;
}

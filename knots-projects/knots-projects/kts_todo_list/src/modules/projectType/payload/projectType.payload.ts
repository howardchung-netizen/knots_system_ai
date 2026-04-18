import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ProjectType } from '../projectType.entity';

@ObjectType()
export class ProjectTypePayload extends MutationPayload{
  @Field({ nullable: true })
  projectType?: ProjectType;
}

import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';
import { ProjectItemSchedule } from '../projectItemSchedule.entity';

@ObjectType()
export class ProjectItemSchedulePayload extends MutationPayload{
  @Field({ nullable: true })
  projectItemSchedule?: ProjectItemSchedule;
}

import { InputType, Field, ID } from 'type-graphql';

@InputType()
export class ProjectItemScheduleData {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  titleEn?: string;

  @Field({ nullable: true })
  duration?: number;
}

@InputType()
export class ProjectItemScheduleUpdateInput {
  @Field(type=>ID)
  projectItemid: string;

  @Field({ nullable: true })
  color?: string;

  @Field(type => [ProjectItemScheduleData], { nullable: true })
  schedules?: ProjectItemScheduleData[];

}

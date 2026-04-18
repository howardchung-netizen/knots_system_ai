import {Field, ID, InputType} from 'type-graphql';
import {ProjectOrderFile} from '../projectOrderFile.entity';

@InputType()
export class ProjectOrderFileUpdateInput implements Partial<ProjectOrderFile> {
  @Field(type => ID)
  id: string;
}

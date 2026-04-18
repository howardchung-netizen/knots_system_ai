import {Field, ID, InputType} from 'type-graphql';
import {ClockInContactFile} from '../clockInContactFile.entity';

@InputType()
export class ClockInContactFileDeleteInput implements Partial<ClockInContactFile> {
  @Field(type => ID)
  id: string;
}

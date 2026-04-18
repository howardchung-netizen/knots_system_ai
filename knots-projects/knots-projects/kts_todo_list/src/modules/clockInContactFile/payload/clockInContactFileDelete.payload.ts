
import {Field, ObjectType} from 'type-graphql';
import {MutationPayload} from '../../common/mutationPayload.type';
import {ClockInContactFile} from '../clockInContactFile.entity';

@ObjectType()
export class ClockInContactFileDeletePayload extends MutationPayload {
  @Field(
    type => ClockInContactFile,
    {
      nullable: true,
    }
  )
  clockInContactFile?: ClockInContactFile;
}

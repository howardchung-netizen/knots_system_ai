
import {Field, ObjectType} from 'type-graphql';
import {MutationPayload} from '../../common/mutationPayload.type';
import {ProjectOrderFile} from '../projectOrderFile.entity';

@ObjectType()
export class ProjectOrderFileDeletePayload extends MutationPayload {
  @Field(
    type => ProjectOrderFile,
    {
      nullable: true,
    }
  )
  projectOrderFile?: ProjectOrderFile;
}

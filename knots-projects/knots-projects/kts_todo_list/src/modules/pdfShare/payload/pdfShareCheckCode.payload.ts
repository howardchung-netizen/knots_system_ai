import { ObjectType, Field } from 'type-graphql';
import { MutationPayload } from '../../common/mutationPayload.type';

@ObjectType()
export class PdfShareCheckCodePayload extends MutationPayload{
  @Field()
  result: boolean;

  @Field({
    nullable: true,
  })
  project?: string;

  @Field({
    nullable: true,
  })
  name?: string;

}

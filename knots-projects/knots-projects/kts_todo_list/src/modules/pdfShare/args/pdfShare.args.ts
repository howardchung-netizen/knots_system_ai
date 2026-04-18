import {ArgsType, Field, ID, Int} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';
import { SortOrder } from '../../pdf/args/pdf.args';

@ArgsType()
export class PdfShareArgs extends ConnectionArgs {
  @Field(
    type => ID,
    {
      nullable: true,
    })
  pdfId?: string;

  @Field(
    type => Int)
  projectId: number;

  @Field(type => SortOrder, { nullable: true })
  sortOrder?: SortOrder;

}

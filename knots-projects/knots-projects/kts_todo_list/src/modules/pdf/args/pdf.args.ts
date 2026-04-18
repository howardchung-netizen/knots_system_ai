import {ArgsType, Field, ID, Int, registerEnumType} from 'type-graphql';
import {ConnectionArgs} from '../../common/connectionPaging';

export enum PdfSortField {
  PROJECT_ID = 'PROJECT_ID',
  NAME = 'NAME',
  VERSION = 'VERSION',
  REMARKS = 'REMARKS',
}

registerEnumType(PdfSortField, {
  name: 'PdfSortField',
});

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
});
@ArgsType()
export class PdfArgs extends ConnectionArgs {
  @Field(type => ID, { nullable: true })
  id?: string;

  @Field(type=> Int, {nullable: true})
  projectId?: number;

  @Field(type=> String, {nullable: true})
  name?: string;

  @Field(type=> String, {nullable: true})
  remarks?: string;

  @Field(type => PdfSortField, { nullable: true })
  sortField?: PdfSortField;

  @Field(type => SortOrder, { nullable: true })
  sortOrder?: SortOrder;

}

import {PaginatedResponse} from '../../common/paginatedResponse.type';
import {ObjectType} from 'type-graphql';
import {OperationLog} from "../operationLog.entity";

@ObjectType()
export class OperationLogConnection extends PaginatedResponse(OperationLog) {
}

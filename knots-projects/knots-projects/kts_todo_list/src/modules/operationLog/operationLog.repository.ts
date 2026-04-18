import {EntityRepository} from 'typeorm';
import {PaginatingRepository} from '../common/paginating.repository';
import {OperationLog} from "./operationLog.entity";

@EntityRepository(OperationLog)
export class OperationLogRepository extends PaginatingRepository<OperationLog> {
}

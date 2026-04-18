import { ObjectType } from 'type-graphql';
import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ServiceAccount } from '../serviceAccount.entity';

@ObjectType()
export class ServiceAccountsConnection extends PaginatedResponse(ServiceAccount) {
}

import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { Cron } from '../cron.entity';

@ObjectType()
export class CronsConnection extends PaginatedResponse(Cron) {}

import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { MeasureType } from '../measureType.entity';

@ObjectType()
export class MeasureTypeConnection extends PaginatedResponse(MeasureType) {}

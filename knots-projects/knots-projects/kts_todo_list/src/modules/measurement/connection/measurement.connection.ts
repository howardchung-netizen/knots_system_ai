import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { Measurement } from '../measurement.entity';

@ObjectType()
export class MeasurementConnection extends PaginatedResponse(Measurement) {}

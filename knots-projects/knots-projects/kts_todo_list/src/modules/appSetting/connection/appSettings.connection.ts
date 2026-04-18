import { PaginatedResponse } from '../../common/paginatedResponse.type';
import { ObjectType } from 'type-graphql';
import { AppSetting } from '../appSetting.entity';

@ObjectType()
export class AppSettingsConnection extends PaginatedResponse(AppSetting) {}

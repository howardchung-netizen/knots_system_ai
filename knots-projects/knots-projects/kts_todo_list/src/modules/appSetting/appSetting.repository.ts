import { EntityRepository } from 'typeorm';
import { AppSetting } from './appSetting.entity';
import { PaginatingRepository } from '../common/paginating.repository';

@EntityRepository(AppSetting)
export class AppSettingRepository extends PaginatingRepository<AppSetting> {}

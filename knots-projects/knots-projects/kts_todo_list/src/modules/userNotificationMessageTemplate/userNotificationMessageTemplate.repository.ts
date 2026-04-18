import {Service} from 'typedi';
import {EntityRepository} from 'typeorm';
import {PaginatingRepository} from '../common/paginating.repository';
import {UserNotificationMessageTemplate} from './userNotificationMessageTemplate.entity';

@Service()
@EntityRepository(UserNotificationMessageTemplate)
export class UserNotificationMessageTemplateRepository extends PaginatingRepository<UserNotificationMessageTemplate> {}

import {Service} from 'typedi';
import {EntityRepository} from 'typeorm';
import {PaginatingRepository} from '../common/paginating.repository';
import {UserNotificationMessage} from './userNotificationMessage.entity';

@Service()
@EntityRepository(UserNotificationMessage)
export class UserNotificationMessageRepository extends PaginatingRepository<UserNotificationMessage> {}

import {EntityRepository} from 'typeorm';
import {PaginatingRepository} from '../common/paginating.repository';
import {UserNotificationToken} from './userNotificationToken.entity';

@EntityRepository(UserNotificationToken)
export class UserNotificationTokenRepository extends PaginatingRepository<UserNotificationToken> {
}

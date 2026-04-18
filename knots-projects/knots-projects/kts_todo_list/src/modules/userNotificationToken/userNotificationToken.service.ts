import {Service} from 'typedi';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {UserNotificationTokenUpdateInput} from './input/userNotificationTokenUpdate.input';
import {UserNotificationToken} from './userNotificationToken.entity';
import {UserNotificationTokenRepository} from './userNotificationToken.repository';

@Service()
export class UserNotificationTokenService {
  constructor(
    @InjectRepository()
    private readonly userNotificationTokenRepository: UserNotificationTokenRepository,
  ) {
  }

  async updateToken(
    data: UserNotificationTokenUpdateInput,
  ) {
    const { userId, token } = data;

    try {
      const insertValues = UserNotificationToken.create({
        userId: userId,
        token: token,
      });
      await this.userNotificationTokenRepository
        .createQueryBuilder()
        .insert()
        .values(insertValues)
        .orUpdate(['user_id'], ['token'])
        .execute();
    } catch (error: any) {
      console.log('Update User Notification Token error:', error.message);
      console.log(error);
    } finally {
      return true;
    }
  }

  async removeToken(
    data: UserNotificationTokenUpdateInput,
  ) {
    const { userId, token } = data;

    try {
      const userNotificationToken = await this.userNotificationTokenRepository.findOne({
        userId: userId,
        token: token,
      });
      if (userNotificationToken){
        await this.userNotificationTokenRepository.remove(userNotificationToken);
      }
    } catch (error: any) {
      console.log('Remove User Notification Token error:', error.message);
      console.log(error);
    } finally {
      return true;
    }
  }
}

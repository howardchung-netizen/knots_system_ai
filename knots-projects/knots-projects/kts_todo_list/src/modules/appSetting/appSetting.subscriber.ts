import { EventSubscriber, EntitySubscriberInterface } from 'typeorm';
import { Inject } from 'typedi';
import { PubSubEngine } from 'graphql-subscriptions';
import { MutationType } from '../common/subscriptionPayload.type';
import { AppSetting } from './appSetting.entity';

@EventSubscriber()
export class AppSettingSubscriber implements EntitySubscriberInterface<AppSetting> {
  constructor (
    @Inject('pubSub') private readonly pubSub: PubSubEngine
  ) {}

  listenTo() {
    return AppSetting;
  }

  afterInsert(event: any) {
    this.pubSub.publish('onAppSettingChange', {
      mutation: MutationType.CREATED,
      node: event.entity,
    });
  }

  afterUpdate(event: any) {
    this.pubSub.publish('onAppSettingChange', {
      mutation: MutationType.UPDATED,
      node: event.entity,
      updatedFields: event.updatedColumns.map((v: any) => v.propertyName),
      previousValues: event.databaseEntity,
    });
  }

  afterRemove(event: any) {
    this.pubSub.publish('onAppSettingChange', {
      mutation: MutationType.DELETED,
      previousValues: event.databaseEntity,
    });
  }
}

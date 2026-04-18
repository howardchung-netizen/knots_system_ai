import { EventSubscriber, EntitySubscriberInterface } from 'typeorm';
import { Inject } from 'typedi';
import { PubSubEngine } from 'graphql-subscriptions';
import { MutationType } from '../common/subscriptionPayload.type';
import { OperationLog } from './operationLog.entity';

@EventSubscriber()
export class OperationLogSubscriber implements EntitySubscriberInterface<OperationLog> {
  constructor (
    @Inject('pubSub') private readonly pubSub: PubSubEngine
  ) {}

  listenTo() {
    return OperationLog;
  }

  afterInsert(event: any) {
    this.pubSub.publish('onNewOperationLog', {
      mutation: MutationType.CREATED,
      node: event.entity,
    });
  }
}

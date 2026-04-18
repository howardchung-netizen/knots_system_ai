import { getManager } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { REDIS_URL } from './config';

export function revivePayload(entity: any, payload: any) {
  if (REDIS_URL) {
    const manager = getManager();
    if (payload.node && !(payload.node instanceof entity)) {
      Object.keys(payload.node).forEach(v => { if (v.startsWith('__promise_') && v.endsWith('__')) delete payload.node[v] });
      payload.node = plainToClass(entity, payload.node);
    }
    if (payload.previousValues && !(payload.previousValues instanceof entity)) {
      Object.keys(payload.previousValues).forEach(v => { if (v.startsWith('__promise_') && v.endsWith('__')) delete payload.previousValues[v] });
      payload.previousValues = plainToClass(entity, payload.previousValues);
    }
  }
}

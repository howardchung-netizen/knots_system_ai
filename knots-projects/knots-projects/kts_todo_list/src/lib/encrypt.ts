import { ENCRYPTION_IV, ENCRYPTION_KEY } from './config';
import { createCipheriv, createDecipheriv, createHash } from 'crypto';

export function encrypt(text: string, type: 'hex' | 'base64' = 'hex') {
  const iv = createHash('sha256')
    .update(ENCRYPTION_IV)
    .digest(type)
    .substr(0, 16);

  const key = createHash('sha256')
    .update(ENCRYPTION_KEY)
    .digest(type)
    .substr(0, 32);

  const cipher = createCipheriv('aes-256-ctr', key, iv);
  let crypted = cipher.update(text, 'utf8', type);
  crypted += cipher.final(type);
  return crypted;
}

export function decrypt(text: string, type: 'hex' | 'base64' = 'hex') {
  const iv = createHash('sha256')
    .update(ENCRYPTION_IV)
    .digest(type)
    .substr(0, 16);

  const key = createHash('sha256')
    .update(ENCRYPTION_KEY)
    .digest(type)
    .substr(0, 32);

  let decipher = createDecipheriv('aes-256-ctr', key, iv);
  var dec = decipher.update(text, type, 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

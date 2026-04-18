import jsonwebtoken from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import { APP_SECRET, JWT_ISSUER } from './config';

type Payload =
  | string
  | {
      [key: string]: any;
    };
export const createToken = (payload: Payload, options?: object): Promise<string> => {
  if (!options) options = {};
  return new Promise((resolve, reject) => {
    try {
      const token = jsonwebtoken.sign(payload, APP_SECRET, {
        issuer: JWT_ISSUER,
        ...options,
      });
      resolve(token);
    } catch (error: any) {
      reject(error);
    }
  });
};

export function decryptToken<T>(token: string): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      jsonwebtoken.verify(token, APP_SECRET);
      const payload = jsonwebtoken.decode(token);
      resolve(payload as T);
    } catch (error: any) {
      reject(error);
    }
  });
}

export const jwt = expressJwt({
  algorithms: ['HS256'],
  secret: APP_SECRET,
  credentialsRequired: false,
});

import { Enforcer } from "casbin";
import { Request, Response } from 'express';
import { Container } from "typedi";
import { TOKEN_COOKIE_MAX_AGE, TOKEN_COOKIE_NAME, TOKEN_COOKIE_OPTIONS, webUrl } from '../../lib/config';
import { logger } from '../../lib/logger';
import { User } from "./user.entity";
import { UserService } from "./user.service";
import { createToken } from "../../lib/jwt";

export class UserController {

  // static async internalLogin(request: Request, response: Response, enforcer: Enforcer): Promise<any> {
  //   try {
  //     const data: { username: string } | undefined = request.body.data;
  //     if (!data?.username) throw new Error('username required');

  //     const userService: UserService = Container.get(UserService);

  //     const user = await userService.loginInternal(data);
  //     const origin = request.get('origin');
  //     const token = await createToken({ loginUserType: User.name, id: user!.id }, { expiresIn: `${TOKEN_COOKIE_MAX_AGE}ms` });
  //     if (origin && webUrl.includes(origin)) {
  //       response.cookie(TOKEN_COOKIE_NAME, token, {
  //         ...TOKEN_COOKIE_OPTIONS,
  //         sameSite: (request.get('host')?.startsWith('localhost') ? 'lax' as const : 'none' as const),
  //         secure: request.protocol === 'https',
  //       });
  //     }

  //     await response
  //       .status(200)
  //       .send({
  //         token,
  //         exp: Date.now()+TOKEN_COOKIE_MAX_AGE,
  //       })
  //       .end();
  //     return true;

  //   } catch (error: any) {
  //     logger.error(error);
  //     return await this.responseError(response, 500, error.message);
  //   }
  // }

  static async responseError(response: Response, httpStatusCode: number, errorMessage: string): Promise<boolean> {
    if (!errorMessage) {
      response.status(httpStatusCode).end();
    } else {
      response.status(httpStatusCode).send(errorMessage);
    }
    return false;
  }
}

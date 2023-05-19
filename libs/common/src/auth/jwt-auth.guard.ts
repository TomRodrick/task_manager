import { Injectable, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';
import * as jwt from 'jsonwebtoken';
import { ServerResponse } from 'http';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { USERS_SERVICE } from '../constants';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, tap, throwError } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private secret;
  constructor(
    private reflector: Reflector,
    @Inject(USERS_SERVICE) private userClient: ClientProxy,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    super();
    this.secret = this.configService.get<string>('JWT_SECRET');
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    try {
      const token = request.headers.authorization.split(' ')[1];
      //todo: figure how to make this async with passport
      jwt.verify(token, this.secret);
    } catch (e) {
      /**
       * if the jwt is expired, check the refresh_token
       * if there's a valid refresh_token, update auth header,
       * give the user a new refresh token,
       * send the new token to the frontend
       */
      if (e.message === 'jwt expired') {
        const { sub } = this.parseJwt(request.headers.authorization);
        const user = await lastValueFrom(
          this.userClient.send('find_user', sub),
        ).catch((e) => {
          console.log(e);
        });

        //todo: add some logic to make sure request doesn't keep sending the same old access token, only allow expired token once
        if (user && user.refresh_token) {
          try {
            console.log('Access token expired, trying refresh token');
            jwt.verify(user.refresh_token, this.secret);
            const payload = {
              email: user.email,
              id: user.id.toString(),
            };

            const newRefreshToken = this.createRefreshToken(payload);
            const accessToken = this.createAccessToken(payload);

            request.headers.authorization = `Bearer ${accessToken}`;
            const response = context
              .switchToHttp()
              .getResponse<ServerResponse>();

            await lastValueFrom(
              this.userClient.send('set_refresh_token', {
                id: user.id.toString(),
                token: newRefreshToken,
              }),
            ).catch((e) => {
              console.log(e);
            });

            response.setHeader(
              'Access-Control-Expose-Headers',
              'x-access-token',
            );
            response.setHeader('x-access-token', accessToken);
          } catch (e) {
            console.log('refresh token failed', e);
          }
        }
      }
    }
    const parentCanActivate = (await super.canActivate(context)) as boolean;
    return parentCanActivate;
  }

  parseJwt(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  }

  createRefreshToken(user: { email: string; id: string }) {
    const payload = { email: user.email, sub: user.id };
    return jwt.sign(
      {
        data: payload,
      },
      this.secret,
      { expiresIn: '1h' },
    );
  }

  createAccessToken(user: { email: string; id: string }) {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}

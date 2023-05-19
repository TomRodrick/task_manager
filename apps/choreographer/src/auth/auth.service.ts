import { USERS_SERVICE } from '@app/common';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import * as jwt from 'jsonwebtoken';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  usersService: any;
  logger = new Logger();
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(USERS_SERVICE) private usersClient: ClientProxy,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const res = await lastValueFrom(
      this.usersClient.send('validate_user', { email, password }),
    ).catch((err) => {
      this.logger.error(err);
    });

    if (res) {
      return res;
    }
    return null;
  }

  async login(user: any) {
    if (!user.id) {
      throw new UnauthorizedException('Please check username and password.');
    }
    const refresh_token = this.createRefreshToken(user);

    await this.updateUserRefreshtoken(user.id, refresh_token);

    return {
      access_token: this.createAccessToken(user),
      ...user,
    };
  }

  async updateUserRefreshtoken(id, refresh_token) {
    return await lastValueFrom(
      this.usersClient.send('set_refresh_token', {
        id: id,
        token: refresh_token,
      }),
    );
  }

  /**TODO: put this in the lib folder so its shared */
  createRefreshToken(user: { email: string; id: string; user_type: string }) {
    const payload = {
      email: user.email,
      sub: user.id,
      user_type: user.user_type,
    };
    //calling jwt.sign directly to change the expiresIn value
    return jwt.sign(
      {
        data: payload,
      },
      this.configService.get('JWT_SECRET'),
      { expiresIn: '1h' },
    );
  }

  createAccessToken(user: { email: string; id: string; user_type: string }) {
    const payload = {
      email: user.email,
      sub: user.id,
      user_type: user.user_type,
    };
    return this.jwtService.sign(payload);
  }
}

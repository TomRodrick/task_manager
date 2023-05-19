import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UserType } from '@app/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UsersService {
  logger = new Logger();
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  public async createOne(user: CreateUserDto) {
    if (!user.email || !user.user_type || !user.password) {
      this.throwError(
        new BadRequestException('email, password, and user_type are required'),
      );
    }

    if (!Object.values(UserType).includes(user.user_type)) {
      this.throwError(
        new BadRequestException(
          'user_type must be either technician or manager',
        ),
      );
    }

    const query = { where: { email: user.email } };
    const userFound = await this.repo.findOne(query);
    if (userFound) {
      this.throwError(new BadRequestException('email already exists'));
    }

    const newUser = new User();
    newUser.password = user.password; //setter method uses salt & hash logic
    newUser.email = user.email;
    newUser.user_type = user.user_type;

    return this.repo.save(newUser).catch((err) => {
      this.logger.error(err);
      //todo: replace with switch to avoid exposing database info
      this.throwError(new BadRequestException(err.sqlMessage));
    });
  }

  //todo: we can probably create a base service and inherit methods like this
  //todo: this is insecure, should make sure users can't get other users if not a manager
  private async findById(id: number) {
    if (typeof id !== 'number') {
      this.throwError(new BadRequestException('id must be a number'));
    }
    const query = { where: { id } };
    return this.repo.findOne(query);
  }

  public updateRefreshToken(id: number, token: string) {
    return this.repo.update(id, { refresh_token: token }).catch((err) => {
      //todo: ideally this is a switch base off the sql messsage
      //so we don't accidenttally expose sensitive info about our db
      this.throwError(new BadRequestException(err.sqlMessage));
    });
  }

  public async validateUser(payoad: { email: string; password: string }) {
    const query = { where: { email: payoad.email } };
    const user = await this.repo.findOne(query).catch(() => {
      return new User();
    });

    if (!user || !user.validPassword(payoad.password)) return {};
    return user;
  }

  //todo: this is copied code which is terrible
  //with more time, methods like this, findById, etc should like in a base service that the other services extend so we can inherit
  private throwError(error) {
    throw new RpcException(error);
  }
}

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
      //todo: logic to ensure we dont 200
      throw new RpcException(
        new BadRequestException('email, password, and user_type are required'),
      );
    }

    if (!Object.values(UserType).includes(user.user_type)) {
      throw new RpcException(
        new BadRequestException(
          'user_type must be either technician or manager',
        ),
      );
    }

    const newUser = new User();
    newUser.password = user.password; //setter method uses salt & hash logic
    newUser.email = user.email;
    newUser.user_type = user.user_type;

    return this.repo.save(newUser).catch((err) => {
      this.logger.error(err);
      //todo: replace with switch to avoid exposing database info
      throw new RpcException(new BadRequestException(err.sqlMessage));
    });
  }

  //todo: we can probably create a base service and inherit methods like this
  public async findById(id: number) {
    if (typeof id !== 'number') {
      throw new RpcException(new BadRequestException('id must be a number'));
    }
    const query = { where: { id } };
    return this.repo.findOne(query);
  }

  public updateRefreshToken(id: number, token: string) {
    return this.repo.update(id, { refresh_token: token }).catch((err) => {
      //todo: ideally this is a switch base off the sql messsage
      //so we don't accidenttally expose sensitive info about our db
      throw new RpcException(new BadRequestException(err.sqlMessage));
    });
  }
}

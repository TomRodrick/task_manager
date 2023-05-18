import { Body, Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { Ctx, EventPattern, RmqContext } from '@nestjs/microservices';
import { RmqService, CreateUserDto } from '@app/common';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('create_user')
  async createUser(@Body() payload: CreateUserDto, @Ctx() context: RmqContext) {
    //todo: err handling logic, only ack message on success
    //or on legitimate validation error
    this.rmqService.ackMessage(context);
    return this.usersService.createOne(payload);
  }

  @EventPattern('find_user')
  async findUser(@Body() id: number, @Ctx() context: RmqContext) {
    this.rmqService.ackMessage(context);
    return this.usersService.findById(+id);
  }

  //this type of stuff should be in its own auth queue
  @EventPattern('set_refresh_token')
  async refreshToken(
    @Body() payload: { id; token },
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ackMessage(context);
    return this.usersService.updateRefreshToken(+payload.id, payload.token);
  }
}

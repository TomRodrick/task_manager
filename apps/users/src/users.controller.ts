import { Body, Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { Ctx, EventPattern, RmqContext } from '@nestjs/microservices';
import { RmqService, CreateTaskDto } from '@app/common';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('create_user')
  createUser(@Body() payload: CreateTaskDto, @Ctx() context: RmqContext) {
    console.log('CREATE USER CALLED');
    this.rmqService.ackMessage(context); //todo: err handling logic, only ack message on success
  }
}

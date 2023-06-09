import { Body, Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from '../../../libs/common/src/dto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService, Task_Payload, ActiveUser } from '@app/common';

@Controller()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('list_tasks')
  async list(
    @Payload() payload: { id: number; activeUser: ActiveUser },
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ackMessage(context);
    return this.tasksService.list(+payload.id, payload.activeUser);
  }

  //todo on all below: err handling logic, only ack message on success
  @EventPattern('create_task')
  createTask(
    @Body() payload: Task_Payload<CreateTaskDto>,
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ackMessage(context);
    return this.tasksService.createOne(payload.task, payload.activeUser);
  }

  @EventPattern('complete_task')
  completeTask(
    @Body() payload: Task_Payload<UpdateTaskDto>,
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ackMessage(context);
    return this.tasksService.completeTask(payload.task, payload.activeUser);
  }

  @EventPattern('reopen_task')
  reOpenTask(
    @Body() payload: Task_Payload<UpdateTaskDto>,
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ackMessage(context);
    return this.tasksService.reOpenTask(payload.task, payload.activeUser);
  }

  @EventPattern('delete_task')
  deleteTask(
    @Body() payload: { id: number; activeUser: ActiveUser },
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ackMessage(context);
    return this.tasksService.delete(payload.id, payload.activeUser);
  }
}

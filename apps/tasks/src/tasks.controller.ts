import { Body, Controller, Post, Patch, Delete, Param } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from '../../../libs/common/src/dto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService, Task_Payload } from '@app/common';

@Controller()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('list_tasks')
  async list(@Payload() id: number, @Ctx() context: RmqContext) {
    this.rmqService.ackMessage(context);
    return this.tasksService.list(+id);
  }

  @EventPattern('create_task')
  createTask(
    @Body() payload: Task_Payload<CreateTaskDto>,
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ackMessage(context); //todo: err handling logic, only ack message on success
    return this.tasksService.createOne(payload.task, payload.activeUser);
  }

  @EventPattern('complete_task')
  completeTask(
    @Body() payload: Task_Payload<UpdateTaskDto>,
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ackMessage(context); //todo: err handling logic, only ack message on success
    return this.tasksService.completeTask(payload.task);
  }

  @EventPattern('reopen_task')
  reOpenTask(
    @Body() payload: Task_Payload<UpdateTaskDto>,
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ackMessage(context); //todo: err handling logic, only ack message on success
    return this.tasksService.reOpenTask(payload.task);
  }

  @EventPattern('delete_task')
  deleteTask(@Body() id: number, @Ctx() context: RmqContext) {
    this.rmqService.ackMessage(context); //todo: err handling logic, only ack message on success
    return this.tasksService.delete(id);
  }
}

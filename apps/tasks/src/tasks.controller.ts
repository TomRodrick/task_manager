import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { ActiveUser } from '@app/common/interface/activeUser';

interface Payload<T> {
  activeUser: ActiveUser;
  task: T;
}

@Controller('/task/')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('/list/:id')
  list(@Param('id') technicianId) {
    return this.tasksService.list(technicianId);
  }

  @Post('/create')
  createTask(@Body() payload: Payload<CreateTaskDto>) {
    return this.tasksService.createOne(payload.task, payload.activeUser);
  }

  @Patch('/complete')
  completeTask(@Body() payload: Payload<UpdateTaskDto>) {
    return this.tasksService.completeTask(payload.task);
  }

  @Patch('/reopen')
  reOpenTask(@Body() payload: Payload<UpdateTaskDto>) {
    return this.tasksService.reOpenTask(payload.task);
  }

  @Delete('/:id')
  deleteTask(@Param('id') id: number) {
    return this.tasksService.delete(id);
  }
}

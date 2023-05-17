import {
  Controller,
  Get,
  Body,
  Inject,
  Param,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { ChoreographerService } from './choreographer.service';
import {
  TASKS_SERVICE,
  CreateTaskDto,
  Task_Payload,
  UpdateTaskDto,
  USERS_SERVICE,
  CreateUserDto,
} from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Controller()
export class ChoreographerController {
  constructor(
    private readonly choreographerService: ChoreographerService,
    @Inject(TASKS_SERVICE) private tasksClient: ClientProxy,
    @Inject(USERS_SERVICE) private usersClient: ClientProxy,
  ) {}
  /***********************BEGIN: TASK ROUTES*******************************/
  @Get('/tasks/list/:id')
  async listTasks(@Param('id') id) {
    return lastValueFrom(this.tasksClient.send('list_tasks', id));
  }

  @Post('/tasks/create')
  createTask(@Body() payload: Task_Payload<CreateTaskDto>) {
    return lastValueFrom(this.tasksClient.send('create_task', payload));
  }

  @Patch('/tasks/complete')
  completeTask(@Body() payload: Task_Payload<UpdateTaskDto>) {
    return lastValueFrom(this.tasksClient.send('complete_task', payload));
  }

  @Patch('/tasks/reopen')
  reOpenTask(@Body() payload: Task_Payload<UpdateTaskDto>) {
    return lastValueFrom(this.tasksClient.send('reopen_task', payload));
  }

  @Delete('/tasks/:id')
  deleteTask(@Param('id') id: number) {
    return lastValueFrom(this.tasksClient.send('delete_task', id));
  }
  /***********************END: TASK ROUTES*******************************/

  /***********************BEGIN: USER ROUTES*******************************/
  @Post('/users/create')
  createUser(@Body() payload: CreateUserDto) {
    return lastValueFrom(this.usersClient.send('create_user', payload));
  }
}

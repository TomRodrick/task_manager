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
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, throwError } from 'rxjs';

/**
 
   Todo: add route prefixes like /tasks and /users to controller & rm from route
   
 **/
@Controller()
export class ChoreographerController {
  constructor(
    @Inject(TASKS_SERVICE) private tasksClient: ClientProxy,
    @Inject(USERS_SERVICE) private usersClient: ClientProxy,
  ) {}
  /***********************BEGIN: TASK ROUTES*******************************/
  @Get('/tasks/list/:id')
  async listTasks(@Param('id') id) {
    return this.tasksClient
      .send('list_tasks', id)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @Post('/tasks/create')
  createTask(@Body() payload: Task_Payload<CreateTaskDto>) {
    return this.tasksClient
      .send('create_task', payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @Patch('/tasks/complete')
  completeTask(@Body() payload: Task_Payload<UpdateTaskDto>) {
    return this.tasksClient
      .send('complete_task', payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @Patch('/tasks/reopen')
  reOpenTask(@Body() payload: Task_Payload<UpdateTaskDto>) {
    return this.tasksClient
      .send('reopen_task', payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @Delete('/tasks/:id')
  deleteTask(@Param('id') id: number) {
    return this.tasksClient
      .send('delete_task', id)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }
  /***********************END: TASK ROUTES*******************************/

  /***********************BEGIN: USER ROUTES*******************************/
  @Post('/users/create')
  createUser(@Body() payload: CreateUserDto) {
    return this.usersClient
      .send('create_user', payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @Get('/users/:id')
  findUser(@Param('id') id: number) {
    return this.usersClient
      .send('find_user', id)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }
}

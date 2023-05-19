import { AuthService } from './auth/auth.service';
import {
  Controller,
  Get,
  Body,
  Inject,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  TASKS_SERVICE,
  CreateTaskDto,
  Task_Payload,
  UpdateTaskDto,
  USERS_SERVICE,
  CreateUserDto,
  Public,
} from '@app/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, throwError } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';

/**
 
   Todo: add route prefixes like /tasks and /users to controller & rm from route
   
 **/
@Controller()
export class ChoreographerController {
  constructor(
    @Inject(TASKS_SERVICE) private tasksClient: ClientProxy,
    @Inject(USERS_SERVICE) private usersClient: ClientProxy,
    private authService: AuthService,
  ) {}
  /***********************BEGIN: TASK ROUTES*******************************/
  @Get('/tasks/list/:id')
  async listTasks(@Request() req, @Param('id') id) {
    return this.tasksClient
      .send('list_tasks', { id, activeUser: req.user })
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @Post('/tasks/create')
  createTask(@Request() req, @Body() payload: Task_Payload<CreateTaskDto>) {
    payload.activeUser = req.user;
    return this.tasksClient
      .send('create_task', payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @Patch('/tasks/complete')
  completeTask(@Request() req, @Body() payload: Task_Payload<UpdateTaskDto>) {
    payload.activeUser = req.user;
    return this.tasksClient
      .send('complete_task', payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  //todo: create a decorator to automagically append activeUser to payload
  @Patch('/tasks/reopen')
  reOpenTask(@Request() req, @Body() payload: Task_Payload<UpdateTaskDto>) {
    payload.activeUser = req.user;
    return this.tasksClient
      .send('reopen_task', payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @Delete('/tasks/:id')
  deleteTask(@Request() req, @Param('id') id: number) {
    const payload = {
      activeUser: req.user,
      id,
    };
    return this.tasksClient
      .send('delete_task', payload)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }
  /***********************END: TASK ROUTES*******************************/

  /***********************BEGIN: USER ROUTES*******************************/
  @Public()
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

  // @Get('/users/:id')
  // findUser(@Param('id') id: number) {
  //   return this.usersClient
  //     .send('find_user', id)
  //     .pipe(
  //       catchError((error) =>
  //         throwError(() => new RpcException(error.response)),
  //       ),
  //     );
  // }
  /***********************End: USER ROUTES*******************************/

  /***********************BEGIN: AUTH ROUTES*******************************/
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('/auth/login')
  login(@Request() req) {
    return this.authService.login(req.user);
  }
}

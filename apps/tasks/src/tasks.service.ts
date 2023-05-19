import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ActiveUser,
  CreateTaskDto,
  IdIsValid,
  UpdateTaskDto,
  UserType,
} from '@app/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class TasksService {
  logger = new Logger();
  constructor(
    @InjectRepository(Task)
    private repo: Repository<Task>,
  ) {}

  //todo: pagination
  @IdIsValid
  public async list(technician_id: number, activeUser: ActiveUser) {
    this.userCanViewTaskList(technician_id, activeUser);

    //todo: check id is valid
    if (!technician_id || isNaN(technician_id)) {
      throw new RpcException(
        new BadRequestException(
          'technician_id is required and must be a number.',
        ),
      );
    }

    return this.repo.find({
      where: {
        technician_id,
      },
    });
  }

  //todo: userCanViewTaskList check should live here, but its a private method and it's consumers call it first, so can leave for now
  //but should be refactored
  @IdIsValid
  private async findById(id: number) {
    const query = { where: { id } };
    return this.repo.findOne(query);
  }

  public async createOne(task: CreateTaskDto, activeUser: ActiveUser) {
    this.userHasWritePermissions(activeUser);
    if (!task.description || !task.title) {
      this.throwError(
        new BadRequestException(
          "Fields 'title' and 'description' are required.",
        ),
      );
    }

    const newTask = new Task();
    newTask.description = task.description;
    newTask.technician_id = activeUser.userId;
    newTask.title = task.title;

    return this.repo.save(newTask).catch((err) => {
      //todo: ideally this is a switch base off the sql messsage so we don't accidenttally expose sensitive info about our db
      this.throwError(new BadRequestException(err.sqlMessage));
    });
  }

  //todo: userCanUpdateTask logic should really live here, but we can leave it for now because this is private
  public async updateTask(task: UpdateTaskDto) {
    return this.repo.update(task.id, task).catch((err) => {
      //todo: ideally this is a switch base off the sql messsage
      //so we don't accidenttally expose sensitive info about our db
      throw new RpcException(new BadRequestException(err.sqlMessage));
    });
  }

  public async completeTask(task: UpdateTaskDto, activeUser: ActiveUser) {
    const savedTask = await this.userCanUpdateTask(+task.id, activeUser);

    //if we already completed a task, don't update it in case of duplicated or erroneous calls
    if (savedTask?.completed_on) {
      return { affected: 0 };
    }

    const date = new Date();
    task.completed_on = date;
    const updatedTask = await this.updateTask(task);
    //Notify the manager of complete task could put into something like an email queue
    this.logger.log(
      `*****The technician ${activeUser.email} completed the task: ${savedTask.title} on ${date}*****`,
    );

    return updatedTask;
  }

  public async reOpenTask(task: UpdateTaskDto, activeUser: ActiveUser) {
    const savedTask = await this.userCanUpdateTask(+task.id, activeUser);
    task.completed_on = null;
    const updatedTask = await this.updateTask(task);
    this.logger.log(
      `*****The technician ${activeUser.email} reopened the task: ${
        savedTask.title
      } on ${new Date()}*****`,
    );

    return updatedTask;
  }

  public async delete(id: number, activeUser: ActiveUser) {
    await this.userCanUpdateTask(+id, activeUser);
    return this.repo.delete(id);
  }

  private userCanViewTaskList(technician_id: number, user: ActiveUser) {
    if (user.user_type === UserType.MANAGER || user.userId === technician_id) {
      return true;
    }
    this.throwError(
      new UnauthorizedException('You do not have access to this task list'),
    );
  }

  //VALIDATION HELPERS
  private async userCanUpdateTask(
    taskId: number,
    activeUser: ActiveUser,
  ): Promise<Task> {
    const savedTask = await this.findById(taskId);
    if (!savedTask) {
      this.throwError(new NotFoundException('Task could not be found'));
    }
    this.userHasWritePermissions(activeUser, savedTask);
    return savedTask;
  }

  private userHasWritePermissions(user: ActiveUser, task?: Task) {
    if (
      !user?.user_type ||
      user.user_type !== UserType.TECH ||
      (task && user.userId !== task.technician_id)
    ) {
      this.throwError(
        new UnauthorizedException('You do not have access to update this task'),
      );
    }
    return true;
  }

  private throwError(error) {
    throw new RpcException(error);
  }
}

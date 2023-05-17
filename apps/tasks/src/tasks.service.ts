import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto, UpdateTaskDto } from '../../../libs/common/src/dto';
import { ActiveUser } from '@app/common/interface/activeUser';

@Injectable()
export class TasksService {
  logger = new Logger();
  constructor(
    @InjectRepository(Task)
    private repo: Repository<Task>,
  ) {}

  public async list(technician_id: number) {
    if (!technician_id) {
      throw new UnauthorizedException('technician_id is required');
    }

    return this.repo.find({
      where: {
        technician_id,
      },
    });
  }

  public async findById(id) {
    const query = { where: { id } };
    return this.repo.findOne(query);
  }

  public async createOne(task: CreateTaskDto, activeUser: ActiveUser) {
    if (!task.description || !task.title) {
      return { error: "Fields 'title' and 'description' are required." };
    }

    const newTask = new Task();
    newTask.description = task.description;
    newTask.technician_id = activeUser.id;
    newTask.title = task.title;

    return this.repo.save(newTask).catch((err) => {
      //todo: ideally this is a switch base off the sql messsage
      //so we don't accidenttally expose sensitive info about our db
      return { error: err.sqlMessage };
    });
  }

  public async updateTask(task: UpdateTaskDto) {
    return this.repo.update(task.id, task).catch((err) => {
      //todo: ideally this is a switch base off the sql messsage
      //so we don't accidenttally expose sensitive info about our db
      return { error: err.sqlMessage };
    });
  }

  public async completeTask(task: UpdateTaskDto) {
    const savedTask = await this.findById(task.id);

    //if we already completed a task, don't update it.
    //in case of duplicated or erroneous calls
    if (savedTask?.completed_on) {
      return { affected: 0 };
    }

    const date = new Date();

    //Notify the manager of complete task
    //could put into something like an email queue
    this.logger.log(
      `*****The technician ${savedTask.technician_id} completed the task: ${savedTask.title} on ${date}*****`,
    );
    task.completed_on = date;
    return this.updateTask(task);
  }

  public reOpenTask(task: UpdateTaskDto) {
    //we could add similar notification logic here
    task.completed_on = null;
    return this.updateTask(task);
  }

  public delete(id: number) {
    return this.repo.delete(id);
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { ActiveUser } from '@app/common/interface/activeUser';

@Injectable()
export class TasksService {
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

  public async createOne(task: CreateTaskDto, activeUser: ActiveUser) {
    const newTask = new Task();
    newTask.description = task.description;
    newTask.technician_id = activeUser.id;
    return this.repo.save(newTask);
  }

  public async updateTask(task: UpdateTaskDto) {
    return this.repo.update(task.id, task);
  }

  public async completeTask(task: UpdateTaskDto) {
    task.completed_on = new Date();
    return this.updateTask(task);
  }

  public reOpenTask(task: UpdateTaskDto) {
    task.completed_on = null;
    return this.updateTask(task);
  }

  public delete(id: number) {
    return this.repo.delete(id);
  }
}

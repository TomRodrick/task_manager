import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe.skip('TasksController', () => {
  let tasksController: TasksController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    }).compile();

    tasksController = app.get<TasksController>(TasksController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(tasksController).toBeDefined();
    });
  });
});

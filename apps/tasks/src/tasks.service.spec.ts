import { jest } from '@jest/globals';
/* eslint-disable @typescript-eslint/no-empty-function */
import { TasksService } from './tasks.service';
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingModule, UserType } from '@app/common';
import { Task } from './task.entity';
import { Logger } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';

describe('UsersService', () => {
  let tasksService: TasksService;
  const logger = mockDeep<Logger>();
  const activeUser = {
    user_type: UserType.TECH,
    userId: 1,
    email: 'test',
  };

  const taskData = {
    title: 'test',
    description: 'test',
    id: undefined,
  };

  let task: Task;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingModule(Task)],
      providers: [TasksService],
    }).compile();
    tasksService = module.get<TasksService>(TasksService);
    module.useLogger(logger);
  });

  beforeEach(async () => {
    task = (await tasksService.createOne(taskData, activeUser)) as Task;
  });
  it('TasksService should be defined', () => {
    expect(tasksService).toBeDefined();
  });

  describe('list', () => {
    describe('When payload is NOT valid', () => {
      it('Should error if active user is a technician and tries to fetch a different users tasks', async () => {
        try {
          await tasksService.list(1000, activeUser);
        } catch (e) {
          validateError(e, 'You do not have access to this task list', 401);
        }
      });

      //todo: we should really just test the decorator validating the ID
      it('should error if technician_id is not passed', async () => {
        try {
          await tasksService.list(undefined, {
            ...activeUser,
            user_type: UserType.MANAGER,
          });
        } catch (e) {
          validateError(e, 'id is required and must be a number');
        }
      });
      it('should error if technician_id is not a number', async () => {
        try {
          //@ts-ignore
          await tasksService.list('abc', {
            ...activeUser,
            user_type: UserType.MANAGER,
          });
        } catch (e) {
          validateError(e, 'id is required and must be a number');
        }
      });
    });
    describe('When payload is valid', () => {
      beforeEach(async () => {
        await tasksService.createOne(taskData, activeUser);
        await tasksService.createOne(taskData, activeUser);
        await tasksService.createOne(taskData, activeUser);
        await tasksService.createOne(
          { ...taskData },
          { ...activeUser, userId: 999 },
        );
      });
      //todo: seed data with several tasks, some for other techs and ensure only activeUsers are returned
      it('should return an array of tasks for the technician requested', async () => {
        const res = await tasksService.list(activeUser.userId, activeUser);
        expect(Array.isArray(res));
        expect(res[0].technician_id).toBe(activeUser.userId);
        expect(res[0].title).toBe(task.title);
        expect(res[0].description).toBe(task.description);
      });
      it('should return ONLY the activeUsers tasks', async () => {
        const res = await tasksService.list(activeUser.userId, activeUser);
        res.forEach((task) => {
          expect(task.technician_id).toBe(activeUser.userId);
        });
        expect(res.length).toBe(4);
      });
      it('should return a task array if requested by a manager', async () => {
        const res = await tasksService.list(activeUser.userId, {
          ...activeUser,
          userId: 991,
          user_type: UserType.MANAGER,
        });
        res.forEach((task) => {
          expect(task.technician_id).toBe(activeUser.userId);
        });
        expect(res.length).toBe(4);
      });
    });
  });
  describe('findById', () => {
    describe('When payload is NOT valid', () => {
      it('should error if id is not a number', async () => {
        try {
          //@ts-ignore
          await tasksService.findById('');
        } catch (e) {
          validateError(e, 'id is required and must be a number');
        }
      });
      it('should error if id is undefined', async () => {
        try {
          //@ts-ignore
          await tasksService.findById(undefined);
        } catch (e) {
          validateError(e, 'id is required and must be a number');
        }
      });
    });
    describe('When payload is valid', () => {
      it('should fetch the task', async () => {
        //bracket access because its private
        const savedTask = await tasksService['findById'](task.id);
        expect(savedTask.id).toEqual(task.id);
        expect(savedTask.title).toEqual(task.title);
        expect(savedTask.technician_id).toEqual(activeUser.userId);
      });
    });
  });
  describe('createOne', () => {
    describe('When payload is NOT valid', () => {
      it('Should error if a manager tries to create a task', async () => {
        try {
          await tasksService.createOne(taskData, {
            ...activeUser,
            user_type: UserType.MANAGER,
          });
        } catch (e) {
          validateError(e, 'You do not have access to update this task', 401);
        }
      });
      it('Should error if title is not provided', async () => {
        try {
          await tasksService.createOne(
            { ...taskData, title: undefined },
            activeUser,
          );
        } catch (e) {
          validateError(e, "Fields 'title' and 'description' are required.");
        }
      });
      it('Should error if description is not provided', async () => {
        try {
          await tasksService.createOne(
            { ...taskData, description: undefined },
            activeUser,
          );
        } catch (e) {
          validateError(e, "Fields 'title' and 'description' are required.");
        }
      });
    });
    describe('When payload is valid', () => {
      it('should create a task and assign it to the active user', async () => {
        const savedTask = (await tasksService.createOne(
          taskData,
          activeUser,
        )) as Task;
        expect(savedTask.title).toBe(taskData.title);
        expect(savedTask.description).toBe(taskData.description);
        expect(savedTask.technician_id).toBe(activeUser.userId);
      });
    });
  });
  //this is really just a db call and its private, so it'll essentially be tested in the following tasks
  describe('updateTask', () => {
    describe('When payload is NOT valid', () => {});
    describe('When payload is valid', () => {});
  });
  describe('completeTask', () => {
    let task2: Task;

    beforeEach(async () => {
      task2 = (await tasksService.createOne(taskData, {
        ...activeUser,
        userId: 100,
      })) as Task;
    });
    describe('When payload is NOT valid', () => {
      it('should error when a tech tries to update a task not assigned to him', async () => {
        try {
          await tasksService.completeTask(task2, activeUser);
        } catch (e) {
          validateError(e, 'You do not have access to update this task', 401);
        }
      });
      it('should error when a manager tries to update a task', async () => {
        try {
          await tasksService.completeTask(task2, {
            ...activeUser,
            user_type: UserType.MANAGER,
          });
        } catch (e) {
          validateError(e, 'You do not have access to update this task', 401);
        }
      });
      it('should error when the task does not exist', async () => {
        try {
          await tasksService.completeTask(
            { ...task, id: 10000 },
            {
              ...activeUser,
              user_type: UserType.MANAGER,
            },
          );
        } catch (e) {
          validateError(e, 'Task could not be found', 404);
        }
      });
    });
    describe('When payload is valid', () => {
      it('should set the completed_on date', async () => {
        await tasksService.completeTask(task, activeUser);
        const updatedTask = await tasksService['findById'](task.id);
        expect(updatedTask.completed_on).toBeTruthy();
      });
      it('should notify the manager', async () => {
        await tasksService.completeTask(task, activeUser);
        const updatedTask = await tasksService['findById'](task.id);
        expect(logger.log).toHaveBeenCalledWith(
          `*****The technician ${activeUser.email} completed the task: ${updatedTask.title} on ${updatedTask.completed_on}*****`,
        );
      });
    });
  });
  describe('reOpenTask', () => {
    describe('When payload is NOT valid', () => {
      it('should error when a tech tries to update a task not assigned to him', async () => {
        try {
          await tasksService.reOpenTask(task, { ...activeUser, userId: 999 });
        } catch (e) {
          validateError(e, 'You do not have access to update this task', 401);
        }
      });
      it('should error when a manager tries to update a task', async () => {
        try {
          await tasksService.reOpenTask(task, {
            ...activeUser,
            user_type: UserType.MANAGER,
          });
        } catch (e) {
          validateError(e, 'You do not have access to update this task', 401);
        }
      });
      it('should error when the task does not exist', async () => {
        try {
          await tasksService.reOpenTask({ ...task, id: 10000 }, activeUser);
        } catch (e) {
          validateError(e, 'Task could not be found', 404);
        }
      });
    });
    describe('When payload is valid', () => {
      it('should set completed_on to be null', async () => {
        await tasksService.completeTask(task, activeUser);
        await tasksService.reOpenTask(task, activeUser);
        const updatedTask = await tasksService['findById'](task.id);
        expect(updatedTask.completed_on).toBe(null);
      });
    });
  });

  //todo: userCanViewTaskList, userCanUpdateTask, userHasWritePermissions tests
  describe('userCanViewTaskList', () => {
    describe('When payload is NOT valid', () => {});
    describe('When payload is valid', () => {});
  });
  describe('userHasWritePermissions', () => {
    describe('When payload is NOT valid', () => {});
    describe('When payload is valid', () => {});
  });
  describe('userCanUpdateTask', () => {
    describe('When payload is NOT valid', () => {});
    describe('When payload is valid', () => {});
  });
});

const validateError = (e, msg, code = 400) => {
  e = e.getError().response;
  expect(e.message).toEqual(msg);
  expect(e.statusCode).toEqual(code);
};

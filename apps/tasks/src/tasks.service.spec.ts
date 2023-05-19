/* eslint-disable @typescript-eslint/no-empty-function */
import { TasksService } from './tasks.service';
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingModule, UserType } from '@app/common';
import { Task } from './task.entity';

describe.only('UsersService', () => {
  let tasksService: TasksService;
  const activeUser = {
    user_type: UserType.TECH,
    userId: 1,
    email: 'test',
  };
  let task = {
    title: 'test',
    description: 'test',
    id: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingModule(Task)],
      providers: [TasksService],
    }).compile();
    tasksService = module.get<TasksService>(TasksService);
  });

  beforeEach(async () => {
    task = await tasksService.createOne(task, activeUser);
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
      //todo: seed data with tasks for other techs and ensure its not returned
      it('should return an array of tasks for the technician requested', async () => {
        const res = await tasksService.list(activeUser.userId, activeUser);
        expect(Array.isArray(res));
        expect(res[0].technician_id).toBe(activeUser.userId);
        expect(res[0].title).toBe(task.title);
        expect(res[0].description).toBe(task.description);
      });
    });
  });
  describe('findById', () => {
    describe('When payload is NOT valid', () => {
      it('should error if id is not a number', async () => {
        try {
          //@ts-ignore
          await tasksService.findById('', activeUser);
        } catch (e) {
          validateError(e, 'id is required and must be a number');
        }
      });
      it('should error if id is undefined', async () => {
        try {
          //@ts-ignore
          await tasksService.findById(undefined, activeUser);
        } catch (e) {
          validateError(e, 'id is required and must be a number');
        }
      });
    });
    describe('When payload is valid', () => {
      it('should fetch the task', async () => {
        const savedTask = await tasksService.findById(task.id, activeUser);
        expect(savedTask.id).toEqual(task.id);
        expect(savedTask.title).toEqual(task.title);
        expect(savedTask.technician_id).toEqual(activeUser.userId);
      });
    });
  });
  describe('createOne', () => {
    describe('When payload is NOT valid', () => {});
    describe('When payload is valid', () => {});
  });
  describe('updateTask', () => {
    describe('When payload is NOT valid', () => {});
    describe('When payload is valid', () => {});
  });
  describe('completeTask', () => {
    describe('When payload is NOT valid', () => {});
    describe('When payload is valid', () => {});
  });
  describe('reOpenTask', () => {
    describe('When payload is NOT valid', () => {});
    describe('When payload is valid', () => {});
  });
  describe('userCanViewTaskList', () => {
    describe('When payload is NOT valid', () => {});
    describe('When payload is valid', () => {});
  });
  describe('userHasWritePermissions', () => {
    describe('When payload is NOT valid', () => {});
    describe('When payload is valid', () => {});
  });
});

const validateError = (e, msg, code = 400) => {
  e = e.getError().response;
  expect(e.message).toEqual(msg);
  expect(e.statusCode).toEqual(code);
};

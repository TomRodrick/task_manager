/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { TypeOrmTestingModule, UserType } from '@app/common';
import { User } from './user.entity';

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingModule(User)],
      providers: [UsersService],
    }).compile();
    usersService = module.get<UsersService>(UsersService);
  });

  it('UsersService should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('createOne', () => {
    describe('When payload is invalid', () => {
      it('should enforce user_type value as manager or technician', async () => {
        try {
          await usersService.createOne({
            //@ts-ignore
            user_type: 'asdasd',
            email: 'test',
            password: 'test',
          });
        } catch (e) {
          e = e.getError().response;
          expect(e.message).toEqual(
            'user_type must be either technician or manager',
          );
          expect(e.statusCode).toEqual(400);
        }
      });

      it('should error if email does not exist', async () => {
        try {
          //@ts-ignore
          await usersService.createOne({
            user_type: UserType.TECH,
          });
        } catch (e) {
          e = e.getError().response;
          expect(e.message).toEqual(
            'email, password, and user_type are required',
          );
          expect(e.statusCode).toEqual(400);
        }
      });

      it('should error if user_type does not exist', async () => {
        try {
          await usersService.createOne({
            email: 'test',
          });
        } catch (e) {
          e = e.getError().response;

          expect(e.message).toEqual(
            'email, password, and user_type are required',
          );
          expect(e.statusCode).toEqual(400);
        }
      });
    });

    describe('When payload is valid', () => {
      it('should create and return the user', async () => {
        const res = (await usersService.createOne({
          user_type: UserType.MANAGER,
          email: 'test',
          password: 'test',
        })) as User;

        expect(res.email).toEqual('test');
        expect(res.user_type).toEqual(UserType.MANAGER);
        expect(res.created_at).toBeDefined();
        expect(res.updated_at).toBeDefined();
        expect(res.id).toBeDefined();
      });
    });

    //todo: checks when save() fails
  });

  describe('findById', () => {
    let user: User;
    beforeEach(async () => {
      user = (await usersService.createOne({
        user_type: UserType.MANAGER,
        email: 'test',
        password: 'test',
      })) as User;
    });

    describe('When arguments are valid', () => {
      it('Should return the correct user', async () => {
        const res = (await usersService.findById(+user.id)) as User;
        expect(res.id).toEqual(user.id);
        expect(res.email).toEqual(user.email);
      });
    });
    describe('When arguments are invalid', () => {
      it('Should return an error when id is invalid', async () => {
        try {
          //@ts-ignore
          await usersService.findById('id');
        } catch (e) {
          e = e.getError().response;
          expect(e.statusCode).toEqual(400);
          expect(e.message).toEqual('id must be a number');
        }
      });
    });
  });
});

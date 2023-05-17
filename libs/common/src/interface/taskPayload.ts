import { ActiveUser } from './activeUser';

export interface Task_Payload<T> {
  activeUser: ActiveUser;
  task: T;
}

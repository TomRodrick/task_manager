import { UserType } from '../enum/userType.enum';

export interface ActiveUser {
  userId: number;
  user_type: UserType;
  email: string;
}

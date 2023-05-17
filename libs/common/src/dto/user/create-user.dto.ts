import { UserType } from '@app/common/enum/userType.enum';

export class CreateUserDto {
  email: string;
  user_type?: UserType;
}

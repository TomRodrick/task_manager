import { UserType } from '@app/common/enum/userType.enum';

export class CreateUserDto {
  email: string;
  title?: UserType;
}

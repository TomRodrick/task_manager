import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends CreateTaskDto {
  id: number;
  completed_on?: Date | null;
}

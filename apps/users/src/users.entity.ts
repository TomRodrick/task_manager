import { UserType } from '@app/common';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment') //typically would use UUID but we are using "synchronize:true" for dev purposes which has issues with uuidss
  id: number;

  @Column({
    type: 'enum',
    enum: UserType,
  })
  user_type: UserType;

  @CreateDateColumn()
  created_at: Date; // Creation date

  @UpdateDateColumn()
  updated_at: Date;

  @Column('varchar', { length: 250 })
  email: string;
}

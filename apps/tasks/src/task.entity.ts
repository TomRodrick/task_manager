import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('increment') //typically would use UUID but we are using "synchronize:true" for dev purposes which has issues with uuidss
  id: number;

  @Column('varchar', { length: 2500 })
  description: string;

  @Column({ default: null })
  completed_on: Date;

  @CreateDateColumn()
  created_at: Date; // Creation date

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  technician_id: number;
}

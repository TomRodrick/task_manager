import { UserType } from '@app/common';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as crypto from 'crypto';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment') //typically would use UUID but we are using "synchronize:true" for dev purposes which has issues with uuidss
  id: number;

  @Column('varchar', { length: 20 }) //todo: this should ideally be an enum type, but having compatability issues
  user_type: UserType;

  @CreateDateColumn()
  created_at: Date; // Creation date

  @UpdateDateColumn()
  updated_at: Date;

  @Column('varchar', { length: 250 })
  email: string;

  @Column('varchar', { default: null })
  private hash: string;

  @Column('varchar', { default: null })
  private salt: string;

  @Column('varchar', { default: null })
  refresh_token: string;

  public set password(password: string) {
    // Creating a unique salt for a particular user
    this.salt = crypto.randomBytes(16).toString('hex');

    // Hashing user's salt and password with 1000 iterations,
    this.hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
      .toString(`hex`);
  }

  public validPassword(password: string) {
    const hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
      .toString(`hex`);
    return this.hash === hash;
  }
}

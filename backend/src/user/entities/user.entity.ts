import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type UserRole = 'user' | 'admin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, nullable: false, length: 190 })
  email!: string;

  @Exclude()
  @Column({ nullable: false, select: false, length: 255 })
  password!: string;

  @Column({ name: 'full_name', nullable: false, length: 120 })
  fullName!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role!: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

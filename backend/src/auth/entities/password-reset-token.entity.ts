import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('password_reset_tokens')
@Index(['userId', 'usedAt'])
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'token_hash', type: 'char', length: 64, unique: true })
  tokenHash!: string;

  @Column({ name: 'expires_at', type: 'datetime', precision: 6 })
  expiresAt!: Date;

  @Column({ name: 'used_at', type: 'datetime', precision: 6, nullable: true })
  usedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;
}

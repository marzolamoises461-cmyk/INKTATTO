import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ length: 80 })
  artist!: string;

  @Column({ type: 'date', name: 'booking_date' })
  date!: string;

  @Column({ type: 'time', name: 'preferred_time' })
  time!: string;

  @Column({ name: 'body_area', length: 80 })
  bodyArea!: string;

  @Column({ length: 80 })
  size!: string;

  @Column({ type: 'varchar', length: 1200 })
  idea!: string;

  @Column({ type: 'enum', enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' })
  status!: BookingStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

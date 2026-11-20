import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { BookingStatus } from './booking.entity';

@Entity('booking_status_history')
@Index(['bookingId', 'changedAt'])
export class BookingStatusHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'booking_id', type: 'int' })
  bookingId!: number;

  @Column({ name: 'from_status', type: 'enum', enum: ['pending', 'quoted', 'confirmed', 'completed', 'cancelled', 'rejected'], nullable: true })
  fromStatus!: BookingStatus | null;

  @Column({ name: 'to_status', type: 'enum', enum: ['pending', 'quoted', 'confirmed', 'completed', 'cancelled', 'rejected'] })
  toStatus!: BookingStatus;

  @Column({ name: 'actor_id', type: 'int', nullable: true })
  actorId!: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_id' })
  actor!: User | null;

  @Column({ name: 'actor_email', type: 'varchar', length: 190, nullable: true })
  actorEmail!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'changed_at', type: 'datetime', precision: 6 })
  changedAt!: Date;
}

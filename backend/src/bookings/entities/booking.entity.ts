import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Artist } from '../../artists/entities/artist.entity';
import { User } from '../../user/entities/user.entity';
import { BookingReferenceImage } from './booking-reference-image.entity';

export type BookingStatus = 'pending' | 'quoted' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

@Entity('bookings')
@Index(['artistId', 'date', 'time'])
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => BookingReferenceImage, (image) => image.booking)
  referenceImages!: BookingReferenceImage[];

  @Column({ name: 'artist_id', type: 'int', nullable: true })
  artistId!: number | null;

  @ManyToOne(() => Artist, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'artist_id' })
  artistProfile!: Artist | null;

  @Column({ length: 80 })
  artist!: string;

  @Column({ type: 'date', name: 'booking_date' })
  date!: string;

  @Column({ type: 'time', name: 'preferred_time' })
  time!: string;

  @Column({ name: 'duration_minutes', type: 'smallint', unsigned: true, default: 60 })
  durationMinutes!: number;

  @Column({ name: 'body_area', length: 80 })
  bodyArea!: string;

  @Column({ length: 80 })
  size!: string;

  @Column({ type: 'varchar', length: 1200 })
  idea!: string;

  @Column({ type: 'enum', enum: ['pending', 'quoted', 'confirmed', 'completed', 'cancelled', 'rejected'], default: 'pending' })
  status!: BookingStatus;

  @Column({ name: 'quoted_price', type: 'decimal', precision: 14, scale: 2, nullable: true })
  quotedPrice!: string | null;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 14, scale: 2, nullable: true })
  depositAmount!: string | null;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes!: string | null;

  @Column({ name: 'cancellation_reason', type: 'varchar', length: 500, nullable: true })
  cancellationReason!: string | null;

  @Column({ name: 'rejection_reason', type: 'varchar', length: 500, nullable: true })
  rejectionReason!: string | null;

  @Column({ name: 'cancelled_at', type: 'datetime', precision: 6, nullable: true })
  cancelledAt!: Date | null;

  @Column({ name: 'reminder_sent_at', type: 'datetime', precision: 6, nullable: true })
  reminderSentAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;
}

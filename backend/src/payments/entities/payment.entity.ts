import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

export type PaymentStatus = 'pending' | 'approved' | 'declined' | 'voided' | 'error';

@Entity('payments')
@Index(['reference'], { unique: true })
@Index(['bookingId', 'status'])
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'booking_id', type: 'int' })
  bookingId!: number;

  @ManyToOne(() => Booking, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;

  @Column({ type: 'varchar', length: 100 })
  reference!: string;

  @Column({ name: 'provider_transaction_id', type: 'varchar', length: 100, nullable: true })
  providerTransactionId!: string | null;

  @Column({ name: 'amount_in_cents', type: 'int', unsigned: true })
  amountInCents!: number;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'declined', 'voided', 'error'], default: 'pending' })
  status!: PaymentStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;
}

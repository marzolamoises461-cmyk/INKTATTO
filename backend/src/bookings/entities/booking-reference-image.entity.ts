import { Exclude } from 'class-transformer';
import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Booking } from './booking.entity';

@Entity('booking_reference_images')
export class BookingReferenceImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'booking_id' })
  bookingId!: number;

  @ManyToOne(() => Booking, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;

  @Exclude()
  @Column({ name: 'object_key', length: 512 })
  objectKey!: string;

  @Column({ name: 'original_name', length: 255 })
  originalName!: string;

  @Column({ name: 'mime_type', length: 50 })
  mimeType!: string;

  @Column({ name: 'size_bytes', type: 'int', unsigned: true })
  sizeBytes!: number;

  @Exclude()
  @Column({ name: 'storage_url', length: 1024 })
  storageUrl!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

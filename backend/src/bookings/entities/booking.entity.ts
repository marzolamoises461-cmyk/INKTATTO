import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { StaffMember } from '../../staff/entities/staff-member.entity';

export type BookingStatus = 'pending' | 'quoted' | 'confirmed' | 'completed' | 'cancelled';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn() id!: number;
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) user!: User;
  @ManyToOne(() => StaffMember, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'artist_id' }) artistMember!: StaffMember | null;
  @Column({ name: 'artist_id', type: 'int', nullable: true, insert: false, update: false }) artistId!: number | null;
  @Column({ length: 80 }) artist!: string;
  @Column({ type: 'date', name: 'booking_date' }) date!: string;
  @Column({ type: 'time', name: 'preferred_time' }) time!: string;
  @Column({ name: 'body_area', length: 80 }) bodyArea!: string;
  @Column({ length: 80 }) size!: string;
  @Column({ type: 'varchar', length: 1200 }) idea!: string;
  @Column({ name: 'reference_images', type: 'json', nullable: true }) referenceImages!: string[] | null;
  @Column({ type: 'enum', enum: ['pending', 'quoted', 'confirmed', 'completed', 'cancelled'], default: 'pending' }) status!: BookingStatus;
  @Column({ name: 'quoted_price', type: 'decimal', precision: 12, scale: 2, nullable: true }) quotedPrice!: string | null;
  @Column({ name: 'studio_notes', type: 'text', nullable: true }) studioNotes!: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}

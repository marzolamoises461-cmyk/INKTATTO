import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('staff_members')
export class StaffMember {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ length: 120 }) name!: string;
  @Column({ length: 100 }) specialty!: string;
  @Column({ type: 'text', nullable: true }) bio!: string | null;
  @Column({ name: 'image_url', type: 'mediumtext', nullable: true }) imageUrl!: string | null;
  @Column({ name: 'is_active', default: true }) isActive!: boolean;
  @Column({ name: 'working_days', type: 'json', nullable: true }) workingDays!: number[] | null;
  @Column({ name: 'workday_start', type: 'time', default: '10:00:00' }) workdayStart!: string;
  @Column({ name: 'workday_end', type: 'time', default: '18:00:00' }) workdayEnd!: string;
  @Column({ name: 'slot_duration_minutes', type: 'smallint', default: 60 }) slotDurationMinutes!: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('staff_members')
export class StaffMember {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ length: 120 }) name!: string;
  @Column({ length: 100 }) specialty!: string;
  @Column({ type: 'text', nullable: true }) bio!: string | null;
  @Column({ name: 'image_url', type: 'mediumtext', nullable: true }) imageUrl!: string | null;
  @Column({ name: 'is_active', default: true }) isActive!: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('tattoo_designs')
export class TattooDesign {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 80 })
  category!: string;

  @Column({ length: 80 })
  style!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Column({ name: 'image_url', type: 'varchar', length: 1500 })
  imageUrl!: string;

  @Column({ type: 'varchar', length: 1200 })
  description!: string;

  @Column({ type: 'varchar', length: 1200, default: '' })
  review!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

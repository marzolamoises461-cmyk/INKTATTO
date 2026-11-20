import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('artists')
export class Artist {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ length: 80 })
  slug!: string;

  @Column({ name: 'display_name', length: 120 })
  displayName!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}

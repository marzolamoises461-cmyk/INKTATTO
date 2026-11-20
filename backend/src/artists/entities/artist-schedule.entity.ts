import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Artist } from './artist.entity';

@Entity('artist_schedules')
@Index(['artistId', 'weekday'])
export class ArtistSchedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'artist_id' })
  artistId!: number;

  @ManyToOne(() => Artist, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artist_id' })
  artist!: Artist;

  @Column({ type: 'tinyint', unsigned: true })
  weekday!: number;

  @Column({ name: 'opens_at', type: 'time' })
  opensAt!: string;

  @Column({ name: 'closes_at', type: 'time' })
  closesAt!: string;
}

import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Artist } from './artist.entity';

@Entity('artist_blocks')
@Index(['artistId', 'blockedDate'])
export class ArtistBlock {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'artist_id' })
  artistId!: number;

  @ManyToOne(() => Artist, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'artist_id' })
  artist!: Artist;

  @Column({ name: 'blocked_date', type: 'date' })
  blockedDate!: string;

  @Column({ name: 'starts_at', type: 'time', nullable: true })
  startsAt!: string | null;

  @Column({ name: 'ends_at', type: 'time', nullable: true })
  endsAt!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason!: string | null;
}

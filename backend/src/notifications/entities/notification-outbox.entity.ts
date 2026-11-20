import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type NotificationStatus = 'pending' | 'sending' | 'sent' | 'failed';

@Entity('notification_outbox')
@Index(['status', 'availableAt'])
export class NotificationOutbox {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'event_type', type: 'varchar', length: 60 })
  eventType!: string;

  @Column({ name: 'entity_id', type: 'int', nullable: true })
  entityId!: number | null;

  @Column({ name: 'recipient_email', type: 'varchar', length: 190 })
  recipientEmail!: string;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({ name: 'text_body', type: 'text' })
  textBody!: string;

  @Column({ name: 'dedupe_key', type: 'varchar', length: 190, nullable: true, unique: true })
  dedupeKey!: string | null;

  @Column({ type: 'enum', enum: ['pending', 'sending', 'sent', 'failed'], default: 'pending' })
  status!: NotificationStatus;

  @Column({ name: 'attempt_count', type: 'tinyint', unsigned: true, default: 0 })
  attemptCount!: number;

  @Column({ name: 'available_at', type: 'datetime', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
  availableAt!: Date;

  @Column({ name: 'last_error', type: 'varchar', length: 1000, nullable: true })
  lastError!: string | null;

  @Column({ name: 'sent_at', type: 'datetime', precision: 6, nullable: true })
  sentAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;
}

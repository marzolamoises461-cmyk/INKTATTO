import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationOutbox1794520000000 implements MigrationInterface {
  name = 'CreateNotificationOutbox1794520000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE notification_outbox (
        id INT NOT NULL AUTO_INCREMENT,
        event_type VARCHAR(60) NOT NULL,
        entity_id INT NULL,
        recipient_email VARCHAR(190) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        text_body TEXT NOT NULL,
        dedupe_key VARCHAR(190) NULL,
        status ENUM('pending', 'sending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
        attempt_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
        available_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        last_error VARCHAR(1000) NULL,
        sent_at DATETIME(6) NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_notification_outbox_dedupe_key (dedupe_key),
        INDEX IDX_notification_outbox_status_available (status, available_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE notification_outbox');
  }
}

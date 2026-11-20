import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBookingWorkflowAudit1794510000000 implements MigrationInterface {
  name = 'AddBookingWorkflowAudit1794510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE bookings
        MODIFY COLUMN status ENUM('pending', 'quoted', 'confirmed', 'completed', 'cancelled', 'rejected')
          NOT NULL DEFAULT 'pending'
    `);
    await queryRunner.query(`
      ALTER TABLE bookings
        ADD COLUMN quoted_price DECIMAL(14,2) NULL,
        ADD COLUMN deposit_amount DECIMAL(14,2) NULL,
        ADD COLUMN admin_notes TEXT NULL,
        ADD COLUMN cancellation_reason VARCHAR(500) NULL,
        ADD COLUMN rejection_reason VARCHAR(500) NULL,
        ADD COLUMN cancelled_at DATETIME(6) NULL,
        ADD COLUMN reminder_sent_at DATETIME(6) NULL,
        ADD COLUMN updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
          ON UPDATE CURRENT_TIMESTAMP(6)
    `);
    await queryRunner.query(`
      CREATE TABLE booking_status_history (
        id INT NOT NULL AUTO_INCREMENT,
        booking_id INT NOT NULL,
        from_status ENUM('pending', 'quoted', 'confirmed', 'completed', 'cancelled', 'rejected') NULL,
        to_status ENUM('pending', 'quoted', 'confirmed', 'completed', 'cancelled', 'rejected') NOT NULL,
        actor_id INT NULL,
        actor_email VARCHAR(190) NULL,
        note VARCHAR(500) NULL,
        changed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        INDEX IDX_booking_status_history_booking_changed (booking_id, changed_at),
        CONSTRAINT FK_booking_status_history_booking FOREIGN KEY (booking_id)
          REFERENCES bookings(id) ON DELETE CASCADE,
        CONSTRAINT FK_booking_status_history_actor FOREIGN KEY (actor_id)
          REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await queryRunner.query(`
      INSERT INTO booking_status_history (booking_id, from_status, to_status, actor_id, note, changed_at)
      SELECT id, NULL, status, NULL, 'Estado existente antes del registro de historial', created_at
      FROM bookings
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [{ count }] = await queryRunner.query(`
      SELECT COUNT(*) AS count
      FROM bookings
      WHERE status IN ('quoted', 'completed', 'rejected')
    `) as Array<{ count: number | string }>;
    if (Number(count) > 0) {
      throw new Error(
        'Cannot revert booking workflow while bookings use quoted, completed, or rejected statuses.',
      );
    }

    await queryRunner.query('DROP TABLE booking_status_history');
    await queryRunner.query(`
      ALTER TABLE bookings
        MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending'
    `);
    await queryRunner.query(`
      ALTER TABLE bookings
        DROP COLUMN quoted_price,
        DROP COLUMN deposit_amount,
        DROP COLUMN admin_notes,
        DROP COLUMN cancellation_reason,
        DROP COLUMN rejection_reason,
        DROP COLUMN cancelled_at,
        DROP COLUMN reminder_sent_at,
        DROP COLUMN updated_at
    `);
  }
}

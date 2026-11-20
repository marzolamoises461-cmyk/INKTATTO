import { MigrationInterface, QueryRunner } from 'typeorm';

export class BookingAgendaAndWorkflow1794480100000 implements MigrationInterface {
  name = 'BookingAgendaAndWorkflow1794480100000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE staff_members
      ADD COLUMN working_days JSON NULL,
      ADD COLUMN workday_start TIME NOT NULL DEFAULT '10:00:00',
      ADD COLUMN workday_end TIME NOT NULL DEFAULT '18:00:00',
      ADD COLUMN slot_duration_minutes SMALLINT NOT NULL DEFAULT 60`);
    await queryRunner.query(`ALTER TABLE bookings
      ADD COLUMN artist_id INT NULL,
      ADD COLUMN reference_images JSON NULL,
      ADD COLUMN quoted_price DECIMAL(12,2) NULL,
      ADD COLUMN studio_notes TEXT NULL`);
    await queryRunner.query(`ALTER TABLE bookings
      MODIFY COLUMN status ENUM('pending','quoted','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending'`);
    await queryRunner.query(`ALTER TABLE bookings
      ADD INDEX IDX_bookings_artist_date (artist_id, booking_date),
      ADD CONSTRAINT FK_bookings_artist_id FOREIGN KEY (artist_id)
      REFERENCES staff_members(id) ON DELETE RESTRICT`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE bookings DROP FOREIGN KEY FK_bookings_artist_id');
    await queryRunner.query('ALTER TABLE bookings DROP INDEX IDX_bookings_artist_date');
    await queryRunner.query(`ALTER TABLE bookings MODIFY COLUMN status ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending'`);
    await queryRunner.query('ALTER TABLE bookings DROP COLUMN studio_notes, DROP COLUMN quoted_price, DROP COLUMN reference_images, DROP COLUMN artist_id');
    await queryRunner.query('ALTER TABLE staff_members DROP COLUMN slot_duration_minutes, DROP COLUMN workday_end, DROP COLUMN workday_start, DROP COLUMN working_days');
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingReferenceImages1794500000000 implements MigrationInterface {
  name = 'CreateBookingReferenceImages1794500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE booking_reference_images (
        id INT NOT NULL AUTO_INCREMENT,
        booking_id INT NOT NULL,
        object_key VARCHAR(512) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(50) NOT NULL,
        size_bytes INT UNSIGNED NOT NULL,
        storage_url VARCHAR(1024) NOT NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        INDEX IDX_booking_reference_images_booking (booking_id),
        CONSTRAINT FK_booking_reference_images_booking FOREIGN KEY (booking_id)
          REFERENCES bookings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE booking_reference_images');
  }
}

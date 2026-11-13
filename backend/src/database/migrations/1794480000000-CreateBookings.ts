import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookings1794480000000 implements MigrationInterface {
  name = 'CreateBookings1794480000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        artist VARCHAR(80) NOT NULL,
        booking_date DATE NOT NULL,
        preferred_time TIME NOT NULL,
        body_area VARCHAR(80) NOT NULL,
        size VARCHAR(80) NOT NULL,
        idea VARCHAR(1200) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        INDEX IDX_bookings_user_id (user_id),
        CONSTRAINT FK_bookings_user_id FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS bookings');
  }
}

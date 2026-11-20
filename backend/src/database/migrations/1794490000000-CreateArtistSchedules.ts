import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArtistSchedules1794490000000 implements MigrationInterface {
  name = 'CreateArtistSchedules1794490000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE artists (
        id INT NOT NULL AUTO_INCREMENT,
        slug VARCHAR(80) NOT NULL,
        display_name VARCHAR(120) NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (id),
        UNIQUE KEY UQ_artists_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await queryRunner.query(`
      INSERT INTO artists (slug, display_name) VALUES
        ('faver', 'Faver'),
        ('ernestor', 'Ernestor'),
        ('jorge', 'Jorge')
    `);
    await queryRunner.query(`
      CREATE TABLE artist_schedules (
        id INT NOT NULL AUTO_INCREMENT,
        artist_id INT NOT NULL,
        weekday TINYINT UNSIGNED NOT NULL,
        opens_at TIME NOT NULL,
        closes_at TIME NOT NULL,
        PRIMARY KEY (id),
        INDEX IDX_artist_schedules_artist_weekday (artist_id, weekday),
        CONSTRAINT FK_artist_schedules_artist FOREIGN KEY (artist_id)
          REFERENCES artists(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await queryRunner.query(`
      CREATE TABLE artist_blocks (
        id INT NOT NULL AUTO_INCREMENT,
        artist_id INT NOT NULL,
        blocked_date DATE NOT NULL,
        starts_at TIME NULL,
        ends_at TIME NULL,
        reason VARCHAR(255) NULL,
        PRIMARY KEY (id),
        INDEX IDX_artist_blocks_artist_date (artist_id, blocked_date),
        CONSTRAINT FK_artist_blocks_artist FOREIGN KEY (artist_id)
          REFERENCES artists(id) ON DELETE CASCADE,
        CONSTRAINT CHK_artist_blocks_times CHECK (
          (starts_at IS NULL AND ends_at IS NULL) OR
          (starts_at IS NOT NULL AND ends_at IS NOT NULL AND starts_at < ends_at)
        )
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await queryRunner.query(`
      ALTER TABLE bookings
        ADD COLUMN artist_id INT NULL,
        ADD COLUMN duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 60,
        MODIFY COLUMN status ENUM('pending', 'quoted', 'confirmed', 'completed', 'cancelled', 'rejected')
          NOT NULL DEFAULT 'pending',
        ADD INDEX IDX_bookings_artist_date_time (artist_id, booking_date, preferred_time),
        ADD CONSTRAINT FK_bookings_artist FOREIGN KEY (artist_id)
          REFERENCES artists(id) ON DELETE SET NULL
    `);
    await queryRunner.query(`
      UPDATE bookings b
      INNER JOIN artists a ON a.slug = b.artist
      SET b.artist_id = a.id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE bookings DROP FOREIGN KEY FK_bookings_artist');
    await queryRunner.query('ALTER TABLE bookings DROP INDEX IDX_bookings_artist_date_time');
    await queryRunner.query(`
      ALTER TABLE bookings
        DROP COLUMN artist_id,
        DROP COLUMN duration_minutes,
        MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending'
    `);
    await queryRunner.query('DROP TABLE artist_blocks');
    await queryRunner.query('DROP TABLE artist_schedules');
    await queryRunner.query('DROP TABLE artists');
  }
}

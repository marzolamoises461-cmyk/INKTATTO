import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePayments1794560000000 implements MigrationInterface {
  name = 'CreatePayments1794560000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE payments (
        id INT NOT NULL AUTO_INCREMENT,
        booking_id INT NOT NULL,
        reference VARCHAR(100) NOT NULL,
        provider_transaction_id VARCHAR(100) NULL,
        amount_in_cents INT UNSIGNED NOT NULL,
        status ENUM('pending', 'approved', 'declined', 'voided', 'error') NOT NULL DEFAULT 'pending',
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_payments_reference (reference),
        INDEX IDX_payments_booking_status (booking_id, status),
        CONSTRAINT FK_payments_booking FOREIGN KEY (booking_id)
          REFERENCES bookings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE payments');
  }
}

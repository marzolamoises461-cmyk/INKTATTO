import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmailVerificationTokens1794540000000 implements MigrationInterface {
  name = 'CreateEmailVerificationTokens1794540000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE email_verification_tokens (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        token_hash CHAR(64) NOT NULL,
        expires_at DATETIME(6) NOT NULL,
        used_at DATETIME(6) NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_email_verification_tokens_hash (token_hash),
        INDEX IDX_email_verification_tokens_user_used (user_id, used_at),
        CONSTRAINT FK_email_verification_tokens_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE email_verification_tokens');
  }
}

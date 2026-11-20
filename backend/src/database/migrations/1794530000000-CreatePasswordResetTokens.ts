import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePasswordResetTokens1794530000000 implements MigrationInterface {
  name = 'CreatePasswordResetTokens1794530000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE password_reset_tokens (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        token_hash CHAR(64) NOT NULL,
        expires_at DATETIME(6) NOT NULL,
        used_at DATETIME(6) NULL,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_password_reset_tokens_hash (token_hash),
        INDEX IDX_password_reset_tokens_user_used (user_id, used_at),
        CONSTRAINT FK_password_reset_tokens_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE password_reset_tokens');
  }
}

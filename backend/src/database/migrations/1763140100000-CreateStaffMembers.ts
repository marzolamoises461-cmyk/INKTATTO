import { MigrationInterface, QueryRunner } from 'typeorm';
export class CreateStaffMembers1763140100000 implements MigrationInterface {
  name = 'CreateStaffMembers1763140100000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS staff_members (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      specialty VARCHAR(100) NOT NULL,
      bio TEXT NULL,
      image_url VARCHAR(1500) NULL,
      is_active TINYINT NOT NULL DEFAULT 1,
      created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      PRIMARY KEY (id)
    ) ENGINE=InnoDB`);
  }
  async down(queryRunner: QueryRunner): Promise<void> { await queryRunner.query('DROP TABLE IF EXISTS staff_members'); }
}
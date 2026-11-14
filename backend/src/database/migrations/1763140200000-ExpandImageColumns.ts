import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandImageColumns1763140200000 implements MigrationInterface {
  name = 'ExpandImageColumns1763140200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE tattoo_designs MODIFY image_url MEDIUMTEXT NOT NULL');
    await queryRunner.query('ALTER TABLE staff_members MODIFY image_url MEDIUMTEXT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE tattoo_designs MODIFY image_url VARCHAR(1500) NOT NULL');
    await queryRunner.query('ALTER TABLE staff_members MODIFY image_url VARCHAR(1500) NULL');
  }
}

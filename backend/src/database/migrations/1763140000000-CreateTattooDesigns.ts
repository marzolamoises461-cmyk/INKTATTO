import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTattooDesigns1763140000000 implements MigrationInterface {
  name = 'CreateTattooDesigns1763140000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TABLE IF NOT EXISTS tattoo_designs (id INT NOT NULL AUTO_INCREMENT, name VARCHAR(120) NOT NULL, category VARCHAR(80) NOT NULL, style VARCHAR(80) NOT NULL, price DECIMAL(10,2) NOT NULL, image_url VARCHAR(1500) NOT NULL, description VARCHAR(1200) NOT NULL, review VARCHAR(1200) NOT NULL DEFAULT '', is_active TINYINT NOT NULL DEFAULT 1, created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (id)) ENGINE=InnoDB");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS tattoo_designs');
  }
}

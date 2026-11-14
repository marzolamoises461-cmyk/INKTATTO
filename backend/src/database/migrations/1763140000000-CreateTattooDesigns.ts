import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTattooDesigns1763140000000 implements MigrationInterface {
  name = 'CreateTattooDesigns1763140000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE `tattoo_designs` (
      `id` int NOT NULL AUTO_INCREMENT,
      `name` varchar(120) NOT NULL,
      `category` varchar(80) NOT NULL,
      `style` varchar(80) NOT NULL,
      `price` decimal(10,2) NOT NULL,
      `image_url` varchar(1500) NOT NULL,
      `description` varchar(1200) NOT NULL,
      `review` varchar(1200) NOT NULL DEFAULT '',
      `is_active` tinyint NOT NULL DEFAULT 1,
      `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `tattoo_designs`');
  }
}

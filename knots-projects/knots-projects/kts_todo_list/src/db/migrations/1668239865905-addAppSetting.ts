import {MigrationInterface, QueryRunner} from "typeorm";

export class addAppSetting1668239865905 implements MigrationInterface {
    name = 'addAppSetting1668239865905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`app_setting\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`key\` varchar(255) NOT NULL, \`public\` tinyint NOT NULL DEFAULT 0, \`description\` varchar(255) NOT NULL, \`value\` text NULL, INDEX \`IDX_64e2c5eaaaec149e68f4d27904\` (\`created_at\`), INDEX \`IDX_2c7176a92e50c4d37bcbdbd5ec\` (\`updated_at\`), UNIQUE INDEX \`IDX_0d66bfb0d9f93124a4549d21af\` (\`key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_0d66bfb0d9f93124a4549d21af\` ON \`app_setting\``);
        await queryRunner.query(`DROP INDEX \`IDX_2c7176a92e50c4d37bcbdbd5ec\` ON \`app_setting\``);
        await queryRunner.query(`DROP INDEX \`IDX_64e2c5eaaaec149e68f4d27904\` ON \`app_setting\``);
        await queryRunner.query(`DROP TABLE \`app_setting\``);
    }

}

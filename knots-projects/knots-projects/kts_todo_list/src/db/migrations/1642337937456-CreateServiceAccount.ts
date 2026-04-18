import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateServiceAccount1642337937456 implements MigrationInterface {
    name = 'CreateServiceAccount1642337937456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`service_account\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`token\` varchar(255) NOT NULL, \`disabled\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_545e97ddde73d7c71a3ec86b55\` (\`created_at\`), INDEX \`IDX_0d67504ba4cee185ac7cc51293\` (\`updated_at\`), INDEX \`IDX_1c270dede67ac9b2534a084652\` (\`name\`), INDEX \`IDX_d251381f926ee2f4314ba09bef\` (\`disabled\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`service_account\``);
    }

}

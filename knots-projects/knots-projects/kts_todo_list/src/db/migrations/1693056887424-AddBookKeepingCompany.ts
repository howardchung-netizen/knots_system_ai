import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBookKeepingCompany1693056887424 implements MigrationInterface {
    name = 'AddBookKeepingCompany1693056887424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`book_keeping_company\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`company_name\` varchar(255) NOT NULL, \`business_registration_no\` varchar(255) NULL, \`address\` varchar(255) NULL, \`phone\` varchar(255) NULL, \`deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_9271254b3288569781a3d5a959\` (\`created_at\`), INDEX \`IDX_56fda29c66d050a34e658ea727\` (\`updated_at\`), INDEX \`IDX_bd8eef0bf1aca76da047111eca\` (\`company_name\`), INDEX \`IDX_869492ba5dcf5b89365f3ed3eb\` (\`business_registration_no\`), INDEX \`IDX_dcc6abc3de4f8b8b4f781e4728\` (\`phone\`), INDEX \`IDX_065e4b6ecd2b813aa3ad5d00b7\` (\`deleted\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_065e4b6ecd2b813aa3ad5d00b7\` ON \`book_keeping_company\``);
        await queryRunner.query(`DROP INDEX \`IDX_dcc6abc3de4f8b8b4f781e4728\` ON \`book_keeping_company\``);
        await queryRunner.query(`DROP INDEX \`IDX_869492ba5dcf5b89365f3ed3eb\` ON \`book_keeping_company\``);
        await queryRunner.query(`DROP INDEX \`IDX_bd8eef0bf1aca76da047111eca\` ON \`book_keeping_company\``);
        await queryRunner.query(`DROP INDEX \`IDX_56fda29c66d050a34e658ea727\` ON \`book_keeping_company\``);
        await queryRunner.query(`DROP INDEX \`IDX_9271254b3288569781a3d5a959\` ON \`book_keeping_company\``);
        await queryRunner.query(`DROP TABLE \`book_keeping_company\``);
    }

}

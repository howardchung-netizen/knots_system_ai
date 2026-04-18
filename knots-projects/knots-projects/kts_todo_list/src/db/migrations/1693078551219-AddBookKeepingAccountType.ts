import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBookKeepingAccountType1693078551219 implements MigrationInterface {
    name = 'AddBookKeepingAccountType1693078551219'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`book_keeping_account_type\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`order\` int NOT NULL DEFAULT '0', \`deleted\` tinyint NOT NULL DEFAULT 0, \`increase_debit\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_19d0def5033a15e6f283b1e6b6\` (\`created_at\`), INDEX \`IDX_93c448b749f94923ed108615e2\` (\`updated_at\`), INDEX \`IDX_0523afb341790d1581d48d3ef9\` (\`name\`), INDEX \`IDX_ac69347ab8b98f6b0c37d468bf\` (\`order\`), INDEX \`IDX_727552fc149dd5fcf0fc2572a3\` (\`increase_debit\`), INDEX \`IDX_834e3bb85f5dfff2a8df61eed0\` (\`deleted\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_834e3bb85f5dfff2a8df61eed0\` ON \`book_keeping_account_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_727552fc149dd5fcf0fc2572a3\` ON \`book_keeping_account_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_ac69347ab8b98f6b0c37d468bf\` ON \`book_keeping_account_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_0523afb341790d1581d48d3ef9\` ON \`book_keeping_account_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_93c448b749f94923ed108615e2\` ON \`book_keeping_account_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_19d0def5033a15e6f283b1e6b6\` ON \`book_keeping_account_type\``);
        await queryRunner.query(`DROP TABLE \`book_keeping_account_type\``);
    }

}

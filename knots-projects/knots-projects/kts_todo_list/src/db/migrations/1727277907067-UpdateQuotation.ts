import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateQuotation1727277907067 implements MigrationInterface {
    name = 'UpdateQuotation1727277907067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`quotation_info\` ADD \`year\` int NULL AFTER \`code\``);
        await queryRunner.query(`ALTER TABLE \`quotation_info\` ADD \`client_prefix\` varchar(5) NULL AFTER \`client_id\``);
        await queryRunner.query(`CREATE INDEX \`IDX_ccadfef6379e04f69460d537d4\` ON \`quotation_info\` (\`year\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_896d2e4099e2acca6e9a27c94f\` ON \`quotation_info\` (\`client_prefix\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_896d2e4099e2acca6e9a27c94f\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_ccadfef6379e04f69460d537d4\` ON \`quotation_info\``);
        await queryRunner.query(`ALTER TABLE \`quotation_info\` DROP COLUMN \`client_prefix\``);
        await queryRunner.query(`ALTER TABLE \`quotation_info\` DROP COLUMN \`year\``);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateQuotationMonth1727317241626 implements MigrationInterface {
    name = 'UpdateQuotationMonth1727317241626'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`quotation_info\` ADD \`month\` int NULL AFTER \`year\``);
        await queryRunner.query(`ALTER TABLE \`quotation_info\` ADD \`sequence_number\` int NULL AFTER \`month\``);
        await queryRunner.query(`CREATE INDEX \`IDX_d8adb05890bcd338dfcd22506a\` ON \`quotation_info\` (\`month\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_f587ad6f29b63ffcc4bc155e08\` ON \`quotation_info\` (\`sequence_number\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_a7099cae5d35e1503159d8be71\` ON \`quotation_info\` (\`year\`, \`month\`, \`sequence_number\`, \`client_prefix\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_a7099cae5d35e1503159d8be71\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_f587ad6f29b63ffcc4bc155e08\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_d8adb05890bcd338dfcd22506a\` ON \`quotation_info\``);
        await queryRunner.query(`ALTER TABLE \`quotation_info\` DROP COLUMN \`sequence_number\``);
        await queryRunner.query(`ALTER TABLE \`quotation_info\` DROP COLUMN \`month\``);
    }

}

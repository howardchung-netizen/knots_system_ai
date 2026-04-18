import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateInvoiceEntity1699432945983 implements MigrationInterface {
    name = 'UpdateInvoiceEntity1699432945983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`financial_year_start\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`financial_year_end\` int NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`financial_year_end\``);
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`financial_year_start\``);
    }

}

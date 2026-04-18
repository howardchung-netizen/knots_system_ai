import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatePdfSourcePages1683810063496 implements MigrationInterface {
    name = 'UpdatePdfSourcePages1683810063496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pdf_source_history\` ADD \`pages\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`pdf_source\` ADD \`pages\` int NOT NULL DEFAULT '0' AFTER \`compare_path\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pdf_source\` DROP COLUMN \`pages\``);
        await queryRunner.query(`ALTER TABLE \`pdf_source_history\` DROP COLUMN \`pages\``);
    }

}

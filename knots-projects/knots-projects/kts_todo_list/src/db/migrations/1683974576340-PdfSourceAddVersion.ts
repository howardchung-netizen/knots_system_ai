import {MigrationInterface, QueryRunner} from "typeorm";

export class PdfSourceAddVersion1683974576340 implements MigrationInterface {
    name = 'PdfSourceAddVersion1683974576340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pdf_source_history\` ADD \`version\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`pdf_source\` ADD \`version\` int NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pdf_source\` DROP COLUMN \`version\``);
        await queryRunner.query(`ALTER TABLE \`pdf_source_history\` DROP COLUMN \`version\``);
    }

}

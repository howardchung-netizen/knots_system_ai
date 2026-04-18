import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatePdfSourcePage1682917143261 implements MigrationInterface {
    name = 'UpdatePdfSourcePage1682917143261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pdf_source_page_version\` ADD \`image_path\` varchar(255) NULL AFTER \`file_path\``);
        await queryRunner.query(`ALTER TABLE \`pdf_source\` ADD \`compare_path\` varchar(255) NULL AFTER \`file_path\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pdf_source\` DROP COLUMN \`compare_path\``);
        await queryRunner.query(`ALTER TABLE \`pdf_source_page_version\` DROP COLUMN \`image_path\``);
    }

}

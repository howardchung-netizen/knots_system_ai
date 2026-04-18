import {MigrationInterface, QueryRunner} from "typeorm";

export class AddPdfHistory1681748164777 implements MigrationInterface {
    name = 'AddPdfHistory1681748164777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`pdf_source_history\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`pdf_source_id\` varchar(255) NOT NULL, \`file_path\` varchar(255) NOT NULL, \`compare_path\` varchar(255) NULL, INDEX \`IDX_0906d0e390285f1c10e2fbc812\` (\`created_at\`), INDEX \`IDX_885406279aa536cdfe6992ec55\` (\`updated_at\`), INDEX \`IDX_27a06645161f4e74ed078c1ea0\` (\`pdf_source_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pdf_source_page_history\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`pdf_source_page_id\` varchar(255) NOT NULL, \`file_path\` varchar(255) NOT NULL, \`compare_path\` varchar(255) NULL, \`last_version\` int NOT NULL DEFAULT '1', INDEX \`IDX_5a5cf2dab83ecc99cdaa1a1263\` (\`created_at\`), INDEX \`IDX_e5eda0ec4ddaf8ce4f76654e23\` (\`updated_at\`), INDEX \`IDX_8ce5cb44f0bdc539d8cf6f0f65\` (\`pdf_source_page_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`pdf_source_history\` ADD CONSTRAINT \`FK_27a06645161f4e74ed078c1ea01\` FOREIGN KEY (\`pdf_source_id\`) REFERENCES \`pdf_source\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`pdf_source_page_history\` ADD CONSTRAINT \`FK_8ce5cb44f0bdc539d8cf6f0f650\` FOREIGN KEY (\`pdf_source_page_id\`) REFERENCES \`pdf_source_page\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pdf_source_page_history\` DROP FOREIGN KEY \`FK_8ce5cb44f0bdc539d8cf6f0f650\``);
        await queryRunner.query(`ALTER TABLE \`pdf_source_history\` DROP FOREIGN KEY \`FK_27a06645161f4e74ed078c1ea01\``);
        await queryRunner.query(`DROP INDEX \`IDX_8ce5cb44f0bdc539d8cf6f0f65\` ON \`pdf_source_page_history\``);
        await queryRunner.query(`DROP INDEX \`IDX_e5eda0ec4ddaf8ce4f76654e23\` ON \`pdf_source_page_history\``);
        await queryRunner.query(`DROP INDEX \`IDX_5a5cf2dab83ecc99cdaa1a1263\` ON \`pdf_source_page_history\``);
        await queryRunner.query(`DROP TABLE \`pdf_source_page_history\``);
        await queryRunner.query(`DROP INDEX \`IDX_27a06645161f4e74ed078c1ea0\` ON \`pdf_source_history\``);
        await queryRunner.query(`DROP INDEX \`IDX_885406279aa536cdfe6992ec55\` ON \`pdf_source_history\``);
        await queryRunner.query(`DROP INDEX \`IDX_0906d0e390285f1c10e2fbc812\` ON \`pdf_source_history\``);
        await queryRunner.query(`DROP TABLE \`pdf_source_history\``);
    }

}

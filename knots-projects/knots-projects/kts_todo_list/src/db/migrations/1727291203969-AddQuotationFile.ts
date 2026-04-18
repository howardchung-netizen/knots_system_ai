import {MigrationInterface, QueryRunner} from "typeorm";

export class AddQuotationFile1727291203969 implements MigrationInterface {
    name = 'AddQuotationFile1727291203969'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`quotation_file\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`file_path\` varchar(255) NULL, \`file_mime_type\` varchar(255) NULL, \`quotation_id\` int NOT NULL, \`deleted\` tinyint NOT NULL, INDEX \`IDX_25721f08c06639d813c079e16b\` (\`created_at\`), INDEX \`IDX_36b230b6ee2c97979527232692\` (\`updated_at\`), INDEX \`IDX_3c79a17f43f1e730ebd55b549b\` (\`quotation_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`quotation_file\` ADD CONSTRAINT \`FK_3c79a17f43f1e730ebd55b549b3\` FOREIGN KEY (\`quotation_id\`) REFERENCES \`quotation_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`quotation_file\` DROP FOREIGN KEY \`FK_3c79a17f43f1e730ebd55b549b3\``);
        await queryRunner.query(`DROP INDEX \`IDX_3c79a17f43f1e730ebd55b549b\` ON \`quotation_file\``);
        await queryRunner.query(`DROP INDEX \`IDX_36b230b6ee2c97979527232692\` ON \`quotation_file\``);
        await queryRunner.query(`DROP INDEX \`IDX_25721f08c06639d813c079e16b\` ON \`quotation_file\``);
        await queryRunner.query(`DROP TABLE \`quotation_file\``);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class addClockInContactFile1676298146564 implements MigrationInterface {
    name = 'addClockInContactFile1676298146564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`clock_in_contact_file\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`clock_in_contac_file_path\` varchar(255) NULL, \`file_mime_type\` varchar(255) NULL, \`tel\` varchar(255) NOT NULL, \`deleted\` tinyint NOT NULL, INDEX \`IDX_e1e180622449c3beb526d8eb9d\` (\`created_at\`), INDEX \`IDX_b398a766cfb07e5a838fa541e9\` (\`updated_at\`), INDEX \`IDX_0109b13173bd31d892ee0e60b7\` (\`tel\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`clock_in_contact_file\` ADD CONSTRAINT \`FK_0109b13173bd31d892ee0e60b70\` FOREIGN KEY (\`tel\`) REFERENCES \`clock_in_contact\`(\`tel\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`clock_in_contact_file\` DROP FOREIGN KEY \`FK_0109b13173bd31d892ee0e60b70\``);
        await queryRunner.query(`DROP INDEX \`IDX_0109b13173bd31d892ee0e60b7\` ON \`clock_in_contact_file\``);
        await queryRunner.query(`DROP INDEX \`IDX_b398a766cfb07e5a838fa541e9\` ON \`clock_in_contact_file\``);
        await queryRunner.query(`DROP INDEX \`IDX_e1e180622449c3beb526d8eb9d\` ON \`clock_in_contact_file\``);
        await queryRunner.query(`DROP TABLE \`clock_in_contact_file\``);
    }

}

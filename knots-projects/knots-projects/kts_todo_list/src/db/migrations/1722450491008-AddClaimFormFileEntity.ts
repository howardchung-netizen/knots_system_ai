import {MigrationInterface, QueryRunner} from "typeorm";

export class AddClaimFormFileEntity1722450491008 implements MigrationInterface {
    name = 'AddClaimFormFileEntity1722450491008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`claim_form_file\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`file_path\` varchar(255) NULL, \`file_mime_type\` varchar(255) NULL, \`claim_form_id\` varchar(255) NOT NULL, \`deleted\` tinyint NOT NULL, \`claimFormId\` varchar(36) NULL, INDEX \`IDX_1434be3e07e8d6d3d60af35bdc\` (\`created_at\`), INDEX \`IDX_eb86364c28731525a62268c131\` (\`updated_at\`), INDEX \`IDX_313d3fc3e4976bbda55d4d0d00\` (\`claim_form_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`claim_form_file\` ADD CONSTRAINT \`FK_dec21d8e5fe7532a5cdec187d04\` FOREIGN KEY (\`claimFormId\`) REFERENCES \`claim_form\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`claim_form_file\` DROP FOREIGN KEY \`FK_dec21d8e5fe7532a5cdec187d04\``);
        await queryRunner.query(`DROP INDEX \`IDX_313d3fc3e4976bbda55d4d0d00\` ON \`claim_form_file\``);
        await queryRunner.query(`DROP INDEX \`IDX_eb86364c28731525a62268c131\` ON \`claim_form_file\``);
        await queryRunner.query(`DROP INDEX \`IDX_1434be3e07e8d6d3d60af35bdc\` ON \`claim_form_file\``);
        await queryRunner.query(`DROP TABLE \`claim_form_file\``);
    }

}

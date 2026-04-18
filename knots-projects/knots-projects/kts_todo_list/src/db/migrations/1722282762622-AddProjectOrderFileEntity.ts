import {MigrationInterface, QueryRunner} from "typeorm";

export class AddProjectOrderFileEntity1722282762622 implements MigrationInterface {
    name = 'AddProjectOrderFileEntity1722282762622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`project_order_file\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`file_path\` varchar(255) NULL, \`file_mime_type\` varchar(255) NULL, \`project_order_id\` varchar(255) NOT NULL, \`deleted\` tinyint NOT NULL, \`projectOrderId\` int NULL, INDEX \`IDX_00d00ff1981374c3f539354571\` (\`created_at\`), INDEX \`IDX_68ed0cbd6055d97fb9ee6fa79f\` (\`updated_at\`), INDEX \`IDX_e20c6be5760402e42adfcabf3b\` (\`project_order_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`project_order_file\` ADD CONSTRAINT \`FK_507273e1eaaf045558b70eb72bd\` FOREIGN KEY (\`projectOrderId\`) REFERENCES \`order_form\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`project_order_file\` DROP FOREIGN KEY \`FK_507273e1eaaf045558b70eb72bd\``);
        await queryRunner.query(`DROP INDEX \`IDX_e20c6be5760402e42adfcabf3b\` ON \`project_order_file\``);
        await queryRunner.query(`DROP INDEX \`IDX_68ed0cbd6055d97fb9ee6fa79f\` ON \`project_order_file\``);
        await queryRunner.query(`DROP INDEX \`IDX_00d00ff1981374c3f539354571\` ON \`project_order_file\``);
        await queryRunner.query(`DROP TABLE \`project_order_file\``);
    }

}

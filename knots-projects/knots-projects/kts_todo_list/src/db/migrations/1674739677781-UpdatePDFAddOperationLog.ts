import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatePDFAddOperationLog1674739677781 implements MigrationInterface {
    name = 'UpdatePDFAddOperationLog1674739677781'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`pdf\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`project_id\` int NOT NULL, \`type_id\` varchar(255) NOT NULL, \`version\` int NOT NULL DEFAULT '0', \`share_code\` varchar(255) NULL, \`share_end_time\` datetime NULL, \`remarks\` varchar(255) NULL, \`deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_f9fc682f6359d66ff719dad37e\` (\`created_at\`), INDEX \`IDX_e0a3417ae4e408ba2072ae632b\` (\`updated_at\`), INDEX \`IDX_ec1b50e532b9b1d3e759b26541\` (\`project_id\`), INDEX \`IDX_240435f14c933adff6784ea847\` (\`share_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`operation_log\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NOT NULL, \`object_type\` enum ('ClockIn', 'Contact', 'Gantt', 'Pdf', 'Project', 'Task') NOT NULL, \`object_id\` varchar(255) NOT NULL, \`action\` enum ('CREATE', 'UPDATE', 'DELETE') NOT NULL, \`changes\` json NULL, INDEX \`IDX_1012ce7a568947196069207190\` (\`created_at\`), INDEX \`IDX_62d83c4b9f56b65e8a21d27616\` (\`updated_at\`), INDEX \`IDX_7f0784cc576e4eaad04fa7e8e4\` (\`user_id\`), INDEX \`IDX_d5e1f502bc54236883f6c4f85a\` (\`object_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`pdf\` ADD CONSTRAINT \`FK_ec1b50e532b9b1d3e759b265418\` FOREIGN KEY (\`project_id\`) REFERENCES \`project_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`operation_log\` ADD CONSTRAINT \`FK_7f0784cc576e4eaad04fa7e8e45\` FOREIGN KEY (\`user_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`operation_log\` DROP FOREIGN KEY \`FK_7f0784cc576e4eaad04fa7e8e45\``);
        await queryRunner.query(`ALTER TABLE \`pdf\` DROP FOREIGN KEY \`FK_ec1b50e532b9b1d3e759b265418\``);
        await queryRunner.query(`DROP INDEX \`IDX_d5e1f502bc54236883f6c4f85a\` ON \`operation_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_7f0784cc576e4eaad04fa7e8e4\` ON \`operation_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_62d83c4b9f56b65e8a21d27616\` ON \`operation_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_1012ce7a568947196069207190\` ON \`operation_log\``);
        await queryRunner.query(`DROP TABLE \`operation_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_240435f14c933adff6784ea847\` ON \`pdf\``);
        await queryRunner.query(`DROP INDEX \`IDX_ec1b50e532b9b1d3e759b26541\` ON \`pdf\``);
        await queryRunner.query(`DROP INDEX \`IDX_e0a3417ae4e408ba2072ae632b\` ON \`pdf\``);
        await queryRunner.query(`DROP INDEX \`IDX_f9fc682f6359d66ff719dad37e\` ON \`pdf\``);
        await queryRunner.query(`DROP TABLE \`pdf\``);
    }

}

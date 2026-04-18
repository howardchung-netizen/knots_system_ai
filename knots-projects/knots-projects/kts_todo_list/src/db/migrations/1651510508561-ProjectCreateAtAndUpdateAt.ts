import {MigrationInterface, QueryRunner} from "typeorm";

export class ProjectCreateAtAndUpdateAt1651510508561 implements MigrationInterface {
    name = 'ProjectCreateAtAndUpdateAt1651510508561'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`project_info\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) AFTER \`id\``);
        await queryRunner.query(`UPDATE \`project_info\` SET \`created_at\` = FROM_UNIXTIME(\`createAt\`/1000)`);
        await queryRunner.query(`ALTER TABLE \`project_info\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER \`created_at\``);
        await queryRunner.query(`UPDATE \`project_info\` SET \`updated_at\` = FROM_UNIXTIME(\`editAt\`/1000)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`project_info\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`project_info\` DROP COLUMN \`created_at\``);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTaskStatusEnum1709137841992 implements MigrationInterface {
    name = 'AddTaskStatusEnum1709137841992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` CHANGE \`status\` \`status\` enum ('TODO', 'DONE', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'TODO'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` CHANGE \`status\` \`status\` enum ('TODO', 'DONE', 'APPROVED') NOT NULL DEFAULT 'TODO'`);
    }

}

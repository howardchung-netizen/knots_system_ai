import {MigrationInterface, QueryRunner} from "typeorm";

export class AddGanttTasksNameEng1657210419133 implements MigrationInterface {
    name = 'AddGanttTasksNameEng1657210419133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gantt_tasks\` ADD \`name_eng\` varchar(255) NULL AFTER \`name\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gantt_tasks\` DROP COLUMN \`name_eng\``);
    }

}

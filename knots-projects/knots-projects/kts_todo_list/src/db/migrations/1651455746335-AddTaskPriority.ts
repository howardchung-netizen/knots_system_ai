import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTaskPriority1651455746335 implements MigrationInterface {
    name = 'AddTaskPriority1651455746335'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` ADD \`priority\` enum ('HIGH', 'MEDIUM', 'LOW') NULL AFTER \`description\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` DROP COLUMN \`priority\``);
    }

}

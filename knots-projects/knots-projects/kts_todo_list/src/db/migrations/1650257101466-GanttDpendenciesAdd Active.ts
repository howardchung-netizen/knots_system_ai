import {MigrationInterface, QueryRunner} from "typeorm";

export class GanttDpendenciesAddActive1650257101466 implements MigrationInterface {
    name = 'GanttDpendenciesAddActive1650257101466'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gantt_dependencies\` ADD \`active\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gantt_dependencies\` DROP COLUMN \`active\``);
    }

}

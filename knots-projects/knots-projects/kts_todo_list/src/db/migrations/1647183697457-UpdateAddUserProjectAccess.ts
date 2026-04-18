import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateAddUserProjectAccess1647183697457 implements MigrationInterface {
    name = 'UpdateAddUserProjectAccess1647183697457'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`is_all_project\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`is_all_project\``);
    }

}

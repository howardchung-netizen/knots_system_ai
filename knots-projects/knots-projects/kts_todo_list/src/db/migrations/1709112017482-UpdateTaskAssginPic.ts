import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateTaskAssginPic1709112017482 implements MigrationInterface {
    name = 'UpdateTaskAssginPic1709112017482'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task_assigned_staff\` ADD \`is_pic\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`task_assigned_contact\` ADD \`is_pic\` tinyint NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_2ee0e6c00d6196d2da9589f29f\` ON \`task_assigned_contact\``);
        await queryRunner.query(`DROP INDEX \`IDX_6ce88c85c7ac1f97d2ebbe7608\` ON \`task_assigned_staff\``);
        await queryRunner.query(`ALTER TABLE \`task_assigned_contact\` DROP COLUMN \`is_pic\``);
        await queryRunner.query(`ALTER TABLE \`task_assigned_staff\` DROP COLUMN \`is_pic\``);
    }

}

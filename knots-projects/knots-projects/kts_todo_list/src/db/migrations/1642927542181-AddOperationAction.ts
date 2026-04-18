import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOperationAction1642927542181 implements MigrationInterface {
    name = 'AddOperationAction1642927542181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task_log\` ADD \`action\` enum ('CREATE', 'UPDATE', 'DELETE') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task_log\` DROP COLUMN \`action\``);
    }

}

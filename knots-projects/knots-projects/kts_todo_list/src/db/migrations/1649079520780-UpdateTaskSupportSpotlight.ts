import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateTaskSupportSpotlight1649079520780 implements MigrationInterface {
    name = 'UpdateTaskSupportSpotlight1649079520780'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` ADD \`spotlight\` varchar(255) NULL AFTER \`description\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` DROP COLUMN \`spotlight\``);
    }

}

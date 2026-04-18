import {MigrationInterface, QueryRunner} from "typeorm";

export class addClockInRemark1669465503360 implements MigrationInterface {
    name = 'addClockInRemark1669465503360'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`clock_in\` ADD \`clock_in_remark\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`clock_in\` DROP COLUMN \`clock_in_remark\``);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateClockinRemarkNullable1669537235384 implements MigrationInterface {
    name = 'UpdateClockinRemarkNullable1669537235384'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`clock_in\` CHANGE \`clock_in_remark\` \`clock_in_remark\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`clock_in\` CHANGE \`clock_in_remark\` \`clock_in_remark\` varchar(255) NOT NULL`);
    }

}

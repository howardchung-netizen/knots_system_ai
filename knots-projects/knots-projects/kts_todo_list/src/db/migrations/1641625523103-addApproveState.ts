import {MigrationInterface, QueryRunner} from "typeorm";

export class addApproveState1641625523103 implements MigrationInterface {
    name = 'addApproveState1641625523103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` CHANGE \`status\` \`status\` enum ('TODO', 'DONE', 'APPROVED') NOT NULL DEFAULT 'TODO'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` CHANGE \`status\` \`status\` enum ('TODO', 'DONE') NOT NULL DEFAULT 'TODO'`);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class taskSupportTender1660661329306 implements MigrationInterface {
    name = 'taskSupportTender1660661329306'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` ADD \`is_tender\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` DROP COLUMN \`is_tender\``);
    }

}

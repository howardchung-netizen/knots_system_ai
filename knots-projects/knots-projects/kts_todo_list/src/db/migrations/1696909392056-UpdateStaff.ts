import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateStaff1696909392056 implements MigrationInterface {
    name = 'UpdateStaff1696909392056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`last_cheque_no_for_petty_cash\` varchar(255) NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_22ffdc57a2b2fc91039919c347\` ON \`staff\` (\`last_cheque_no_for_petty_cash\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_22ffdc57a2b2fc91039919c347\` ON \`staff\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`last_cheque_no_for_petty_cash\``);
    }

}

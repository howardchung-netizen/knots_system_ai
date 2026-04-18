import {MigrationInterface, QueryRunner} from "typeorm";

export class ClockInLocationAddNonce1669740517319 implements MigrationInterface {
    name = 'ClockInLocationAddNonce1669740517319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`clock_in_location\` ADD \`nonce\` varchar(10) NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_5b9f7abe57ecc319cd06efd146\` ON \`clock_in_location\` (\`nonce\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_5b9f7abe57ecc319cd06efd146\` ON \`clock_in_location\``);
        await queryRunner.query(`ALTER TABLE \`clock_in_location\` DROP COLUMN \`nonce\``);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateBookKeeping1699283543845 implements MigrationInterface {
    name = 'UpdateBookKeeping1699283543845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book_keeping_account\` ADD \`is_bank\` tinyint NOT NULL DEFAULT 0 AFTER \`is_claim\``);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`petty_cash_account_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD UNIQUE INDEX \`IDX_af7e52e60f6a8886e0c7753cbb\` (\`petty_cash_account_id\`)`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD CONSTRAINT \`FK_af7e52e60f6a8886e0c7753cbb0\` FOREIGN KEY (\`petty_cash_account_id\`) REFERENCES \`book_keeping_account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff\` DROP FOREIGN KEY \`FK_af7e52e60f6a8886e0c7753cbb0\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP INDEX \`IDX_af7e52e60f6a8886e0c7753cbb\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`petty_cash_account_id\``);
        await queryRunner.query(`ALTER TABLE \`book_keeping_account\` DROP COLUMN \`is_bank\``);
    }

}

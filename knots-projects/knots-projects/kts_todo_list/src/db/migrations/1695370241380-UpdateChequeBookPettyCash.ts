import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateChequeBookPettyCash1695370241380 implements MigrationInterface {
    name = 'UpdateChequeBookPettyCash1695370241380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`pettyCash\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` ADD \`for_petty_cash\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` ADD \`for_petty_cash_staff_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` ADD \`category_account_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` ADD \`charge_account_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` ADD \`company_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` ADD \`transaction_id\` varchar(36) NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_7fc329137189088876fee1a432\` ON \`cheque_book\` (\`for_petty_cash\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2b8d004159c3d3696e7ed223f6\` ON \`cheque_book\` (\`for_petty_cash_staff_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2c4fd834b952585c558cb4cbe2\` ON \`cheque_book\` (\`category_account_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_4c6c68f10177bc00816ddea3a3\` ON \`cheque_book\` (\`charge_account_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2cc7e05719fcf3a301e39dc714\` ON \`cheque_book\` (\`company_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_65ef7f4eb616b0b3ed03b23320\` ON \`cheque_book\` (\`transaction_id\`)`);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` ADD CONSTRAINT \`FK_2b8d004159c3d3696e7ed223f6f\` FOREIGN KEY (\`for_petty_cash_staff_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` ADD CONSTRAINT \`FK_2c4fd834b952585c558cb4cbe29\` FOREIGN KEY (\`category_account_id\`) REFERENCES \`book_keeping_account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` ADD CONSTRAINT \`FK_4c6c68f10177bc00816ddea3a3c\` FOREIGN KEY (\`charge_account_id\`) REFERENCES \`book_keeping_account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` ADD CONSTRAINT \`FK_2cc7e05719fcf3a301e39dc7147\` FOREIGN KEY (\`company_id\`) REFERENCES \`book_keeping_company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` ADD CONSTRAINT \`FK_65ef7f4eb616b0b3ed03b23320f\` FOREIGN KEY (\`transaction_id\`) REFERENCES \`book_keeping_transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cheque_book\` DROP FOREIGN KEY \`FK_65ef7f4eb616b0b3ed03b23320f\``);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` DROP FOREIGN KEY \`FK_2cc7e05719fcf3a301e39dc7147\``);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` DROP FOREIGN KEY \`FK_4c6c68f10177bc00816ddea3a3c\``);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` DROP FOREIGN KEY \`FK_2c4fd834b952585c558cb4cbe29\``);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` DROP FOREIGN KEY \`FK_2b8d004159c3d3696e7ed223f6f\``);
        await queryRunner.query(`DROP INDEX \`IDX_65ef7f4eb616b0b3ed03b23320\` ON \`cheque_book\``);
        await queryRunner.query(`DROP INDEX \`IDX_2cc7e05719fcf3a301e39dc714\` ON \`cheque_book\``);
        await queryRunner.query(`DROP INDEX \`IDX_4c6c68f10177bc00816ddea3a3\` ON \`cheque_book\``);
        await queryRunner.query(`DROP INDEX \`IDX_2c4fd834b952585c558cb4cbe2\` ON \`cheque_book\``);
        await queryRunner.query(`DROP INDEX \`IDX_2b8d004159c3d3696e7ed223f6\` ON \`cheque_book\``);
        await queryRunner.query(`DROP INDEX \`IDX_7fc329137189088876fee1a432\` ON \`cheque_book\``);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` DROP COLUMN \`transaction_id\``);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` DROP COLUMN \`company_id\``);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` DROP COLUMN \`charge_account_id\``);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` DROP COLUMN \`category_account_id\``);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` DROP COLUMN \`for_petty_cash_staff_id\``);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` DROP COLUMN \`for_petty_cash\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`pettyCash\``);
    }

}

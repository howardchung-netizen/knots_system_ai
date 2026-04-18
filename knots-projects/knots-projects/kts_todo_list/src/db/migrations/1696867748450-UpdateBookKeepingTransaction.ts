import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateBookKeepingTransaction1696867748450 implements MigrationInterface {
    name = 'UpdateBookKeepingTransaction1696867748450'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction\` ADD \`financial_year_start\` int NOT NULL AFTER \`transaction_date\``);
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction\` ADD \`financial_year_end\` int NOT NULL AFTER \`financial_year_start\``);
        await queryRunner.query(`CREATE INDEX \`IDX_47eee2a913f97fe753c8756be1\` ON \`book_keeping_transaction\` (\`financial_year_start\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_3c16e83b0ab54a9ea9fc329c17\` ON \`book_keeping_transaction\` (\`financial_year_end\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_badbfa11e9e177a14e84dc322b\` ON \`book_keeping_transaction\` (\`financial_year_start\`, \`financial_year_end\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_badbfa11e9e177a14e84dc322b\` ON \`book_keeping_transaction\``);
        await queryRunner.query(`DROP INDEX \`IDX_3c16e83b0ab54a9ea9fc329c17\` ON \`book_keeping_transaction\``);
        await queryRunner.query(`DROP INDEX \`IDX_47eee2a913f97fe753c8756be1\` ON \`book_keeping_transaction\``);
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction\` DROP COLUMN \`financial_year_end\``);
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction\` DROP COLUMN \`financial_year_start\``);
    }

}

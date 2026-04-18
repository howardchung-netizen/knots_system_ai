import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateBookKeepingTransaction1699540424152 implements MigrationInterface {
    name = 'UpdateBookKeepingTransaction1699540424152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction\` ADD \`cheque_book_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction\` ADD \`invoice_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction\` ADD \`claim_form_id\` varchar(36) NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_b6af8e0405a43b669e5f4f8b6a\` ON \`book_keeping_transaction\` (\`cheque_book_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_85d2496a423cc334fab5157112\` ON \`book_keeping_transaction\` (\`invoice_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_398b5b229ff4bc656bed5e2d12\` ON \`book_keeping_transaction\` (\`claim_form_id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`DROP INDEX \`IDX_398b5b229ff4bc656bed5e2d12\` ON \`book_keeping_transaction\``);
        await queryRunner.query(`DROP INDEX \`IDX_85d2496a423cc334fab5157112\` ON \`book_keeping_transaction\``);
        await queryRunner.query(`DROP INDEX \`IDX_b6af8e0405a43b669e5f4f8b6a\` ON \`book_keeping_transaction\``);
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction\` DROP COLUMN \`claim_form_id\``);
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction\` DROP COLUMN \`invoice_id\``);
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction\` DROP COLUMN \`cheque_book_id\``);
    }

}

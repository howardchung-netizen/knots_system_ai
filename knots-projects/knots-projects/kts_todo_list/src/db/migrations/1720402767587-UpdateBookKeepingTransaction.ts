import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateBookKeepingTransaction1720402767587 implements MigrationInterface {
    name = 'UpdateBookKeepingTransaction1720402767587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction\` ADD \`order_id\` varchar(36) NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_217355aab9b75b3bb26d4a7bcb\` ON \`book_keeping_transaction\` (\`order_id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction\` DROP COLUMN \`order_id\``);
    }

}

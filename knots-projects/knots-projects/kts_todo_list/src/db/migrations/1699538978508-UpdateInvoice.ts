import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateInvoice1699538978508 implements MigrationInterface {
    name = 'UpdateInvoice1699538978508'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`term\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`category_account_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`bank_account_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`transaction_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`settlement\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`CREATE INDEX \`IDX_0d491ad5ff942ee8676e1d23e0\` ON \`invoice\` (\`financial_year_start\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_7f1fa7c430f769c36f2c3e0af4\` ON \`invoice\` (\`financial_year_end\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_c2dcbb1f285e8b596858aceb92\` ON \`invoice\` (\`client_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_1a3b90895664be8412176d5469\` ON \`invoice\` (\`main_contacts_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_3945279fc32135d898de99d0d9\` ON \`invoice\` (\`category_account_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_9e86f9ea07088c9eb8a4ca5ac3\` ON \`invoice\` (\`bank_account_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_a32ef5f07283d881032b4fa961\` ON \`invoice\` (\`transaction_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_1e2c3e6894c5c7ffd04983cd5a\` ON \`invoice\` (\`settlement\`)`);
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD CONSTRAINT \`FK_3945279fc32135d898de99d0d9e\` FOREIGN KEY (\`category_account_id\`) REFERENCES \`book_keeping_account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD CONSTRAINT \`FK_9e86f9ea07088c9eb8a4ca5ac39\` FOREIGN KEY (\`bank_account_id\`) REFERENCES \`book_keeping_account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD CONSTRAINT \`FK_a32ef5f07283d881032b4fa961e\` FOREIGN KEY (\`transaction_id\`) REFERENCES \`book_keeping_transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP FOREIGN KEY \`FK_a32ef5f07283d881032b4fa961e\``);
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP FOREIGN KEY \`FK_9e86f9ea07088c9eb8a4ca5ac39\``);
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP FOREIGN KEY \`FK_3945279fc32135d898de99d0d9e\``);
        await queryRunner.query(`DROP INDEX \`IDX_1e2c3e6894c5c7ffd04983cd5a\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_a32ef5f07283d881032b4fa961\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_9e86f9ea07088c9eb8a4ca5ac3\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_3945279fc32135d898de99d0d9\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_1a3b90895664be8412176d5469\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_c2dcbb1f285e8b596858aceb92\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_7f1fa7c430f769c36f2c3e0af4\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_0d491ad5ff942ee8676e1d23e0\` ON \`invoice\``);
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`settlement\``);
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`transaction_id\``);
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`bank_account_id\``);
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`category_account_id\``);
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`term\``);
    }

}

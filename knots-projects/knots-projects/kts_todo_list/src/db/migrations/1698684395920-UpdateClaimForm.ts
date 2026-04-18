import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateClaimForm1698684395920 implements MigrationInterface {
    name = 'UpdateClaimForm1698684395920'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`claim_form\` ADD \`transaction_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`claim_form\` CHANGE \`cheque_no\` \`cheque_no\` varchar(255) NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_26533266de147b45760b99ce8c\` ON \`claim_form\` (\`transaction_id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_26533266de147b45760b99ce8c\` ON \`claim_form\``);
        await queryRunner.query(`ALTER TABLE \`claim_form\` CHANGE \`cheque_no\` \`cheque_no\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`claim_form\` DROP COLUMN \`transaction_id\``);
    }

}

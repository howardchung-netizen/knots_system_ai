import {MigrationInterface, QueryRunner} from "typeorm";

export class AddClaimForm1695371716351 implements MigrationInterface {
    name = 'AddClaimForm1695371716351'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`claim_form\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`staff_id\` int NOT NULL, \`vendor\` varchar(255) NULL, \`purchased_date\` date NOT NULL, \`amount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`cheque_no\` varchar(255) NOT NULL, \`category_account_id\` varchar(36) NULL, \`bank_account_id\` varchar(36) NULL, \`file_path\` varchar(255) NULL, \`settlement\` tinyint NOT NULL DEFAULT 0, \`deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_b4708ed47f9c05742e00128491\` (\`created_at\`), INDEX \`IDX_da29e8408107bb280ffa664bde\` (\`updated_at\`), INDEX \`IDX_6d01a95c5d582d1fcb08dd496e\` (\`staff_id\`), INDEX \`IDX_979d11ff1c3a04834e1583e310\` (\`vendor\`), INDEX \`IDX_34b4db5fcd4d14cbc154521c62\` (\`purchased_date\`), INDEX \`IDX_e36815b0d95566ef3f5898fd5a\` (\`cheque_no\`), INDEX \`IDX_3bf4b97b6a37f4930eb0cd2af7\` (\`category_account_id\`), INDEX \`IDX_1f304a8e6a1cb50133cd69fddd\` (\`bank_account_id\`), INDEX \`IDX_a64edf9f303603d2dd60ce2f40\` (\`settlement\`), INDEX \`IDX_2e22c12ab8d9a01ecb81c0fbca\` (\`deleted\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`claim_form\` ADD CONSTRAINT \`FK_6d01a95c5d582d1fcb08dd496e3\` FOREIGN KEY (\`staff_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`claim_form\` ADD CONSTRAINT \`FK_3bf4b97b6a37f4930eb0cd2af7a\` FOREIGN KEY (\`category_account_id\`) REFERENCES \`book_keeping_account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`claim_form\` ADD CONSTRAINT \`FK_1f304a8e6a1cb50133cd69fdddb\` FOREIGN KEY (\`bank_account_id\`) REFERENCES \`book_keeping_account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`claim_form\` DROP FOREIGN KEY \`FK_1f304a8e6a1cb50133cd69fdddb\``);
        await queryRunner.query(`ALTER TABLE \`claim_form\` DROP FOREIGN KEY \`FK_3bf4b97b6a37f4930eb0cd2af7a\``);
        await queryRunner.query(`ALTER TABLE \`claim_form\` DROP FOREIGN KEY \`FK_6d01a95c5d582d1fcb08dd496e3\``);
        await queryRunner.query(`DROP INDEX \`IDX_2e22c12ab8d9a01ecb81c0fbca\` ON \`claim_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_a64edf9f303603d2dd60ce2f40\` ON \`claim_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_1f304a8e6a1cb50133cd69fddd\` ON \`claim_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_3bf4b97b6a37f4930eb0cd2af7\` ON \`claim_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_e36815b0d95566ef3f5898fd5a\` ON \`claim_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_34b4db5fcd4d14cbc154521c62\` ON \`claim_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_979d11ff1c3a04834e1583e310\` ON \`claim_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_6d01a95c5d582d1fcb08dd496e\` ON \`claim_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_da29e8408107bb280ffa664bde\` ON \`claim_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_b4708ed47f9c05742e00128491\` ON \`claim_form\``);
        await queryRunner.query(`DROP TABLE \`claim_form\``);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateProjectOrderEntity1722278278631 implements MigrationInterface {
    name = 'UpdateProjectOrderEntity1722278278631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_form\` ADD \`file_path\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_form\` ADD \`category_account_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_form\` ADD \`bank_account_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_form\` ADD \`settlement\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`order_form\` ADD \`transaction_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_form\` ADD \`claim_form_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_form\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`CREATE INDEX \`IDX_06b229fdb289a173e4c2dd47bf\` ON \`order_form\` (\`category_account_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_5c0cc726b38f3e964a088d3f42\` ON \`order_form\` (\`bank_account_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_308f697d7689a09ab19617ecd5\` ON \`order_form\` (\`settlement\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_3c9a57b42985e9c9f345731a36\` ON \`order_form\` (\`transaction_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_4175085d5b8547391414545b04\` ON \`order_form\` (\`claim_form_id\`)`);
        await queryRunner.query(`ALTER TABLE \`order_form\` ADD CONSTRAINT \`FK_06b229fdb289a173e4c2dd47bf0\` FOREIGN KEY (\`category_account_id\`) REFERENCES \`book_keeping_account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_form\` ADD CONSTRAINT \`FK_5c0cc726b38f3e964a088d3f42e\` FOREIGN KEY (\`bank_account_id\`) REFERENCES \`book_keeping_account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_form\` ADD CONSTRAINT \`FK_3c9a57b42985e9c9f345731a363\` FOREIGN KEY (\`transaction_id\`) REFERENCES \`book_keeping_transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_form\` DROP FOREIGN KEY \`FK_3c9a57b42985e9c9f345731a363\``);
        await queryRunner.query(`ALTER TABLE \`order_form\` DROP FOREIGN KEY \`FK_5c0cc726b38f3e964a088d3f42e\``);
        await queryRunner.query(`ALTER TABLE \`order_form\` DROP FOREIGN KEY \`FK_06b229fdb289a173e4c2dd47bf0\``);
        await queryRunner.query(`ALTER TABLE \`order_form\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`order_form\` DROP COLUMN \`claim_form_id\``);
        await queryRunner.query(`ALTER TABLE \`order_form\` DROP COLUMN \`transaction_id\``);
        await queryRunner.query(`ALTER TABLE \`order_form\` DROP COLUMN \`settlement\``);
        await queryRunner.query(`ALTER TABLE \`order_form\` DROP COLUMN \`bank_account_id\``);
        await queryRunner.query(`ALTER TABLE \`order_form\` DROP COLUMN \`category_account_id\``);
        await queryRunner.query(`ALTER TABLE \`order_form\` DROP COLUMN \`file_path\``);
    }

}

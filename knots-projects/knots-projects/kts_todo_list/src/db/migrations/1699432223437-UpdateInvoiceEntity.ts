import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateInvoiceEntity1699432223437 implements MigrationInterface {
    name = 'UpdateInvoiceEntity1699432223437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`client_id\` int NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`main_contacts_id\` int NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`main_contacts_id\``);
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`client_id\``);
    }

}

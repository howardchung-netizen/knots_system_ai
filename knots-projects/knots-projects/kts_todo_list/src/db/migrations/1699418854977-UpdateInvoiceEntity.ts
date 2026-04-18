import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateInvoiceEntity1699418854977 implements MigrationInterface {
    name = 'UpdateInvoiceEntity1699418854977'

    public async up(queryRunner: QueryRunner): Promise<void> {;
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`totalAmount\` float NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`discountRatio\` float NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`ratioDiscount\` float NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`discount\` float NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`invoice\` ADD \`grandTotal\` float NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`grandTotal\``);
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`discount\``);
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`ratioDiscount\``);
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`discountRatio\``);
        await queryRunner.query(`ALTER TABLE \`invoice\` DROP COLUMN \`totalAmount\``);
    }

}

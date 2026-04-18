import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateChequeBook1698921793697 implements MigrationInterface {
    name = 'UpdateChequeBook1698921793697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cheque_book\` ADD \`transactionDesc\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` CHANGE \`amount\` \`amount\` float NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD CONSTRAINT \`FK_22ffdc57a2b2fc91039919c347c\` FOREIGN KEY (\`last_cheque_no_for_petty_cash\`) REFERENCES \`cheque_book\`(\`cheque_no\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff\` DROP FOREIGN KEY \`FK_22ffdc57a2b2fc91039919c347c\``);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` CHANGE \`amount\` \`amount\` float NULL`);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` DROP COLUMN \`transactionDesc\``);
    }

}

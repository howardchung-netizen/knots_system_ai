import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBookKeepingPeriodExpense1695399047446 implements MigrationInterface {
    name = 'AddBookKeepingPeriodExpense1695399047446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`book_keeping_period_expense\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`company_id\` varchar(36) NOT NULL, \`from_date\` date NOT NULL, \`to_date\` date NOT NULL, \`period\` enum ('monthly', 'weekly', 'quarterly', 'yearly') NOT NULL, \`period_day\` int NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`category_account_id\` varchar(36) NOT NULL, \`person_in_charge_id\` int NULL, \`charge_account_id\` varchar(255) NOT NULL, \`desc\` varchar(255) NOT NULL, \`remark\` varchar(255) NULL, \`deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_34763f3d272df29e332dd3a83d\` (\`created_at\`), INDEX \`IDX_8d4337f083ec9a6df0de56d4ca\` (\`updated_at\`), INDEX \`IDX_2c6032cde45261e5d322c65ade\` (\`company_id\`), INDEX \`IDX_3abc34b049535bf2be5de648dc\` (\`from_date\`), INDEX \`IDX_96003184969a89981baa81a83b\` (\`to_date\`), INDEX \`IDX_7115f295d121052a9bc66d0c65\` (\`period\`), INDEX \`IDX_1f77ede5dae944a916743962e0\` (\`period_day\`), INDEX \`IDX_2d7b5bece6cb8fb034497ebb01\` (\`category_account_id\`), INDEX \`IDX_7c8c9bd9e75c6147a91c6b5d50\` (\`person_in_charge_id\`), INDEX \`IDX_b230343fddb71d1c8c8aae32b7\` (\`charge_account_id\`), INDEX \`IDX_72e3080ecc7281cf09f6feb762\` (\`deleted\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`book_keeping_period_expense\` ADD CONSTRAINT \`FK_2c6032cde45261e5d322c65ade7\` FOREIGN KEY (\`company_id\`) REFERENCES \`book_keeping_company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_keeping_period_expense\` ADD CONSTRAINT \`FK_2d7b5bece6cb8fb034497ebb010\` FOREIGN KEY (\`category_account_id\`) REFERENCES \`book_keeping_account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_keeping_period_expense\` ADD CONSTRAINT \`FK_7c8c9bd9e75c6147a91c6b5d501\` FOREIGN KEY (\`person_in_charge_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_keeping_period_expense\` ADD CONSTRAINT \`FK_b230343fddb71d1c8c8aae32b75\` FOREIGN KEY (\`charge_account_id\`) REFERENCES \`book_keeping_account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book_keeping_period_expense\` DROP FOREIGN KEY \`FK_b230343fddb71d1c8c8aae32b75\``);
        await queryRunner.query(`ALTER TABLE \`book_keeping_period_expense\` DROP FOREIGN KEY \`FK_7c8c9bd9e75c6147a91c6b5d501\``);
        await queryRunner.query(`ALTER TABLE \`book_keeping_period_expense\` DROP FOREIGN KEY \`FK_2d7b5bece6cb8fb034497ebb010\``);
        await queryRunner.query(`ALTER TABLE \`book_keeping_period_expense\` DROP FOREIGN KEY \`FK_2c6032cde45261e5d322c65ade7\``);
        await queryRunner.query(`DROP INDEX \`IDX_72e3080ecc7281cf09f6feb762\` ON \`book_keeping_period_expense\``);
        await queryRunner.query(`DROP INDEX \`IDX_b230343fddb71d1c8c8aae32b7\` ON \`book_keeping_period_expense\``);
        await queryRunner.query(`DROP INDEX \`IDX_7c8c9bd9e75c6147a91c6b5d50\` ON \`book_keeping_period_expense\``);
        await queryRunner.query(`DROP INDEX \`IDX_2d7b5bece6cb8fb034497ebb01\` ON \`book_keeping_period_expense\``);
        await queryRunner.query(`DROP INDEX \`IDX_1f77ede5dae944a916743962e0\` ON \`book_keeping_period_expense\``);
        await queryRunner.query(`DROP INDEX \`IDX_7115f295d121052a9bc66d0c65\` ON \`book_keeping_period_expense\``);
        await queryRunner.query(`DROP INDEX \`IDX_96003184969a89981baa81a83b\` ON \`book_keeping_period_expense\``);
        await queryRunner.query(`DROP INDEX \`IDX_3abc34b049535bf2be5de648dc\` ON \`book_keeping_period_expense\``);
        await queryRunner.query(`DROP INDEX \`IDX_2c6032cde45261e5d322c65ade\` ON \`book_keeping_period_expense\``);
        await queryRunner.query(`DROP INDEX \`IDX_8d4337f083ec9a6df0de56d4ca\` ON \`book_keeping_period_expense\``);
        await queryRunner.query(`DROP INDEX \`IDX_34763f3d272df29e332dd3a83d\` ON \`book_keeping_period_expense\``);
        await queryRunner.query(`DROP TABLE \`book_keeping_period_expense\``);
    }

}

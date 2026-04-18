import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBookKeepingTransaction1694161131316 implements MigrationInterface {
    name = 'AddBookKeepingTransaction1694161131316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`book_keeping_transaction_item\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`transaction_id\` varchar(36) NOT NULL, \`account_id\` varchar(36) NOT NULL, \`desc\` varchar(255) NOT NULL, \`amount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`is_debit\` tinyint NOT NULL DEFAULT 0, \`is_opening_balance\` tinyint NOT NULL DEFAULT 0, \`deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_2e4c99beb6ffc74335e5cbfcea\` (\`created_at\`), INDEX \`IDX_f03d93e651064042838a14736a\` (\`updated_at\`), INDEX \`IDX_c6c5a037597903a36550987f6d\` (\`transaction_id\`), INDEX \`IDX_41da9c39acee98a707f738bfde\` (\`account_id\`), INDEX \`IDX_810008db94d510e72da01bf433\` (\`is_debit\`), INDEX \`IDX_f61c26e7462c384d31faf216e2\` (\`is_opening_balance\`), INDEX \`IDX_5fc988a3ff0d8dcdf415a5a529\` (\`deleted\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`book_keeping_transaction\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`company_id\` varchar(36) NOT NULL, \`transaction_date\` date NOT NULL, \`deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_0b21b91ef4982814be21a2f941\` (\`created_at\`), INDEX \`IDX_8f578e31ee08880d87d5508931\` (\`updated_at\`), INDEX \`IDX_40065b61afb20552a75852984d\` (\`company_id\`), INDEX \`IDX_ab56204b93c64e07682557635f\` (\`transaction_date\`), INDEX \`IDX_938608d042a1912cf922a50337\` (\`deleted\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction_item\` ADD CONSTRAINT \`FK_c6c5a037597903a36550987f6d4\` FOREIGN KEY (\`transaction_id\`) REFERENCES \`book_keeping_transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction_item\` ADD CONSTRAINT \`FK_41da9c39acee98a707f738bfde5\` FOREIGN KEY (\`account_id\`) REFERENCES \`book_keeping_account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction\` ADD CONSTRAINT \`FK_40065b61afb20552a75852984d7\` FOREIGN KEY (\`company_id\`) REFERENCES \`book_keeping_company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction\` DROP FOREIGN KEY \`FK_40065b61afb20552a75852984d7\``);
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction_item\` DROP FOREIGN KEY \`FK_41da9c39acee98a707f738bfde5\``);
        await queryRunner.query(`ALTER TABLE \`book_keeping_transaction_item\` DROP FOREIGN KEY \`FK_c6c5a037597903a36550987f6d4\``);
        await queryRunner.query(`DROP INDEX \`IDX_938608d042a1912cf922a50337\` ON \`book_keeping_transaction\``);
        await queryRunner.query(`DROP INDEX \`IDX_ab56204b93c64e07682557635f\` ON \`book_keeping_transaction\``);
        await queryRunner.query(`DROP INDEX \`IDX_40065b61afb20552a75852984d\` ON \`book_keeping_transaction\``);
        await queryRunner.query(`DROP INDEX \`IDX_8f578e31ee08880d87d5508931\` ON \`book_keeping_transaction\``);
        await queryRunner.query(`DROP INDEX \`IDX_0b21b91ef4982814be21a2f941\` ON \`book_keeping_transaction\``);
        await queryRunner.query(`DROP TABLE \`book_keeping_transaction\``);
        await queryRunner.query(`DROP INDEX \`IDX_5fc988a3ff0d8dcdf415a5a529\` ON \`book_keeping_transaction_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_f61c26e7462c384d31faf216e2\` ON \`book_keeping_transaction_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_810008db94d510e72da01bf433\` ON \`book_keeping_transaction_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_41da9c39acee98a707f738bfde\` ON \`book_keeping_transaction_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_c6c5a037597903a36550987f6d\` ON \`book_keeping_transaction_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_f03d93e651064042838a14736a\` ON \`book_keeping_transaction_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_2e4c99beb6ffc74335e5cbfcea\` ON \`book_keeping_transaction_item\``);
        await queryRunner.query(`DROP TABLE \`book_keeping_transaction_item\``);
    }

}

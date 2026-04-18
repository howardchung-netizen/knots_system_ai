import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBookKeepingAccount1694146255239 implements MigrationInterface {
    name = 'AddBookKeepingAccount1694146255239'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`book_keeping_account\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`company_id\` varchar(36) NOT NULL, \`account_type_id\` varchar(36) NOT NULL, \`parent_account_id\` varchar(36) NULL, \`name\` varchar(255) NOT NULL, \`balance\` decimal(10,2) NOT NULL DEFAULT '0.00', \`is_placeholder\` tinyint NOT NULL DEFAULT 0, \`is_claim\` tinyint NOT NULL DEFAULT 0, \`order\` int NOT NULL DEFAULT '0', \`deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_537ee70357b89f850932a9063b\` (\`created_at\`), INDEX \`IDX_275a5ef09a794929ca8393b55a\` (\`updated_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`book_keeping_account\` ADD CONSTRAINT \`FK_1f6bc3c76fbcca3ec7df5828fd2\` FOREIGN KEY (\`company_id\`) REFERENCES \`book_keeping_company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_keeping_account\` ADD CONSTRAINT \`FK_249d7b7113a42c0b7c1fae1c0e0\` FOREIGN KEY (\`account_type_id\`) REFERENCES \`book_keeping_account_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_keeping_account\` ADD CONSTRAINT \`FK_3212a95839a38d237cdc00cecd5\` FOREIGN KEY (\`parent_account_id\`) REFERENCES \`book_keeping_account\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book_keeping_account\` DROP FOREIGN KEY \`FK_3212a95839a38d237cdc00cecd5\``);
        await queryRunner.query(`ALTER TABLE \`book_keeping_account\` DROP FOREIGN KEY \`FK_249d7b7113a42c0b7c1fae1c0e0\``);
        await queryRunner.query(`ALTER TABLE \`book_keeping_account\` DROP FOREIGN KEY \`FK_1f6bc3c76fbcca3ec7df5828fd2\``);
        await queryRunner.query(`DROP INDEX \`IDX_275a5ef09a794929ca8393b55a\` ON \`book_keeping_account\``);
        await queryRunner.query(`DROP INDEX \`IDX_537ee70357b89f850932a9063b\` ON \`book_keeping_account\``);
        await queryRunner.query(`DROP TABLE \`book_keeping_account\``);
    }

}

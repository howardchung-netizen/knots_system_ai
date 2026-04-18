import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUserNotification1675175723455 implements MigrationInterface {
    name = 'AddUserNotification1675175723455'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_notification_message_template\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`key\` varchar(255) NOT NULL, \`locale\` enum ('ZH_HANT', 'ZH_HANS', 'EN') NOT NULL DEFAULT 'ZH_HANT', \`category\` enum ('GENERIC') NOT NULL DEFAULT 'GENERIC', \`name\` varchar(255) NOT NULL, \`title\` varchar(255) NULL, \`content\` text NOT NULL, \`short_content\` varchar(255) NOT NULL, \`extra\` json NULL, \`status\` enum ('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE', INDEX \`IDX_376858122732415276d8f647c4\` (\`created_at\`), INDEX \`IDX_960d5249ad3cfdc92560a23b92\` (\`updated_at\`), INDEX \`IDX_5e15d6e1a82b7e7d093e433573\` (\`key\`), INDEX \`IDX_faad4068c34090caafb51e1a5a\` (\`locale\`), INDEX \`IDX_375c5f8d4c0193368bb35c4308\` (\`category\`), INDEX \`IDX_7f441ea027beb57e41a90d4450\` (\`status\`), UNIQUE INDEX \`IDX_6200b70293ca03f65cf8559837\` (\`key\`, \`locale\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_notification_message\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NOT NULL, \`user_notification_message_template_id\` varchar(36) NULL, \`user_notification_message_template_replacements\` json NULL, \`title\` varchar(255) NULL, \`content\` text NOT NULL, \`short_content\` varchar(255) NOT NULL, \`path\` varchar(255) NULL, \`status\` enum ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'DELETED') NOT NULL DEFAULT 'QUEUED', INDEX \`IDX_a4a5e2fe7facc616ce09b7f4e7\` (\`created_at\`), INDEX \`IDX_da9f9ca728115adf923acb6018\` (\`updated_at\`), INDEX \`IDX_1bcdbf20e4f13d70264ba08094\` (\`user_id\`), INDEX \`IDX_04905cdf898698620be712c063\` (\`user_notification_message_template_id\`), INDEX \`IDX_c116e4777c40a1291caec8f0bd\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_notification_token\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NOT NULL, \`token\` varchar(255) NOT NULL, INDEX \`IDX_cf12952525e36abcb6f2b750a1\` (\`created_at\`), INDEX \`IDX_4363328acfef5c40f150e546e6\` (\`updated_at\`), INDEX \`IDX_e7ec45b0a6223be9884149b2ab\` (\`user_id\`), INDEX \`IDX_6a2d032c6a760a1cd761ce2d01\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_notification_message\` ADD CONSTRAINT \`FK_1bcdbf20e4f13d70264ba080948\` FOREIGN KEY (\`user_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_notification_message\` ADD CONSTRAINT \`FK_04905cdf898698620be712c0636\` FOREIGN KEY (\`user_notification_message_template_id\`) REFERENCES \`user_notification_message_template\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_notification_token\` ADD CONSTRAINT \`FK_e7ec45b0a6223be9884149b2abc\` FOREIGN KEY (\`user_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_notification_token\` DROP FOREIGN KEY \`FK_e7ec45b0a6223be9884149b2abc\``);
        await queryRunner.query(`ALTER TABLE \`user_notification_message\` DROP FOREIGN KEY \`FK_04905cdf898698620be712c0636\``);
        await queryRunner.query(`ALTER TABLE \`user_notification_message\` DROP FOREIGN KEY \`FK_1bcdbf20e4f13d70264ba080948\``);
        await queryRunner.query(`DROP INDEX \`IDX_6a2d032c6a760a1cd761ce2d01\` ON \`user_notification_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_e7ec45b0a6223be9884149b2ab\` ON \`user_notification_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_4363328acfef5c40f150e546e6\` ON \`user_notification_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_cf12952525e36abcb6f2b750a1\` ON \`user_notification_token\``);
        await queryRunner.query(`DROP TABLE \`user_notification_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_c116e4777c40a1291caec8f0bd\` ON \`user_notification_message\``);
        await queryRunner.query(`DROP INDEX \`IDX_04905cdf898698620be712c063\` ON \`user_notification_message\``);
        await queryRunner.query(`DROP INDEX \`IDX_1bcdbf20e4f13d70264ba08094\` ON \`user_notification_message\``);
        await queryRunner.query(`DROP INDEX \`IDX_da9f9ca728115adf923acb6018\` ON \`user_notification_message\``);
        await queryRunner.query(`DROP INDEX \`IDX_a4a5e2fe7facc616ce09b7f4e7\` ON \`user_notification_message\``);
        await queryRunner.query(`DROP TABLE \`user_notification_message\``);
        await queryRunner.query(`DROP INDEX \`IDX_6200b70293ca03f65cf8559837\` ON \`user_notification_message_template\``);
        await queryRunner.query(`DROP INDEX \`IDX_7f441ea027beb57e41a90d4450\` ON \`user_notification_message_template\``);
        await queryRunner.query(`DROP INDEX \`IDX_375c5f8d4c0193368bb35c4308\` ON \`user_notification_message_template\``);
        await queryRunner.query(`DROP INDEX \`IDX_faad4068c34090caafb51e1a5a\` ON \`user_notification_message_template\``);
        await queryRunner.query(`DROP INDEX \`IDX_5e15d6e1a82b7e7d093e433573\` ON \`user_notification_message_template\``);
        await queryRunner.query(`DROP INDEX \`IDX_960d5249ad3cfdc92560a23b92\` ON \`user_notification_message_template\``);
        await queryRunner.query(`DROP INDEX \`IDX_376858122732415276d8f647c4\` ON \`user_notification_message_template\``);
        await queryRunner.query(`DROP TABLE \`user_notification_message_template\``);
    }

}

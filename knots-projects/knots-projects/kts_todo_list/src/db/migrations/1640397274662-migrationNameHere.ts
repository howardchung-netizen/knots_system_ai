import {MigrationInterface, QueryRunner} from "typeorm";

export class migrationNameHere1640397274662 implements MigrationInterface {
    name = 'migrationNameHere1640397274662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) AFTER id`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`tel2\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` CHANGE \`id\` \`id\` varchar(255)  CHARACTER SET "utf8mb4" COLLATE "utf8mb4_0900_ai_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` CHANGE \`name_cht\` \`name_cht\` varchar(255) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_0900_ai_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` CHANGE \`name_en\` \`name_en\` varchar(255) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_0900_ai_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` CHANGE \`pw\` \`pw\` varchar(255) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_0900_ai_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` CHANGE \`email\` \`email\` varchar(255) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_0900_ai_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` CHANGE \`status\` \`status\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`daily_remind_time\` tinyint UNSIGNED NOT NULL DEFAULT '9'`);
        await queryRunner.query(`CREATE INDEX \`IDX_9fa34765c3dba36e7a7cfbbaae\` ON \`staff\` (\`created_at\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_78cf93ae22817c7d6ec5c27411\` ON \`staff\` (\`updated_at\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_e4ee98bb552756c180aec1e854\` ON \`staff\` (\`id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_d24d416050fd0175698fa1c787\` ON \`staff\` (\`name_cht\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_f5dd9daf0a15d585f2173e6857\` ON \`staff\` (\`name_en\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_e35adc5d9b68777d3f6ee6e6ad\` ON \`staff\` (\`tel\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_d6614b067daf8bdfdfc84934d2\` ON \`staff\` (\`tel2\`)`);
        await queryRunner.query(`CREATE TABLE \`contact\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`contact_name\` varchar(255) NOT NULL, \`tel\` varchar(255) NULL, \`daily_remind_time\` tinyint UNSIGNED NOT NULL DEFAULT '9', INDEX \`IDX_5655225a1b5dc278f91511bfe5\` (\`created_at\`), INDEX \`IDX_1611bff648370477d5d0a6156c\` (\`updated_at\`), INDEX \`IDX_b5fa6a94c5ed52c27c91777de9\` (\`contact_name\`), INDEX \`IDX_55d4171a7380cfed5b492cf85f\` (\`tel\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        
        await queryRunner.query(`CREATE TABLE \`task\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`dueDate\` VARCHAR(40) NULL, \`is_daily_reminder\` tinyint NOT NULL DEFAULT 0, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`sort_index\` bigint NULL DEFAULT '99999999', \`status\` enum ('TODO', 'DONE') NOT NULL DEFAULT 'TODO', \`done_at\` date NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_febc7b663e9fadd32bb42151c9\` (\`created_at\`), INDEX \`IDX_7ff917c34b35ad9ab50d09d03e\` (\`updated_at\`), INDEX \`IDX_390b81554c9b89631cda24db60\` (\`dueDate\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`task_assigned_staff\` (\`id\` varchar(36) NOT NULL, \`task_id\` varchar(36) NOT NULL, \`staff_id\` int NOT NULL, \`is_daily_reminder\` tinyint NOT NULL DEFAULT 1, INDEX \`IDX_ab2bb106b07f7620e0991144b4\` (\`task_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`task_assigned_contact\` (\`id\` varchar(36) NOT NULL, \`task_id\` varchar(36) NOT NULL, \`contact_id\` varchar(255) NOT NULL, \`is_daily_reminder\` tinyint NOT NULL DEFAULT 1, INDEX \`IDX_004dde720964234f5dd8ec704d\` (\`task_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`task_assigned_staff\` ADD CONSTRAINT \`FK_ab2bb106b07f7620e0991144b44\` FOREIGN KEY (\`task_id\`) REFERENCES \`task\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`task_assigned_staff\` ADD CONSTRAINT \`FK_3541b95dfca3fddb2fdf791e918\` FOREIGN KEY (\`staff_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task_assigned_contact\` ADD CONSTRAINT \`FK_004dde720964234f5dd8ec704d0\` FOREIGN KEY (\`task_id\`) REFERENCES \`task\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`task_assigned_contact\` ADD CONSTRAINT \`FK_ccc2ab8565c6c957b8bcc71ce78\` FOREIGN KEY (\`contact_id\`) REFERENCES \`contact\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`CREATE TABLE \`cron\` (\`entity\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`last_sync_at\` datetime(6) NULL, \`status\` enum ('NA', 'PENDING', 'PROCESSING', 'IGNORED') NOT NULL DEFAULT 'NA', INDEX \`IDX_d7796f71a6a656919ab4f58af3\` (\`created_at\`), INDEX \`IDX_1796dc61aec6646952a9c06cac\` (\`updated_at\`), INDEX \`IDX_06cab9af4117d63095ab88b99f\` (\`last_sync_at\`), INDEX \`IDX_9e45e86496b8ec0b73df324ac4\` (\`status\`), PRIMARY KEY (\`entity\`)) ENGINE=InnoDB`);


    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_9e45e86496b8ec0b73df324ac4\` ON \`cron\``);
        await queryRunner.query(`DROP INDEX \`IDX_06cab9af4117d63095ab88b99f\` ON \`cron\``);
        await queryRunner.query(`DROP INDEX \`IDX_1796dc61aec6646952a9c06cac\` ON \`cron\``);
        await queryRunner.query(`DROP INDEX \`IDX_d7796f71a6a656919ab4f58af3\` ON \`cron\``);
        await queryRunner.query(`DROP TABLE \`cron\``);

        await queryRunner.query(`ALTER TABLE \`task_assigned_contact\` DROP FOREIGN KEY \`FK_ccc2ab8565c6c957b8bcc71ce78\``);
        await queryRunner.query(`ALTER TABLE \`task_assigned_contact\` DROP FOREIGN KEY \`FK_004dde720964234f5dd8ec704d0\``);
        await queryRunner.query(`ALTER TABLE \`task_assigned_staff\` DROP FOREIGN KEY \`FK_3541b95dfca3fddb2fdf791e918\``);
        await queryRunner.query(`ALTER TABLE \`task_assigned_staff\` DROP FOREIGN KEY \`FK_ab2bb106b07f7620e0991144b44\``);
        await queryRunner.query(`DROP INDEX \`IDX_004dde720964234f5dd8ec704d\` ON \`task_assigned_contact\``);
        await queryRunner.query(`DROP TABLE \`task_assigned_contact\``);
        await queryRunner.query(`DROP INDEX \`IDX_ab2bb106b07f7620e0991144b4\` ON \`task_assigned_staff\``);
        await queryRunner.query(`DROP TABLE \`task_assigned_staff\``);
        await queryRunner.query(`DROP INDEX \`IDX_390b81554c9b89631cda24db60\` ON \`task\``);
        await queryRunner.query(`DROP INDEX \`IDX_7ff917c34b35ad9ab50d09d03e\` ON \`task\``);
        await queryRunner.query(`DROP INDEX \`IDX_febc7b663e9fadd32bb42151c9\` ON \`task\``);
        await queryRunner.query(`DROP TABLE \`task\``);

        await queryRunner.query(`DROP INDEX \`IDX_e35adc5d9b68777d3f6ee6e6ad\` ON \`staff\``);
        await queryRunner.query(`DROP INDEX \`IDX_55d4171a7380cfed5b492cf85f\` ON \`contact\``);
        await queryRunner.query(`DROP INDEX \`IDX_b5fa6a94c5ed52c27c91777de9\` ON \`contact\``);
        await queryRunner.query(`DROP INDEX \`IDX_1611bff648370477d5d0a6156c\` ON \`contact\``);
        await queryRunner.query(`DROP INDEX \`IDX_5655225a1b5dc278f91511bfe5\` ON \`contact\``);
        await queryRunner.query(`DROP TABLE \`contact\``);
        await queryRunner.query(`CREATE INDEX \`IDX_02f9f287c95961160824f5528a\` ON \`staff\` (\`tel\`)`);
        await queryRunner.query(`DROP INDEX \`IDX_d6614b067daf8bdfdfc84934d2\` ON \`staff\``);
        await queryRunner.query(`DROP INDEX \`IDX_02f9f287c95961160824f5528a\` ON \`staff\``);
        await queryRunner.query(`DROP INDEX \`IDX_f5dd9daf0a15d585f2173e6857\` ON \`staff\``);
        await queryRunner.query(`DROP INDEX \`IDX_d24d416050fd0175698fa1c787\` ON \`staff\``);
        await queryRunner.query(`DROP INDEX \`IDX_e4ee98bb552756c180aec1e854\` ON \`staff\``);
        await queryRunner.query(`DROP INDEX \`IDX_78cf93ae22817c7d6ec5c27411\` ON \`staff\``);
        await queryRunner.query(`DROP INDEX \`IDX_9fa34765c3dba36e7a7cfbbaae\` ON \`staff\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`daily_remind_time\``);
        await queryRunner.query(`ALTER TABLE \`staff\` CHANGE \`status\` \`status\` int UNSIGNED NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`staff\` CHANGE \`email\` \`email\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` CHANGE \`pw\` varchar(512) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_0900_ai_ci" NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` CHANGE \`name_en\`  \`name_en\` varchar(45) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_0900_ai_ci" NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` CHANGE \`name_cht\` \`name_cht\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` CHANGE \`id\`  \`id\` varchar(45) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_0900_ai_ci" NUL`);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`tel2\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`created_at\``);
    }

}

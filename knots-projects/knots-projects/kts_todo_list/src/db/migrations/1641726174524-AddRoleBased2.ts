import {MigrationInterface, QueryRunner} from "typeorm";

export class AddRoleBased21641726174524 implements MigrationInterface {
    name = 'AddRoleBased21641726174524'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`access\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`createAt\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`createFrom\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`deleteAt\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`deleteFrom\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`editAt\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`editFrom\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`email_verify\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`facebookID\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`googleID\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`img\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`job\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`license\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`loginTypeList\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`staff_code\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`sysLang\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`wechat\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_e35adc5d9b68777d3f6ee6e6ad\` ON \`staff\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`tel\``);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`tel\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`whatsapp\``);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`whatsapp\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`deleted\``);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`deleted\` tinyint NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_ac1e6b1644e89c72ed1e16d2da\` ON \`staff\` (\`name\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_e35adc5d9b68777d3f6ee6e6ad\` ON \`staff\` (\`tel\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_e8ec5ddd9ba3dfce5f286ec76b\` ON \`staff\` (\`whatsapp\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_e8ec5ddd9ba3dfce5f286ec76b\` ON \`staff\``);
        await queryRunner.query(`DROP INDEX \`IDX_e35adc5d9b68777d3f6ee6e6ad\` ON \`staff\``);
        await queryRunner.query(`DROP INDEX \`IDX_ac1e6b1644e89c72ed1e16d2da\` ON \`staff\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`deleted\``);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`deleted\` int NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`whatsapp\``);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`whatsapp\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`tel\``);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`tel\` varchar(20) NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_e35adc5d9b68777d3f6ee6e6ad\` ON \`staff\` (\`tel\`)`);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`name\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`wechat\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`sysLang\` varchar(45) NULL COMMENT 'system language'`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`staff_code\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`loginTypeList\` varchar(250) NULL DEFAULT 'email'`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`license\` varchar(45) CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`job\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`img\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`googleID\` varchar(250) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`facebookID\` varchar(250) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`email_verify\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`editFrom\` varchar(250) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`editAt\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`deleteFrom\` varchar(250) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`deleteAt\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`createFrom\` varchar(250) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`createAt\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`access\` text CHARACTER SET "latin1" COLLATE "latin1_swedish_ci" NULL`);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class addClockInFunction1668441169426 implements MigrationInterface {
    name = 'addClockInFunction1668441169426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`clock_in_contact\` (\`tel\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NULL, \`remark\` varchar(255) NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_dd2fa786612501cf569b00bd1a\` (\`created_at\`), INDEX \`IDX_a39d9cc1fa776051b0f7666d13\` (\`updated_at\`), PRIMARY KEY (\`tel\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`clock_in_location\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`staff_id\` int NOT NULL, \`project_id\` int NOT NULL, \`address\` varchar(255) NOT NULL, \`lat\` decimal(10,6) NOT NULL, \`lon\` decimal(10,6) NOT NULL, INDEX \`IDX_c9edcd1a4bc2747b6f08a467e8\` (\`id\`), INDEX \`IDX_3163999a0960a61cc216906010\` (\`created_at\`), INDEX \`IDX_dab90b3ac273707459e63c3232\` (\`updated_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`clock_in\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`qr_code_created_at\` datetime NOT NULL, \`clocked_in_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`nonce\` varchar(255) NOT NULL, \`is_duplicated\` tinyint NOT NULL DEFAULT 0, \`clock_in_tel\` varchar(255) NOT NULL, \`clock_in_location_id\` int NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_efa50342a3cf1bb1fc00879055\` (\`id\`), INDEX \`IDX_ac7e0e0763f6bb2b5cd1b9567b\` (\`created_at\`), INDEX \`IDX_c0ad5aad8c2df1dd83a9c8ca48\` (\`updated_at\`), INDEX \`IDX_f835c5591cbf53cb45f9f74feb\` (\`clocked_in_at\`), INDEX \`IDX_c64fb890c2b34981092e6c6e3d\` (\`clock_in_tel\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`clock_in_error\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`tel\` varchar(255) NOT NULL, \`message\` varchar(255) NOT NULL, INDEX \`IDX_0e2da3e817f0a406e76025f231\` (\`created_at\`), INDEX \`IDX_8fcf458cb14ea33e1290d576ca\` (\`updated_at\`), INDEX \`IDX_da451660c0aa8a076201de0d06\` (\`tel\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`clock_in_location\` ADD CONSTRAINT \`FK_441ec96dacea70a26cd65948c6e\` FOREIGN KEY (\`staff_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`clock_in_location\` ADD CONSTRAINT \`FK_63decf1533d68321d5c25e5926c\` FOREIGN KEY (\`project_id\`) REFERENCES \`project_info\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`clock_in\` ADD CONSTRAINT \`FK_05cc7bf4e65f82d96439235d5a1\` FOREIGN KEY (\`clock_in_location_id\`) REFERENCES \`clock_in_location\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`clock_in\` DROP FOREIGN KEY \`FK_05cc7bf4e65f82d96439235d5a1\``);
        await queryRunner.query(`ALTER TABLE \`clock_in_location\` DROP FOREIGN KEY \`FK_63decf1533d68321d5c25e5926c\``);
        await queryRunner.query(`ALTER TABLE \`clock_in_location\` DROP FOREIGN KEY \`FK_441ec96dacea70a26cd65948c6e\``);
        await queryRunner.query(`DROP INDEX \`IDX_da451660c0aa8a076201de0d06\` ON \`clock_in_error\``);
        await queryRunner.query(`DROP INDEX \`IDX_8fcf458cb14ea33e1290d576ca\` ON \`clock_in_error\``);
        await queryRunner.query(`DROP INDEX \`IDX_0e2da3e817f0a406e76025f231\` ON \`clock_in_error\``);
        await queryRunner.query(`DROP TABLE \`clock_in_error\``);
        await queryRunner.query(`DROP INDEX \`IDX_c64fb890c2b34981092e6c6e3d\` ON \`clock_in\``);
        await queryRunner.query(`DROP INDEX \`IDX_f835c5591cbf53cb45f9f74feb\` ON \`clock_in\``);
        await queryRunner.query(`DROP INDEX \`IDX_c0ad5aad8c2df1dd83a9c8ca48\` ON \`clock_in\``);
        await queryRunner.query(`DROP INDEX \`IDX_ac7e0e0763f6bb2b5cd1b9567b\` ON \`clock_in\``);
        await queryRunner.query(`DROP INDEX \`IDX_efa50342a3cf1bb1fc00879055\` ON \`clock_in\``);
        await queryRunner.query(`DROP TABLE \`clock_in\``);
        await queryRunner.query(`DROP INDEX \`IDX_dab90b3ac273707459e63c3232\` ON \`clock_in_location\``);
        await queryRunner.query(`DROP INDEX \`IDX_3163999a0960a61cc216906010\` ON \`clock_in_location\``);
        await queryRunner.query(`DROP INDEX \`IDX_c9edcd1a4bc2747b6f08a467e8\` ON \`clock_in_location\``);
        await queryRunner.query(`DROP TABLE \`clock_in_location\``);
        await queryRunner.query(`DROP INDEX \`IDX_a39d9cc1fa776051b0f7666d13\` ON \`clock_in_contact\``);
        await queryRunner.query(`DROP INDEX \`IDX_dd2fa786612501cf569b00bd1a\` ON \`clock_in_contact\``);
        await queryRunner.query(`DROP TABLE \`clock_in_contact\``);
    }

}

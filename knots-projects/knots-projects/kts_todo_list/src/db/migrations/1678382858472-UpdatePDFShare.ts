import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdatePDFShare1678382858472 implements MigrationInterface {
    name = 'UpdatePDFShare1678382858472'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_240435f14c933adff6784ea847\` ON \`pdf\``);
        await queryRunner.query(`CREATE TABLE \`pdf_share\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`pdf_id\` varchar(36) NOT NULL, \`expired_time\` datetime NOT NULL, \`code\` varchar(255) NOT NULL, \`remark\` varchar(255) NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_5a450214a5ac58270cd80b4b62\` (\`created_at\`), INDEX \`IDX_9c85fa4b8e42a4b49b6620f278\` (\`pdf_id\`), INDEX \`IDX_240435f14c933adff6784ea847\` (\`code\`), INDEX \`IDX_88cca21a1e52a43a04c9823e81\` (\`is_deleted\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`pdf\` DROP COLUMN \`version\``);
        await queryRunner.query(`ALTER TABLE \`pdf\` DROP COLUMN \`type_id\``);
        await queryRunner.query(`ALTER TABLE \`pdf\` DROP COLUMN \`share_end_time\``);
        await queryRunner.query(`ALTER TABLE \`pdf\` DROP COLUMN \`share_code\``);
        await queryRunner.query(`ALTER TABLE \`pdf\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`pdf_share\` ADD CONSTRAINT \`FK_9c85fa4b8e42a4b49b6620f278c\` FOREIGN KEY (\`pdf_id\`) REFERENCES \`pdf\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pdf_share\` DROP FOREIGN KEY \`FK_9c85fa4b8e42a4b49b6620f278c\``);
        await queryRunner.query(`ALTER TABLE \`pdf\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`pdf\` ADD \`share_code\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`pdf\` ADD \`share_end_time\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`pdf\` ADD \`type_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`pdf\` ADD \`version\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`project_status\` ADD \`next\` text NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_88cca21a1e52a43a04c9823e81\` ON \`pdf_share\``);
        await queryRunner.query(`DROP INDEX \`IDX_240435f14c933adff6784ea847\` ON \`pdf_share\``);
        await queryRunner.query(`DROP INDEX \`IDX_9c85fa4b8e42a4b49b6620f278\` ON \`pdf_share\``);
        await queryRunner.query(`DROP INDEX \`IDX_5a450214a5ac58270cd80b4b62\` ON \`pdf_share\``);
        await queryRunner.query(`DROP TABLE \`pdf_share\``);
        await queryRunner.query(`CREATE INDEX \`IDX_240435f14c933adff6784ea847\` ON \`pdf\` (\`share_code\`)`);
    }

}

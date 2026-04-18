import {MigrationInterface, QueryRunner} from "typeorm";

export class RestructPDF1678122606998 implements MigrationInterface {
    name = 'RestructPDF1678122606998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`pdf_upload\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`pdf_id\` varchar(255) NOT NULL, \`file_path\` varchar(255) NOT NULL, \`deleted\` tinyint NOT NULL DEFAULT 0, \`created_by\` int NULL, \`ip\` varchar(255) NULL, INDEX \`IDX_70b1b39b3f1a8722df66263184\` (\`created_at\`), INDEX \`IDX_81d1787b350003e2d06b486307\` (\`updated_at\`), INDEX \`IDX_64f74286d2587b07bbc81e4acc\` (\`pdf_id\`), INDEX \`IDX_7255278fd0054de190ca152315\` (\`created_by\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pdf_source_page_version\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`pdf_source_page_id\` varchar(255) NOT NULL, \`file_path\` varchar(255) NOT NULL, \`version\` int NOT NULL DEFAULT '1', \`pdf_upload_id\` varchar(255) NOT NULL, \`upload_page\` int NOT NULL, \`deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_582ea88cbcd3f793c567406c45\` (\`created_at\`), INDEX \`IDX_0b0f5965e25bea35ebf9940bb0\` (\`updated_at\`), INDEX \`IDX_1a18caa51fdf0721fc8cbe1ae6\` (\`pdf_source_page_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pdf_source_page\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`pdf_source_id\` varchar(255) NOT NULL, \`pdf_source_page_version_id\` varchar(255) NOT NULL, \`page\` int NOT NULL DEFAULT '0', \`version\` int NOT NULL DEFAULT '1', \`deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_bf80c75f1bba37a386aed3fc8b\` (\`created_at\`), INDEX \`IDX_8b5b0a01d266a645e8d16f1553\` (\`updated_at\`), INDEX \`IDX_9d9bead13b5bf568d303abcfa8\` (\`pdf_source_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pdf_source\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`pdf_id\` varchar(255) NOT NULL, \`file_path\` varchar(255) NOT NULL, \`deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_93f194b2b5e5e0d801dfbc1875\` (\`created_at\`), INDEX \`IDX_02d25f6238a047d890fa570b24\` (\`updated_at\`), INDEX \`IDX_5b5d82795cdb2a5046ad0610ee\` (\`pdf_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pdf_compare\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`source_page_version_id\` varchar(255) NOT NULL, \`target_page_version_id\` varchar(255) NOT NULL, \`file_path\` varchar(255) NULL, \`created_by\` int NULL, INDEX \`IDX_062020c867da052e32fc302a07\` (\`created_at\`), INDEX \`IDX_73a4b3eab36c96195202b92264\` (\`updated_at\`), INDEX \`IDX_a8bdc9ff38bd7c80409be36bc2\` (\`source_page_version_id\`), INDEX \`IDX_16342eadcf7e20d14aecefcc12\` (\`target_page_version_id\`), INDEX \`IDX_2ca49cdb66b6b39cd1a3dde0a9\` (\`created_by\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`pdf_upload\` ADD CONSTRAINT \`FK_64f74286d2587b07bbc81e4acc6\` FOREIGN KEY (\`pdf_id\`) REFERENCES \`pdf\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`pdf_upload\` ADD CONSTRAINT \`FK_7255278fd0054de190ca152315f\` FOREIGN KEY (\`created_by\`) REFERENCES \`staff\`(\`uid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pdf_source_page_version\` ADD CONSTRAINT \`FK_3c6e3e72696d0472cf7ab8bd54f\` FOREIGN KEY (\`pdf_upload_id\`) REFERENCES \`pdf_upload\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`pdf_source_page\` ADD CONSTRAINT \`FK_9d9bead13b5bf568d303abcfa87\` FOREIGN KEY (\`pdf_source_id\`) REFERENCES \`pdf_source\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`pdf_source\` ADD CONSTRAINT \`FK_5b5d82795cdb2a5046ad0610ee3\` FOREIGN KEY (\`pdf_id\`) REFERENCES \`pdf\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`pdf_compare\` ADD CONSTRAINT \`FK_a8bdc9ff38bd7c80409be36bc29\` FOREIGN KEY (\`source_page_version_id\`) REFERENCES \`pdf_source_page_version\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pdf_compare\` ADD CONSTRAINT \`FK_16342eadcf7e20d14aecefcc12a\` FOREIGN KEY (\`target_page_version_id\`) REFERENCES \`pdf_source_page_version\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pdf_compare\` ADD CONSTRAINT \`FK_2ca49cdb66b6b39cd1a3dde0a98\` FOREIGN KEY (\`created_by\`) REFERENCES \`staff\`(\`uid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pdf_compare\` DROP FOREIGN KEY \`FK_2ca49cdb66b6b39cd1a3dde0a98\``);
        await queryRunner.query(`ALTER TABLE \`pdf_compare\` DROP FOREIGN KEY \`FK_16342eadcf7e20d14aecefcc12a\``);
        await queryRunner.query(`ALTER TABLE \`pdf_compare\` DROP FOREIGN KEY \`FK_a8bdc9ff38bd7c80409be36bc29\``);
        await queryRunner.query(`ALTER TABLE \`pdf_source\` DROP FOREIGN KEY \`FK_5b5d82795cdb2a5046ad0610ee3\``);
        await queryRunner.query(`ALTER TABLE \`pdf_source_page\` DROP FOREIGN KEY \`FK_9d9bead13b5bf568d303abcfa87\``);
        await queryRunner.query(`ALTER TABLE \`pdf_source_page_version\` DROP FOREIGN KEY \`FK_3c6e3e72696d0472cf7ab8bd54f\``);
        await queryRunner.query(`ALTER TABLE \`pdf_upload\` DROP FOREIGN KEY \`FK_7255278fd0054de190ca152315f\``);
        await queryRunner.query(`ALTER TABLE \`pdf_upload\` DROP FOREIGN KEY \`FK_64f74286d2587b07bbc81e4acc6\``);
        await queryRunner.query(`DROP INDEX \`IDX_2ca49cdb66b6b39cd1a3dde0a9\` ON \`pdf_compare\``);
        await queryRunner.query(`DROP INDEX \`IDX_16342eadcf7e20d14aecefcc12\` ON \`pdf_compare\``);
        await queryRunner.query(`DROP INDEX \`IDX_a8bdc9ff38bd7c80409be36bc2\` ON \`pdf_compare\``);
        await queryRunner.query(`DROP INDEX \`IDX_73a4b3eab36c96195202b92264\` ON \`pdf_compare\``);
        await queryRunner.query(`DROP INDEX \`IDX_062020c867da052e32fc302a07\` ON \`pdf_compare\``);
        await queryRunner.query(`DROP TABLE \`pdf_compare\``);
        await queryRunner.query(`DROP INDEX \`IDX_5b5d82795cdb2a5046ad0610ee\` ON \`pdf_source\``);
        await queryRunner.query(`DROP INDEX \`IDX_02d25f6238a047d890fa570b24\` ON \`pdf_source\``);
        await queryRunner.query(`DROP INDEX \`IDX_93f194b2b5e5e0d801dfbc1875\` ON \`pdf_source\``);
        await queryRunner.query(`DROP TABLE \`pdf_source\``);
        await queryRunner.query(`DROP INDEX \`IDX_9d9bead13b5bf568d303abcfa8\` ON \`pdf_source_page\``);
        await queryRunner.query(`DROP INDEX \`IDX_8b5b0a01d266a645e8d16f1553\` ON \`pdf_source_page\``);
        await queryRunner.query(`DROP INDEX \`IDX_bf80c75f1bba37a386aed3fc8b\` ON \`pdf_source_page\``);
        await queryRunner.query(`DROP TABLE \`pdf_source_page\``);
        await queryRunner.query(`DROP INDEX \`IDX_1a18caa51fdf0721fc8cbe1ae6\` ON \`pdf_source_page_version\``);
        await queryRunner.query(`DROP INDEX \`IDX_0b0f5965e25bea35ebf9940bb0\` ON \`pdf_source_page_version\``);
        await queryRunner.query(`DROP INDEX \`IDX_582ea88cbcd3f793c567406c45\` ON \`pdf_source_page_version\``);
        await queryRunner.query(`DROP TABLE \`pdf_source_page_version\``);
        await queryRunner.query(`DROP INDEX \`IDX_7255278fd0054de190ca152315\` ON \`pdf_upload\``);
        await queryRunner.query(`DROP INDEX \`IDX_64f74286d2587b07bbc81e4acc\` ON \`pdf_upload\``);
        await queryRunner.query(`DROP INDEX \`IDX_81d1787b350003e2d06b486307\` ON \`pdf_upload\``);
        await queryRunner.query(`DROP INDEX \`IDX_70b1b39b3f1a8722df66263184\` ON \`pdf_upload\``);
        await queryRunner.query(`DROP TABLE \`pdf_upload\``);
    }

}

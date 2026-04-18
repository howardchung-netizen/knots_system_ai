import {MigrationInterface, QueryRunner} from "typeorm";

export class AlbumShareToken1651102758444 implements MigrationInterface {
    name = 'AlbumShareToken1651102758444'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`project_info\` ADD \`album_share_token\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`project_info\` DROP COLUMN \`album_share_token\``);
    }

}

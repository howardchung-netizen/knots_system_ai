import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateProject1690919065098 implements MigrationInterface {
    name = 'UpdateProject1690919065098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`project_info_hashtags_hashtag\` (\`project_id\` int NOT NULL, \`hashtag_id\` int NOT NULL, INDEX \`IDX_f49929955b4df23c3cd67bd61f\` (\`project_id\`), INDEX \`IDX_a46d11da04c38d56aa8d51caa4\` (\`hashtag_id\`), PRIMARY KEY (\`project_id\`, \`hashtag_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`project_info_hashtags_hashtag\` ADD CONSTRAINT \`FK_f49929955b4df23c3cd67bd61f3\` FOREIGN KEY (\`project_id\`) REFERENCES \`project_info\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`project_info_hashtags_hashtag\` ADD CONSTRAINT \`FK_a46d11da04c38d56aa8d51caa4e\` FOREIGN KEY (\`hashtag_id\`) REFERENCES \`hashtag\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`INSERT INTO project_info_assignee_staff (project_id, user_id) SELECT pi.id AS project_id, u.uid AS user_id FROM project_info pi JOIN staff u ON FIND_IN_SET(u.uid, pi.assigness) > 0;`);
        await queryRunner.query(`INSERT INTO project_info_hashtags_hashtag (project_id, hashtag_id) SELECT pi.id AS project_id, h.id AS hashtag_id FROM project_info pi JOIN hashtag h ON FIND_IN_SET(h.id, pi.hashtags) > 0;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`project_info_hashtags_hashtag\` DROP FOREIGN KEY \`FK_a46d11da04c38d56aa8d51caa4e\``);
        await queryRunner.query(`ALTER TABLE \`project_info_hashtags_hashtag\` DROP FOREIGN KEY \`FK_f49929955b4df23c3cd67bd61f3\``);
        await queryRunner.query(`DROP INDEX \`IDX_a46d11da04c38d56aa8d51caa4\` ON \`project_info_hashtags_hashtag\``);
        await queryRunner.query(`DROP INDEX \`IDX_f49929955b4df23c3cd67bd61f\` ON \`project_info_hashtags_hashtag\``);
        await queryRunner.query(`DROP TABLE \`project_info_hashtags_hashtag\``);
    }

}

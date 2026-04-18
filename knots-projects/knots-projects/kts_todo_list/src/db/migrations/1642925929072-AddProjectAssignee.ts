import {MigrationInterface, QueryRunner} from "typeorm";

export class AddProjectAssignee1642925929072 implements MigrationInterface {
    name = 'AddProjectAssignee1642925929072'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`project_info_assignee_staff\` (\`project_id\` int NOT NULL, \`user_id\` int NOT NULL, INDEX \`IDX_7efccb0e68c8b23f09c159c411\` (\`project_id\`), INDEX \`IDX_43502d8417d3ae708cb5e1f1ed\` (\`user_id\`), PRIMARY KEY (\`project_id\`, \`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`project_info_assignee_staff\` ADD CONSTRAINT \`FK_7efccb0e68c8b23f09c159c4110\` FOREIGN KEY (\`project_id\`) REFERENCES \`project_info\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`project_info_assignee_staff\` ADD CONSTRAINT \`FK_43502d8417d3ae708cb5e1f1ed9\` FOREIGN KEY (\`user_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`project_info_assignee_staff\` DROP FOREIGN KEY \`FK_43502d8417d3ae708cb5e1f1ed9\``);
        await queryRunner.query(`ALTER TABLE \`project_info_assignee_staff\` DROP FOREIGN KEY \`FK_7efccb0e68c8b23f09c159c4110\``);
        await queryRunner.query(`DROP TABLE \`project_info_assignee_staff\``);
    }

}

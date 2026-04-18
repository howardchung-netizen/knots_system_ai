import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateProjectItemSchedule1689114558454 implements MigrationInterface {
    name = 'UpdateProjectItemSchedule1689114558454'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`project_item_schedule\` CHANGE \`uuid\` \`uuid\` varchar(255) NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_8404c710824eb0417830da04cd\` ON \`project_item_schedule\` (\`uuid\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_8404c710824eb0417830da04cd\` ON \`project_item_schedule\``);
    }

}

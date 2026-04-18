import {MigrationInterface, QueryRunner} from "typeorm";

export class AddProjectItemSchedule1689112247940 implements MigrationInterface {
    name = 'AddProjectItemSchedule1689112247940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_3cc10b68fc459d502878f1062f\` ON \`project_item_schedule\` (\`item_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_e7a38766e03699dbd47c7334b0\` ON \`project_item_schedule\` (\`deleted\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_e7a38766e03699dbd47c7334b0\` ON \`project_item_schedule\``);
        await queryRunner.query(`DROP INDEX \`IDX_3cc10b68fc459d502878f1062f\` ON \`project_item_schedule\``);
    }

}

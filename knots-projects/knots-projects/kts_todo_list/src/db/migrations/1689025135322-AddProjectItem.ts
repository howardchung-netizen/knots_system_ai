import {MigrationInterface, QueryRunner} from "typeorm";

export class AddProjectItem1689025135322 implements MigrationInterface {
    name = 'AddProjectItem1689025135322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_33f266f309267ec8b12eb6b695\` ON \`project_item\` (\`name_en\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_083ad7af727d0e75e14f896c01\` ON \`project_item\` (\`name_cht\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_9800f154d50c1138ab9c082b20\` ON \`project_item\` (\`unit\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_a6b9da67b37a3c44c0b41444cc\` ON \`project_item\` (\`activePrice\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_4bc9e17413e1b99164139860c6\` ON \`project_item\` (\`upper\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_bbaffb488a7d2f67621dbfc5e1\` ON \`project_item\` (\`sort\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_4889e33f8b46ab49c35fefd320\` ON \`project_item\` (\`show\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_e25e3f243bdaf8f5fc9cc80547\` ON \`project_item\` (\`delete\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_e25e3f243bdaf8f5fc9cc80547\` ON \`project_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_4889e33f8b46ab49c35fefd320\` ON \`project_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_bbaffb488a7d2f67621dbfc5e1\` ON \`project_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_4bc9e17413e1b99164139860c6\` ON \`project_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_a6b9da67b37a3c44c0b41444cc\` ON \`project_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_9800f154d50c1138ab9c082b20\` ON \`project_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_083ad7af727d0e75e14f896c01\` ON \`project_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_33f266f309267ec8b12eb6b695\` ON \`project_item\``);
    }

}

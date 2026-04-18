import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateProjectInfo1688656404339 implements MigrationInterface {
    name = 'UpdateProjectInfo1688656404339'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_37ba384e723a840b6f53a7934f\` ON \`project_info\` (\`created_at\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_800dd86bdfb9fd9ef308e5a599\` ON \`project_info\` (\`updated_at\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_57745d6ef0086930b77b616d94\` ON \`project_info\` (\`project_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_a29ab624f4142446d83ee8d93b\` ON \`project_info\` (\`progress\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b0787a24b2cb65f281eecbc2dd\` ON \`project_info\` (\`p_type\`)`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_b0787a24b2cb65f281eecbc2dd\` ON \`project_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_a29ab624f4142446d83ee8d93b\` ON \`project_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_57745d6ef0086930b77b616d94\` ON \`project_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_800dd86bdfb9fd9ef308e5a599\` ON \`project_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_37ba384e723a840b6f53a7934f\` ON \`project_info\``);
    }

}

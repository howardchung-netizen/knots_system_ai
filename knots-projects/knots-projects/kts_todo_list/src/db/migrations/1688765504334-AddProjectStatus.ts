import {MigrationInterface, QueryRunner} from "typeorm";

export class AddProjectStatus1688765504334 implements MigrationInterface {
    name = 'AddProjectStatus1688765504334'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`project_status\` CHANGE \`style\` \`style\` varchar(50) NOT NULL DEFAULT '#000000'`);
        await queryRunner.query(`ALTER TABLE \`project_status\` CHANGE \`sort\` \`sort\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`CREATE INDEX \`IDX_34117925d0e197d21ea45b3cd0\` ON \`project_status\` (\`name_cht\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_e3ae515c4c881ef0fac0556000\` ON \`project_status\` (\`sort\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_3c9f1b0ba68133bb4c771486f9\` ON \`project_status\` (\`createAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_d804d4b57ccfd5bd8c0a96de22\` ON \`project_status\` (\`editAt\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_d804d4b57ccfd5bd8c0a96de22\` ON \`project_status\``);
        await queryRunner.query(`DROP INDEX \`IDX_3c9f1b0ba68133bb4c771486f9\` ON \`project_status\``);
        await queryRunner.query(`DROP INDEX \`IDX_e3ae515c4c881ef0fac0556000\` ON \`project_status\``);
        await queryRunner.query(`DROP INDEX \`IDX_34117925d0e197d21ea45b3cd0\` ON \`project_status\``);
        await queryRunner.query(`ALTER TABLE \`project_status\` CHANGE \`sort\` \`sort\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`project_status\` CHANGE \`style\` \`style\` text NULL`);
    }

}

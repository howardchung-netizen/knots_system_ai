import {MigrationInterface, QueryRunner} from "typeorm";

export class assignProject1654473046410 implements MigrationInterface {
    name = 'assignProject1654473046410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`task_assigned_project\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`task_id\` varchar(36) NOT NULL, \`project_id\` int NULL, \`section_name\` varchar(255) NULL, \`sorting_index\` bigint NULL DEFAULT '99999999', INDEX \`IDX_1f2ee1c9d4f980b51af0579b68\` (\`created_at\`), INDEX \`IDX_8c828b444ce63c397f2c6d14e0\` (\`updated_at\`), INDEX \`IDX_75d33df8202b1ea2ad7474f1c8\` (\`task_id\`), INDEX \`IDX_ca3f1c44d9836856e899ef11e6\` (\`project_id\`), UNIQUE INDEX \`IDX_c8e940c0ff53d92571af05f919\` (\`task_id\`, \`project_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`task_assigned_project\` ADD CONSTRAINT \`FK_75d33df8202b1ea2ad7474f1c84\` FOREIGN KEY (\`task_id\`) REFERENCES \`task\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`task_assigned_project\` ADD CONSTRAINT \`FK_ca3f1c44d9836856e899ef11e6f\` FOREIGN KEY (\`project_id\`) REFERENCES \`project_info\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP FOREIGN KEY \`FK_77d7993415ba9aaea2fcee03d27\``);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP FOREIGN KEY \`FK_5b3cba674258d620e0a73f227b0\``);
        await queryRunner.query(`DROP INDEX \`IDX_77d7993415ba9aaea2fcee03d2\` ON \`task_projects_project_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_5b3cba674258d620e0a73f227b\` ON \`task_projects_project_info\``);
        await queryRunner.query('DROP TABLE task_projects_project_info;')

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task_assigned_project\` DROP FOREIGN KEY \`FK_ca3f1c44d9836856e899ef11e6f\``);
        await queryRunner.query(`ALTER TABLE \`task_assigned_project\` DROP FOREIGN KEY \`FK_75d33df8202b1ea2ad7474f1c84\``);
        await queryRunner.query(`DROP INDEX \`IDX_c8e940c0ff53d92571af05f919\` ON \`task_assigned_project\``);
        await queryRunner.query(`DROP INDEX \`IDX_ca3f1c44d9836856e899ef11e6\` ON \`task_assigned_project\``);
        await queryRunner.query(`DROP INDEX \`IDX_75d33df8202b1ea2ad7474f1c8\` ON \`task_assigned_project\``);
        await queryRunner.query(`DROP INDEX \`IDX_8c828b444ce63c397f2c6d14e0\` ON \`task_assigned_project\``);
        await queryRunner.query(`DROP INDEX \`IDX_1f2ee1c9d4f980b51af0579b68\` ON \`task_assigned_project\``);
        await queryRunner.query(`DROP TABLE \`task_assigned_project\``);
        await queryRunner.query(`CREATE TABLE \`task_projects_project_info\` (\`task_id\` varchar(36) NOT NULL, \`project_id\` int NOT NULL, INDEX \`IDX_5b3cba674258d620e0a73f227b\` (\`task_id\`), INDEX \`IDX_77d7993415ba9aaea2fcee03d2\` (\`project_id\`), PRIMARY KEY (\`task_id\`, \`project_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD CONSTRAINT \`FK_5b3cba674258d620e0a73f227b0\` FOREIGN KEY (\`task_id\`) REFERENCES \`task\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD CONSTRAINT \`FK_77d7993415ba9aaea2fcee03d27\` FOREIGN KEY (\`project_id\`) REFERENCES \`project_info\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);

        

    }

}

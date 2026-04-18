import {MigrationInterface, QueryRunner} from "typeorm";

export class TaskSection1643796064310 implements MigrationInterface {
    name = 'TaskSection1643796064310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP FOREIGN KEY \`FK_5b3cba674258d620e0a73f227b0\``);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP FOREIGN KEY \`FK_77d7993415ba9aaea2fcee03d27\``);
        await queryRunner.query(`CREATE TABLE \`task_section\` (\`id\` varchar(36) NOT NULL, \`name\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD \`id\` varchar(36) NOT NULL FIRST`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD \`section_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` CHANGE \`project_id\` \`project_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`task\` DROP COLUMN \`sort_index\``);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD \`sorting_index\` bigint NULL DEFAULT '99999999'`);
        await queryRunner.query(`CREATE INDEX \`IDX_111ea9ac79704c9f0cf47d5617\` ON \`task_projects_project_info\` (\`user_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_80548e4c8c3220e3fb22b1df12\` ON \`task_projects_project_info\` (\`section_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_22e005dc867ce446d7f43149b6\` ON \`task_projects_project_info\` (\`task_id\`, \`user_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_ae1ee57f6a8d16eaaba033f6c8\` ON \`task_projects_project_info\` (\`task_id\`, \`project_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_c1f69ec70bc346a05f59ea54e0\` ON \`task_projects_project_info\` (\`task_id\`, \`project_id\`, \`user_id\`, \`section_id\`)`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD CONSTRAINT \`FK_5b3cba674258d620e0a73f227b0\` FOREIGN KEY (\`task_id\`) REFERENCES \`task\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD CONSTRAINT \`FK_77d7993415ba9aaea2fcee03d27\` FOREIGN KEY (\`project_id\`) REFERENCES \`project_info\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD CONSTRAINT \`FK_111ea9ac79704c9f0cf47d56175\` FOREIGN KEY (\`user_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD CONSTRAINT \`FK_80548e4c8c3220e3fb22b1df12b\` FOREIGN KEY (\`section_id\`) REFERENCES \`task_section\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP FOREIGN KEY \`FK_80548e4c8c3220e3fb22b1df12b\``);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP FOREIGN KEY \`FK_111ea9ac79704c9f0cf47d56175\``);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP FOREIGN KEY \`FK_77d7993415ba9aaea2fcee03d27\``);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP FOREIGN KEY \`FK_5b3cba674258d620e0a73f227b0\``);
        await queryRunner.query(`DROP INDEX \`IDX_c1f69ec70bc346a05f59ea54e0\` ON \`task_projects_project_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_ae1ee57f6a8d16eaaba033f6c8\` ON \`task_projects_project_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_22e005dc867ce446d7f43149b6\` ON \`task_projects_project_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_80548e4c8c3220e3fb22b1df12\` ON \`task_projects_project_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_111ea9ac79704c9f0cf47d5617\` ON \`task_projects_project_info\``);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP COLUMN \`sorting_index\``);
        await queryRunner.query(`ALTER TABLE \`task\` ADD \`sort_index\` bigint NULL DEFAULT '99999999'`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD PRIMARY KEY (\`project_id\`, \`id\`)`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` CHANGE \`project_id\` \`project_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD PRIMARY KEY (\`task_id\`, \`project_id\`, \`id\`)`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP COLUMN \`section_id\``);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD PRIMARY KEY (\`task_id\`, \`project_id\`)`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP COLUMN \`id\``);
        await queryRunner.query(`DROP TABLE \`task_section\``);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD CONSTRAINT \`FK_77d7993415ba9aaea2fcee03d27\` FOREIGN KEY (\`project_id\`) REFERENCES \`project_info\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD CONSTRAINT \`FK_5b3cba674258d620e0a73f227b0\` FOREIGN KEY (\`task_id\`) REFERENCES \`task\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}

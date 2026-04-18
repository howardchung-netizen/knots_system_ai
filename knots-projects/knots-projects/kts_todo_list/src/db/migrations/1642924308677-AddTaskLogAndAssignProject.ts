import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTaskLogAndAssignProject1642924308677 implements MigrationInterface {
    name = 'AddTaskLogAndAssignProject1642924308677'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`task_log\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`task_id\` varchar(255) NOT NULL, \`user_id\` int NOT NULL, \`changes\` json NULL, INDEX \`IDX_356158cfd705084a378fdc4dad\` (\`created_at\`), INDEX \`IDX_b801d0e6c5df8364141de8b15f\` (\`updated_at\`), INDEX \`IDX_296547bb2400bf38046946213f\` (\`task_id\`), INDEX \`IDX_d3064bf11c8316227c4671024a\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`task_projects_project_info\` (\`task_id\` varchar(36) NOT NULL, \`project_id\` int NOT NULL, INDEX \`IDX_5b3cba674258d620e0a73f227b\` (\`task_id\`), INDEX \`IDX_77d7993415ba9aaea2fcee03d2\` (\`project_id\`), PRIMARY KEY (\`task_id\`, \`project_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`project_status\` CHANGE \`show\` \`show\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`project_info\` CHANGE \`status\` \`status\` int NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`project_info\` CHANGE \`valid\` \`valid\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`CREATE INDEX \`IDX_bcea60c9fa0a2fb2be295f486a\` ON \`project_status\` (\`code\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_7334aedee121f15c9e0814d115\` ON \`project_status\` (\`name_en\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_7f3fe662b86fd4dd76b79bdb29\` ON \`project_status\` (\`show\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_e0a0831bd4ccf01363fccb98b8\` ON \`project_info\` (\`code\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_963a75b70857505743ed80fbea\` ON \`project_info\` (\`status\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_4daa9586ad2e5b320cf8bc94e4\` ON \`project_info\` (\`valid\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2fe7a278e6f08d2be55740a939\` ON \`task\` (\`status\`)`);
        await queryRunner.query(`ALTER TABLE \`task_log\` ADD CONSTRAINT \`FK_296547bb2400bf38046946213fc\` FOREIGN KEY (\`task_id\`) REFERENCES \`task\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task_log\` ADD CONSTRAINT \`FK_d3064bf11c8316227c4671024a1\` FOREIGN KEY (\`user_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD CONSTRAINT \`FK_5b3cba674258d620e0a73f227b0\` FOREIGN KEY (\`task_id\`) REFERENCES \`task\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` ADD CONSTRAINT \`FK_77d7993415ba9aaea2fcee03d27\` FOREIGN KEY (\`project_id\`) REFERENCES \`project_info\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP FOREIGN KEY \`FK_77d7993415ba9aaea2fcee03d27\``);
        await queryRunner.query(`ALTER TABLE \`task_projects_project_info\` DROP FOREIGN KEY \`FK_5b3cba674258d620e0a73f227b0\``);
        await queryRunner.query(`ALTER TABLE \`task_log\` DROP FOREIGN KEY \`FK_d3064bf11c8316227c4671024a1\``);
        await queryRunner.query(`ALTER TABLE \`task_log\` DROP FOREIGN KEY \`FK_296547bb2400bf38046946213fc\``);
        await queryRunner.query(`DROP INDEX \`IDX_2fe7a278e6f08d2be55740a939\` ON \`task\``);
        await queryRunner.query(`DROP INDEX \`IDX_4daa9586ad2e5b320cf8bc94e4\` ON \`project_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_963a75b70857505743ed80fbea\` ON \`project_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_e0a0831bd4ccf01363fccb98b8\` ON \`project_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_7f3fe662b86fd4dd76b79bdb29\` ON \`project_status\``);
        await queryRunner.query(`DROP INDEX \`IDX_7334aedee121f15c9e0814d115\` ON \`project_status\``);
        await queryRunner.query(`DROP INDEX \`IDX_bcea60c9fa0a2fb2be295f486a\` ON \`project_status\``);
        await queryRunner.query(`ALTER TABLE \`project_info\` CHANGE \`valid\` \`valid\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`project_info\` CHANGE \`status\` \`status\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`project_status\` CHANGE \`show\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`DROP INDEX \`IDX_77d7993415ba9aaea2fcee03d2\` ON \`task_projects_project_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_5b3cba674258d620e0a73f227b\` ON \`task_projects_project_info\``);
        await queryRunner.query(`DROP TABLE \`task_projects_project_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_d3064bf11c8316227c4671024a\` ON \`task_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_296547bb2400bf38046946213f\` ON \`task_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_b801d0e6c5df8364141de8b15f\` ON \`task_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_356158cfd705084a378fdc4dad\` ON \`task_log\``);
        await queryRunner.query(`DROP TABLE \`task_log\``);
    }

}

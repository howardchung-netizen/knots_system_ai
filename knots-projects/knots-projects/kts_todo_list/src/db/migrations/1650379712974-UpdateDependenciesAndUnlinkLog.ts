import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateDependenciesAndUnlinkLog1650379712974 implements MigrationInterface {
    name = 'UpdateDependenciesAndUnlinkLog1650379712974'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gantt_log\` DROP FOREIGN KEY \`FK_6218b5008d19c7705f420ebca11\``);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` DROP FOREIGN KEY \`FK_73733159e5b87a99d67b047c1fd\``);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` DROP FOREIGN KEY \`FK_bc6eedb8f8aca4081aa70eb7193\``);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` DROP FOREIGN KEY \`FK_41767ec43b35fe4601a758c6677\``);
        await queryRunner.query(`DROP INDEX \`IDX_41767ec43b35fe4601a758c667\` ON \`gantt_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_6218b5008d19c7705f420ebca1\` ON \`gantt_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_73733159e5b87a99d67b047c1f\` ON \`gantt_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_bc6eedb8f8aca4081aa70eb719\` ON \`gantt_log\``);    
        await queryRunner.query(`ALTER TABLE \`gantt_log\` DROP COLUMN \`gantt_assignments_id\``);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` DROP COLUMN \`gantt_dependencies_id\``);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` DROP COLUMN \`gantt_id\``);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` DROP COLUMN \`gantt_tasks_id\``);      
        await queryRunner.query(`ALTER TABLE \`gantt_dependencies\` DROP COLUMN \`lag_unit\``);
        await queryRunner.query(`ALTER TABLE \`gantt_dependencies\` ADD \`lag_unit\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gantt_dependencies\` DROP COLUMN \`lag_unit\``);
        await queryRunner.query(`ALTER TABLE \`gantt_dependencies\` ADD \`lag_unit\` enum ('ms', 's', 'm', 'h', 'd', 'w', 'm', 'y') NULL DEFAULT 'd'`);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` ADD \`gantt_tasks_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` ADD \`gantt_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` ADD \`gantt_dependencies_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` ADD \`gantt_assignments_id\` varchar(255) NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_bc6eedb8f8aca4081aa70eb719\` ON \`gantt_log\` (\`gantt_assignments_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_73733159e5b87a99d67b047c1f\` ON \`gantt_log\` (\`gantt_tasks_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_6218b5008d19c7705f420ebca1\` ON \`gantt_log\` (\`gantt_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_41767ec43b35fe4601a758c667\` ON \`gantt_log\` (\`gantt_dependencies_id\`)`);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` ADD CONSTRAINT \`FK_41767ec43b35fe4601a758c6677\` FOREIGN KEY (\`gantt_dependencies_id\`) REFERENCES \`gantt_dependencies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` ADD CONSTRAINT \`FK_bc6eedb8f8aca4081aa70eb7193\` FOREIGN KEY (\`gantt_assignments_id\`) REFERENCES \`gantt_assignments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` ADD CONSTRAINT \`FK_73733159e5b87a99d67b047c1fd\` FOREIGN KEY (\`gantt_tasks_id\`) REFERENCES \`gantt_tasks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` ADD CONSTRAINT \`FK_6218b5008d19c7705f420ebca11\` FOREIGN KEY (\`gantt_id\`) REFERENCES \`gantt\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

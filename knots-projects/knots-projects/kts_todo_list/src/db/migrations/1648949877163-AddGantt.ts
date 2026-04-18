import {MigrationInterface, QueryRunner} from "typeorm";

export class AddGantt1648949877163 implements MigrationInterface {
    name = 'AddGantt1648949877163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`gantt\` (\`id\` varchar(36) NOT NULL, \`project_id\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`start_date\` varchar(45) NOT NULL, \`calendar_id\` varchar(255) NOT NULL, \`hours_per_day\` int NOT NULL DEFAULT '24', \`days_per_week\` int NOT NULL DEFAULT '7', \`days_per_month\` int NOT NULL DEFAULT '30', \`status\` enum ('TODO', 'DONE', 'APPROVED') NOT NULL DEFAULT 'TODO', \`done_at\` date NULL, \`revision\` int NOT NULL DEFAULT '0', \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_by\` int NULL, INDEX \`IDX_c1f91f690cfd575a378ad350f1\` (\`project_id\`), INDEX \`IDX_53a8a9b6411f8ab877d91cf2a5\` (\`created_at\`), INDEX \`IDX_3bbe359d932d65961f26ed58fc\` (\`updated_at\`), INDEX \`IDX_040d758aae18a16545c10740c0\` (\`start_date\`), INDEX \`IDX_ca729dcaff0199488762f60add\` (\`calendar_id\`), INDEX \`IDX_32914390432cdcbb560192bee4\` (\`status\`), INDEX \`IDX_70ac6f899e451ba4df360a51af\` (\`created_by\`), UNIQUE INDEX \`REL_c1f91f690cfd575a378ad350f1\` (\`project_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`gantt_calendar\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NULL, \`parent_id\` varchar(255) NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_0f05dd5efbe43ef79c5fcd9d8b\` (\`parent_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`gantt_calendar_intervals\` (\`id\` varchar(36) NOT NULL, \`calendar_id\` varchar(36) NOT NULL, \`recurrent_start_date\` varchar(255) NULL, \`recurrent_end_date\` varchar(255) NULL, \`is_working\` int NOT NULL DEFAULT '0', \`is_deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_61f1119fe4c82f2304bf7fe49d\` (\`calendar_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`gantt_tasks\` (\`id\` varchar(36) NOT NULL, \`gantt_id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`parent_id\` varchar(255) NULL, \`calendar_id\` varchar(255) NULL, \`name\` varchar(255) NULL, \`start_date\` date NULL, \`end_date\` date NULL, \`effort\` float(11,2) NULL DEFAULT '24.00', \`effort_unit\` enum ('millisecond', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year') NULL DEFAULT 'hour', \`duration\` float(11,2) UNSIGNED NULL, \`duration_unit\` enum ('millisecond', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year') NULL DEFAULT 'day', \`percent_done\` float(11,2) NULL DEFAULT '0.00', \`note\` text NULL, \`constraint_type\` varchar(255) NULL, \`constraint_date\` date NULL, \`manually_scheduled\` tinyint NULL DEFAULT 0, \`scheduling_mode\` enum ('Normal', 'FixedDuration', 'FixedUnits', 'FixedEffort') NOT NULL DEFAULT 'Normal', \`rollup\` tinyint NULL DEFAULT 0, \`dffort_driven\` tinyint NULL DEFAULT 0, \`inactive\` tinyint NULL DEFAULT 0, \`cls\` varchar(255) NULL, \`icon_cls\` varchar(255) NULL, \`color\` varchar(255) NULL, \`parent_index\` int NULL DEFAULT '0', \`expanded\` tinyint NULL DEFAULT 0, \`deadline\` date NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_b105e3fa80998dfe2aeadc7b01\` (\`gantt_id\`), INDEX \`IDX_d341ee4bdb4471cbe738fb394a\` (\`created_at\`), INDEX \`IDX_6f9c8cf8e77b63d1590830d3dd\` (\`updated_at\`), INDEX \`IDX_2ad07274f2def00ad69e94b4d3\` (\`parent_id\`), INDEX \`IDX_03ec157a3b8c0fc1106b1803b7\` (\`calendar_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`gantt_dependencies\` (\`id\` varchar(36) NOT NULL, \`gantt_id\` varchar(36) NOT NULL, \`from_event_id\` varchar(36) NOT NULL, \`to_event_id\` varchar(36) NOT NULL, \`typ\` int NULL DEFAULT '2', \`cls\` varchar(255) NULL, \`lag\` float(11,2) NULL DEFAULT '0.00', \`lag_unit\` enum ('ms', 's', 'm', 'h', 'd', 'w', 'm', 'y') NULL DEFAULT 'd', \`is_deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_e472ceb995dcb62a757a744f94\` (\`gantt_id\`), INDEX \`IDX_d4f45691364aabc65b60c1b24d\` (\`from_event_id\`), INDEX \`IDX_180c4b6b5b7d03446c383872b7\` (\`to_event_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`gantt_assignments\` (\`id\` varchar(36) NOT NULL, \`gantt_id\` varchar(36) NOT NULL, \`event_id\` varchar(36) NOT NULL, \`staff_id\` int NOT NULL, \`units\` int NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_3f86dead7c8d0c66b4215ce038\` (\`gantt_id\`), INDEX \`IDX_4e2fbc1356607c3eb730c992b1\` (\`event_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`gantt_log\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`action\` enum ('CREATE', 'UPDATE', 'DELETE') NOT NULL, \`gantt_id\` varchar(255) NOT NULL, \`gantt_tasks_id\` varchar(255) NULL, \`gantt_dependencies_id\` varchar(255) NULL, \`gantt_assignments_id\` varchar(255) NULL, \`user_id\` int NULL, \`changes\` json NULL, \`request_id\` varchar(255) NOT NULL, \`revision\` int NOT NULL DEFAULT '0', INDEX \`IDX_d35e5d32407bb709f0f2d7e689\` (\`created_at\`), INDEX \`IDX_0be25da783bb49e2533d0fd8d4\` (\`updated_at\`), INDEX \`IDX_6218b5008d19c7705f420ebca1\` (\`gantt_id\`), INDEX \`IDX_73733159e5b87a99d67b047c1f\` (\`gantt_tasks_id\`), INDEX \`IDX_41767ec43b35fe4601a758c667\` (\`gantt_dependencies_id\`), INDEX \`IDX_bc6eedb8f8aca4081aa70eb719\` (\`gantt_assignments_id\`), INDEX \`IDX_502e5cda11da4740523f2e8dce\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`calendar_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`project_info\` ADD \`gantt_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`project_info\` ADD UNIQUE INDEX \`IDX_26170b2994ddbb8e74c4020878\` (\`gantt_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_d0bdc981e72da46510c337bac3\` ON \`staff\` (\`calendar_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_26170b2994ddbb8e74c4020878\` ON \`project_info\` (\`gantt_id\`)`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD CONSTRAINT \`FK_d0bdc981e72da46510c337bac34\` FOREIGN KEY (\`calendar_id\`) REFERENCES \`gantt_calendar\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`project_info\` ADD CONSTRAINT \`FK_26170b2994ddbb8e74c40208786\` FOREIGN KEY (\`gantt_id\`) REFERENCES \`gantt\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gantt\` ADD CONSTRAINT \`FK_c1f91f690cfd575a378ad350f1c\` FOREIGN KEY (\`project_id\`) REFERENCES \`project_info\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`gantt\` ADD CONSTRAINT \`FK_ca729dcaff0199488762f60add3\` FOREIGN KEY (\`calendar_id\`) REFERENCES \`gantt_calendar\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gantt\` ADD CONSTRAINT \`FK_70ac6f899e451ba4df360a51af6\` FOREIGN KEY (\`created_by\`) REFERENCES \`staff\`(\`uid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gantt_calendar\` ADD CONSTRAINT \`FK_0f05dd5efbe43ef79c5fcd9d8b7\` FOREIGN KEY (\`parent_id\`) REFERENCES \`gantt_calendar\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`gantt_calendar_intervals\` ADD CONSTRAINT \`FK_61f1119fe4c82f2304bf7fe49d7\` FOREIGN KEY (\`calendar_id\`) REFERENCES \`gantt_calendar\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`gantt_tasks\` ADD CONSTRAINT \`FK_b105e3fa80998dfe2aeadc7b01f\` FOREIGN KEY (\`gantt_id\`) REFERENCES \`gantt\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`gantt_tasks\` ADD CONSTRAINT \`FK_2ad07274f2def00ad69e94b4d3a\` FOREIGN KEY (\`parent_id\`) REFERENCES \`gantt_tasks\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`gantt_tasks\` ADD CONSTRAINT \`FK_03ec157a3b8c0fc1106b1803b77\` FOREIGN KEY (\`calendar_id\`) REFERENCES \`gantt_calendar\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gantt_dependencies\` ADD CONSTRAINT \`FK_e472ceb995dcb62a757a744f947\` FOREIGN KEY (\`gantt_id\`) REFERENCES \`gantt\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`gantt_dependencies\` ADD CONSTRAINT \`FK_d4f45691364aabc65b60c1b24de\` FOREIGN KEY (\`from_event_id\`) REFERENCES \`gantt_tasks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gantt_dependencies\` ADD CONSTRAINT \`FK_180c4b6b5b7d03446c383872b76\` FOREIGN KEY (\`to_event_id\`) REFERENCES \`gantt_tasks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gantt_assignments\` ADD CONSTRAINT \`FK_3f86dead7c8d0c66b4215ce0383\` FOREIGN KEY (\`gantt_id\`) REFERENCES \`gantt\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`gantt_assignments\` ADD CONSTRAINT \`FK_4e2fbc1356607c3eb730c992b1e\` FOREIGN KEY (\`event_id\`) REFERENCES \`gantt_tasks\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`gantt_assignments\` ADD CONSTRAINT \`FK_d919dad81ba1e63e34bcd12ba3a\` FOREIGN KEY (\`staff_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` ADD CONSTRAINT \`FK_6218b5008d19c7705f420ebca11\` FOREIGN KEY (\`gantt_id\`) REFERENCES \`gantt\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` ADD CONSTRAINT \`FK_73733159e5b87a99d67b047c1fd\` FOREIGN KEY (\`gantt_tasks_id\`) REFERENCES \`gantt_tasks\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` ADD CONSTRAINT \`FK_41767ec43b35fe4601a758c6677\` FOREIGN KEY (\`gantt_dependencies_id\`) REFERENCES \`gantt_dependencies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` ADD CONSTRAINT \`FK_bc6eedb8f8aca4081aa70eb7193\` FOREIGN KEY (\`gantt_assignments_id\`) REFERENCES \`gantt_assignments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` ADD CONSTRAINT \`FK_502e5cda11da4740523f2e8dcef\` FOREIGN KEY (\`user_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`INSERT INTO \`gantt_calendar\` (\`id\`, \`name\`, \`parent_id\`, \`is_deleted\`) VALUES("b0ecdfc4-b8f1-4284-b37f-93b9fbeeee50", "General", DEFAULT, DEFAULT) `);
        await queryRunner.query(`INSERT INTO \`gantt_calendar\` (\`id\`, \`name\`, \`parent_id\`, \`is_deleted\`) VALUES("49d9139c-61f4-4df2-84ca-d39c320c14ca", "Working Days", DEFAULT, DEFAULT) `);
        await queryRunner.query(`INSERT INTO \`gantt_calendar_intervals\` (\`id\`, \`calendar_id\`, \`recurrent_start_date\`, \`recurrent_end_date\`, \`is_working\`, \`is_deleted\`) VALUES("e57ac0d7-094a-40dc-9e75-27f58bb03d82", "49d9139c-61f4-4df2-84ca-d39c320c14ca", "on Sat at 0:00", "on Mon at 0:00", DEFAULT, DEFAULT) `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gantt_log\` DROP FOREIGN KEY \`FK_502e5cda11da4740523f2e8dcef\``);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` DROP FOREIGN KEY \`FK_bc6eedb8f8aca4081aa70eb7193\``);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` DROP FOREIGN KEY \`FK_41767ec43b35fe4601a758c6677\``);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` DROP FOREIGN KEY \`FK_73733159e5b87a99d67b047c1fd\``);
        await queryRunner.query(`ALTER TABLE \`gantt_log\` DROP FOREIGN KEY \`FK_6218b5008d19c7705f420ebca11\``);
        await queryRunner.query(`ALTER TABLE \`gantt_assignments\` DROP FOREIGN KEY \`FK_d919dad81ba1e63e34bcd12ba3a\``);
        await queryRunner.query(`ALTER TABLE \`gantt_assignments\` DROP FOREIGN KEY \`FK_4e2fbc1356607c3eb730c992b1e\``);
        await queryRunner.query(`ALTER TABLE \`gantt_assignments\` DROP FOREIGN KEY \`FK_3f86dead7c8d0c66b4215ce0383\``);
        await queryRunner.query(`ALTER TABLE \`gantt_dependencies\` DROP FOREIGN KEY \`FK_180c4b6b5b7d03446c383872b76\``);
        await queryRunner.query(`ALTER TABLE \`gantt_dependencies\` DROP FOREIGN KEY \`FK_d4f45691364aabc65b60c1b24de\``);
        await queryRunner.query(`ALTER TABLE \`gantt_dependencies\` DROP FOREIGN KEY \`FK_e472ceb995dcb62a757a744f947\``);
        await queryRunner.query(`ALTER TABLE \`gantt_tasks\` DROP FOREIGN KEY \`FK_03ec157a3b8c0fc1106b1803b77\``);
        await queryRunner.query(`ALTER TABLE \`gantt_tasks\` DROP FOREIGN KEY \`FK_2ad07274f2def00ad69e94b4d3a\``);
        await queryRunner.query(`ALTER TABLE \`gantt_tasks\` DROP FOREIGN KEY \`FK_b105e3fa80998dfe2aeadc7b01f\``);
        await queryRunner.query(`ALTER TABLE \`gantt_calendar_intervals\` DROP FOREIGN KEY \`FK_61f1119fe4c82f2304bf7fe49d7\``);
        await queryRunner.query(`ALTER TABLE \`gantt_calendar\` DROP FOREIGN KEY \`FK_0f05dd5efbe43ef79c5fcd9d8b7\``);
        await queryRunner.query(`ALTER TABLE \`gantt\` DROP FOREIGN KEY \`FK_70ac6f899e451ba4df360a51af6\``);
        await queryRunner.query(`ALTER TABLE \`gantt\` DROP FOREIGN KEY \`FK_ca729dcaff0199488762f60add3\``);
        await queryRunner.query(`ALTER TABLE \`gantt\` DROP FOREIGN KEY \`FK_c1f91f690cfd575a378ad350f1c\``);
        await queryRunner.query(`ALTER TABLE \`project_info\` DROP FOREIGN KEY \`FK_26170b2994ddbb8e74c40208786\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP FOREIGN KEY \`FK_d0bdc981e72da46510c337bac34\``);
        await queryRunner.query(`DROP INDEX \`REL_26170b2994ddbb8e74c4020878\` ON \`project_info\``);        
        await queryRunner.query(`DROP INDEX \`IDX_d0bdc981e72da46510c337bac3\` ON \`staff\``);
        await queryRunner.query(`ALTER TABLE \`project_info\` DROP INDEX \`IDX_26170b2994ddbb8e74c4020878\``);
        await queryRunner.query(`ALTER TABLE \`project_info\` DROP COLUMN \`gantt_id\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`calendar_id\``);
        await queryRunner.query(`DROP INDEX \`IDX_502e5cda11da4740523f2e8dce\` ON \`gantt_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_bc6eedb8f8aca4081aa70eb719\` ON \`gantt_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_41767ec43b35fe4601a758c667\` ON \`gantt_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_73733159e5b87a99d67b047c1f\` ON \`gantt_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_6218b5008d19c7705f420ebca1\` ON \`gantt_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_0be25da783bb49e2533d0fd8d4\` ON \`gantt_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_d35e5d32407bb709f0f2d7e689\` ON \`gantt_log\``);
        await queryRunner.query(`DROP TABLE \`gantt_log\``);
        await queryRunner.query(`DROP INDEX \`IDX_4e2fbc1356607c3eb730c992b1\` ON \`gantt_assignments\``);
        await queryRunner.query(`DROP INDEX \`IDX_3f86dead7c8d0c66b4215ce038\` ON \`gantt_assignments\``);
        await queryRunner.query(`DROP TABLE \`gantt_assignments\``);
        await queryRunner.query(`DROP INDEX \`IDX_180c4b6b5b7d03446c383872b7\` ON \`gantt_dependencies\``);
        await queryRunner.query(`DROP INDEX \`IDX_d4f45691364aabc65b60c1b24d\` ON \`gantt_dependencies\``);
        await queryRunner.query(`DROP INDEX \`IDX_e472ceb995dcb62a757a744f94\` ON \`gantt_dependencies\``);
        await queryRunner.query(`DROP TABLE \`gantt_dependencies\``);
        await queryRunner.query(`DROP INDEX \`IDX_03ec157a3b8c0fc1106b1803b7\` ON \`gantt_tasks\``);
        await queryRunner.query(`DROP INDEX \`IDX_2ad07274f2def00ad69e94b4d3\` ON \`gantt_tasks\``);
        await queryRunner.query(`DROP INDEX \`IDX_6f9c8cf8e77b63d1590830d3dd\` ON \`gantt_tasks\``);
        await queryRunner.query(`DROP INDEX \`IDX_d341ee4bdb4471cbe738fb394a\` ON \`gantt_tasks\``);
        await queryRunner.query(`DROP INDEX \`IDX_b105e3fa80998dfe2aeadc7b01\` ON \`gantt_tasks\``);
        await queryRunner.query(`DROP TABLE \`gantt_tasks\``);
        await queryRunner.query(`DROP INDEX \`IDX_61f1119fe4c82f2304bf7fe49d\` ON \`gantt_calendar_intervals\``);
        await queryRunner.query(`DROP TABLE \`gantt_calendar_intervals\``);
        await queryRunner.query(`DROP INDEX \`IDX_0f05dd5efbe43ef79c5fcd9d8b\` ON \`gantt_calendar\``);
        await queryRunner.query(`DROP TABLE \`gantt_calendar\``);
        await queryRunner.query(`DROP INDEX \`REL_c1f91f690cfd575a378ad350f1\` ON \`gantt\``);
        await queryRunner.query(`DROP INDEX \`IDX_70ac6f899e451ba4df360a51af\` ON \`gantt\``);
        await queryRunner.query(`DROP INDEX \`IDX_32914390432cdcbb560192bee4\` ON \`gantt\``);
        await queryRunner.query(`DROP INDEX \`IDX_ca729dcaff0199488762f60add\` ON \`gantt\``);
        await queryRunner.query(`DROP INDEX \`IDX_040d758aae18a16545c10740c0\` ON \`gantt\``);
        await queryRunner.query(`DROP INDEX \`IDX_3bbe359d932d65961f26ed58fc\` ON \`gantt\``);
        await queryRunner.query(`DROP INDEX \`IDX_53a8a9b6411f8ab877d91cf2a5\` ON \`gantt\``);
        await queryRunner.query(`DROP INDEX \`IDX_c1f91f690cfd575a378ad350f1\` ON \`gantt\``);
        await queryRunner.query(`DROP TABLE \`gantt\``);
    }

}

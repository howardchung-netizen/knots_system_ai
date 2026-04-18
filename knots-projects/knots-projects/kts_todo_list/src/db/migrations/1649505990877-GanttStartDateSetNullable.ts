import {MigrationInterface, QueryRunner} from "typeorm";

export class GanttStartDateSetNullable1649505990877 implements MigrationInterface {
    name = 'GanttStartDateSetNullable1649505990877'

    public async up(queryRunner: QueryRunner): Promise<void> {     
        await queryRunner.query(`ALTER TABLE \`gantt\` CHANGE \`start_date\` \`start_date\` varchar(45) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gantt\` CHANGE \`start_date\` \`start_date\` varchar(45) NOT NULL`);
    }
}

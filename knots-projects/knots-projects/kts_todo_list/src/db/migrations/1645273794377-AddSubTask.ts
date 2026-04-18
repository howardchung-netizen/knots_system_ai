import {MigrationInterface, QueryRunner} from "typeorm";

export class AddSubTask1645273794377 implements MigrationInterface {
    name = 'AddSubTask1645273794377'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` ADD \`parent_task_id\` varchar(255) NULL AFTER \`status\``);
        await queryRunner.query(`ALTER TABLE \`task\` ADD CONSTRAINT \`FK_01c122fbf6a1e855a2622957f5f\` FOREIGN KEY (\`parent_task_id\`) REFERENCES \`task\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` DROP FOREIGN KEY \`FK_01c122fbf6a1e855a2622957f5f\``);
        await queryRunner.query(`ALTER TABLE \`task\` DROP COLUMN \`parent_task_id\``);
    }

}

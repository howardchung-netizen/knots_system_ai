import {MigrationInterface, QueryRunner} from "typeorm";

export class AddGanttShare1650209962023 implements MigrationInterface {
    name = 'AddGanttShare1650209962023'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`gantt_share\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`gantt_id\` varchar(36) NOT NULL, \`expired_time\` datetime NOT NULL, \`code\` varchar(255) NOT NULL, \`remark\` varchar(255) NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_a215cb8d289a2586ca85526b00\` (\`created_at\`), INDEX \`IDX_63b83e6a2af6a5eaea1061840e\` (\`gantt_id\`), INDEX \`IDX_734644a92d0e7a491b9b351475\` (\`code\`), INDEX \`IDX_6747a0a3938abebf454e9c3e25\` (\`is_deleted\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`gantt_tasks\` ADD \`style\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`gantt_share\` ADD CONSTRAINT \`FK_63b83e6a2af6a5eaea1061840e3\` FOREIGN KEY (\`gantt_id\`) REFERENCES \`gantt\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gantt_share\` DROP FOREIGN KEY \`FK_63b83e6a2af6a5eaea1061840e3\``);
        await queryRunner.query(`ALTER TABLE \`gantt_tasks\` DROP COLUMN \`style\``);
        await queryRunner.query(`DROP INDEX \`IDX_6747a0a3938abebf454e9c3e25\` ON \`gantt_share\``);
        await queryRunner.query(`DROP INDEX \`IDX_734644a92d0e7a491b9b351475\` ON \`gantt_share\``);
        await queryRunner.query(`DROP INDEX \`IDX_63b83e6a2af6a5eaea1061840e\` ON \`gantt_share\``);
        await queryRunner.query(`DROP INDEX \`IDX_a215cb8d289a2586ca85526b00\` ON \`gantt_share\``);
        await queryRunner.query(`DROP TABLE \`gantt_share\``);
    }

}

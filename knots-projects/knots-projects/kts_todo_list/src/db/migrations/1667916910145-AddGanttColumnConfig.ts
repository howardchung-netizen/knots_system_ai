import {MigrationInterface, QueryRunner} from "typeorm";

export class AddGanttColumnConfig1667916910145 implements MigrationInterface {
    name = 'AddGanttColumnConfig1667916910145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`gantt_column_config\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`staff_id\` int NOT NULL, \`config\` json NULL, INDEX \`IDX_9abc43a63de394958484997c32\` (\`created_at\`), INDEX \`IDX_1760a4d515501ebbf173eade4f\` (\`updated_at\`), INDEX \`IDX_c5ba8cf53b637561b4c20ebf27\` (\`staff_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`gantt_column_config\` ADD CONSTRAINT \`FK_c5ba8cf53b637561b4c20ebf278\` FOREIGN KEY (\`staff_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`gantt_column_config\` DROP FOREIGN KEY \`FK_c5ba8cf53b637561b4c20ebf278\``);
        await queryRunner.query(`DROP INDEX \`IDX_c5ba8cf53b637561b4c20ebf27\` ON \`gantt_column_config\``);
        await queryRunner.query(`DROP INDEX \`IDX_1760a4d515501ebbf173eade4f\` ON \`gantt_column_config\``);
        await queryRunner.query(`DROP INDEX \`IDX_9abc43a63de394958484997c32\` ON \`gantt_column_config\``);
        await queryRunner.query(`DROP TABLE \`gantt_column_config\``);
    }

}

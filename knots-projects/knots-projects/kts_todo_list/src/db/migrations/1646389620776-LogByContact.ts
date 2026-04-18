import {MigrationInterface, QueryRunner} from "typeorm";

export class LogByContact1646389620776 implements MigrationInterface {
    name = 'LogByContact1646389620776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task_log\` ADD \`contact_id\` varchar(255) NULL AFTER \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`task_log\` DROP FOREIGN KEY \`FK_d3064bf11c8316227c4671024a1\``);
        await queryRunner.query(`ALTER TABLE \`task_log\` CHANGE \`user_id\` \`user_id\` int NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_43b70609e73842e610d8e8ab78\` ON \`task_log\` (\`contact_id\`)`);
        await queryRunner.query(`ALTER TABLE \`task_log\` ADD CONSTRAINT \`FK_d3064bf11c8316227c4671024a1\` FOREIGN KEY (\`user_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task_log\` ADD CONSTRAINT \`FK_43b70609e73842e610d8e8ab78b\` FOREIGN KEY (\`contact_id\`) REFERENCES \`contact\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task_log\` DROP FOREIGN KEY \`FK_43b70609e73842e610d8e8ab78b\``);
        await queryRunner.query(`ALTER TABLE \`task_log\` DROP FOREIGN KEY \`FK_d3064bf11c8316227c4671024a1\``);
        await queryRunner.query(`DROP INDEX \`IDX_43b70609e73842e610d8e8ab78\` ON \`task_log\``);
        await queryRunner.query(`ALTER TABLE \`task_log\` CHANGE \`user_id\` \`user_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`task_log\` ADD CONSTRAINT \`FK_d3064bf11c8316227c4671024a1\` FOREIGN KEY (\`user_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task_log\` DROP COLUMN \`contact_id\``);
    }

}

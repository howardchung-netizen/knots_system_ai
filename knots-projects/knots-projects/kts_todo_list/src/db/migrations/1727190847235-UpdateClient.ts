import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateClient1727190847235 implements MigrationInterface {
    name = 'UpdateClient1727190847235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`client\` ADD \`prefix\` varchar(5) NULL AFTER \`uuid\``);
        await queryRunner.query(`CREATE INDEX \`IDX_08a39cc1e2524d0768aeeb28af\` ON \`client\` (\`prefix\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_08a39cc1e2524d0768aeeb28af\` ON \`client\``);
        await queryRunner.query(`ALTER TABLE \`client\` DROP COLUMN \`prefix\``);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateFirebaseDeviceID1647175935750 implements MigrationInterface {
    name = 'UpdateFirebaseDeviceID1647175935750'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`device_id\` longtext NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`device_id\``);
    }

}

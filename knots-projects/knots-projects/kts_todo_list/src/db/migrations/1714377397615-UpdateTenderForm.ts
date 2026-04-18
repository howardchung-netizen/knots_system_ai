import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateTenderForm1714377397615 implements MigrationInterface {
    name = 'UpdateTenderForm1714377397615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tender_form\` DROP FOREIGN KEY \`FK_9236ba1b783a43f735705d1dca2\``);
        await queryRunner.query(`DROP INDEX \`IDX_9236ba1b783a43f735705d1dca\` ON \`tender_form\``);
        await queryRunner.query(`ALTER TABLE \`tender_form\` DROP COLUMN \`client_id\``);
        await queryRunner.query(`ALTER TABLE \`tender_form\` ADD \`client\` varchar(255) NOT NULL AFTER \`received_date\``);
        await queryRunner.query(`ALTER TABLE \`tender_form\` CHANGE \`person_in_charge_id\` \`person_in_charge_id\` int NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_ee0e5061955f1142199ad3d718\` ON \`tender_form\` (\`client\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_ee0e5061955f1142199ad3d718\` ON \`tender_form\``);
        await queryRunner.query(`ALTER TABLE \`tender_form\` CHANGE \`person_in_charge_id\` \`person_in_charge_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tender_form\` DROP COLUMN \`client\``);
        await queryRunner.query(`ALTER TABLE \`tender_form\` ADD \`client_id\` int NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_9236ba1b783a43f735705d1dca\` ON \`tender_form\` (\`client_id\`)`);
        await queryRunner.query(`ALTER TABLE \`tender_form\` ADD CONSTRAINT \`FK_9236ba1b783a43f735705d1dca2\` FOREIGN KEY (\`client_id\`) REFERENCES \`client\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

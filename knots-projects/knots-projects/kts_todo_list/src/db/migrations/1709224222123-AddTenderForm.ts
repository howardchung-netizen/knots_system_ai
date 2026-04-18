import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTenderForm1709224222123 implements MigrationInterface {
    name = 'AddTenderForm1709224222123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`tender_form\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`received_date\` date NOT NULL, \`client_id\` int NOT NULL, \`tender_no\` varchar(255) NULL, \`site_visit_time\` datetime NULL, \`deadline_time\` datetime NOT NULL, \`submit_method\` varchar(255) NOT NULL, \`details\` text NOT NULL, \`person_in_charge_id\` int NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_cc4231cc6b8ca08f394816b756\` (\`created_at\`), INDEX \`IDX_1da13ea28235d961d0f7c4ce0d\` (\`updated_at\`), INDEX \`IDX_1d528f534c1ca102a6c18ddc1f\` (\`received_date\`), INDEX \`IDX_9236ba1b783a43f735705d1dca\` (\`client_id\`), INDEX \`IDX_fae8424b2c90288e154c7a2759\` (\`tender_no\`), INDEX \`IDX_1797823986685e64f4a8905ffa\` (\`site_visit_time\`), INDEX \`IDX_1aff5a8be412acf6f9f0057571\` (\`deadline_time\`), INDEX \`IDX_0cdbb422cf987bf671a7e105a8\` (\`submit_method\`), INDEX \`IDX_439b1eb06dbfe19c1da68e8b08\` (\`person_in_charge_id\`), INDEX \`IDX_dca0b0619d5faada8673a1ef97\` (\`is_deleted\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`tender_form\` ADD CONSTRAINT \`FK_9236ba1b783a43f735705d1dca2\` FOREIGN KEY (\`client_id\`) REFERENCES \`client\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tender_form\` ADD CONSTRAINT \`FK_439b1eb06dbfe19c1da68e8b085\` FOREIGN KEY (\`person_in_charge_id\`) REFERENCES \`staff\`(\`uid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tender_form\` DROP FOREIGN KEY \`FK_439b1eb06dbfe19c1da68e8b085\``);
        await queryRunner.query(`ALTER TABLE \`tender_form\` DROP FOREIGN KEY \`FK_9236ba1b783a43f735705d1dca2\``);
        await queryRunner.query(`DROP INDEX \`IDX_dca0b0619d5faada8673a1ef97\` ON \`tender_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_439b1eb06dbfe19c1da68e8b08\` ON \`tender_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_0cdbb422cf987bf671a7e105a8\` ON \`tender_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_1aff5a8be412acf6f9f0057571\` ON \`tender_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_1797823986685e64f4a8905ffa\` ON \`tender_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_fae8424b2c90288e154c7a2759\` ON \`tender_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_9236ba1b783a43f735705d1dca\` ON \`tender_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_1d528f534c1ca102a6c18ddc1f\` ON \`tender_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_1da13ea28235d961d0f7c4ce0d\` ON \`tender_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_cc4231cc6b8ca08f394816b756\` ON \`tender_form\``);
        await queryRunner.query(`DROP TABLE \`tender_form\``);
    }

}

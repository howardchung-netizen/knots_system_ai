import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateUserEntityAndContactFile1708952514825 implements MigrationInterface {
    name = 'UpdateUserEntityAndContactFile1708952514825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`contact_file\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`file_path\` varchar(255) NULL, \`file_mime_type\` varchar(255) NULL, \`contact_id\` int NOT NULL, \`deleted\` tinyint NOT NULL, INDEX \`IDX_37314fd95b200b27c86a58da77\` (\`created_at\`), INDEX \`IDX_5170d36c5ab21114fbde862465\` (\`updated_at\`), INDEX \`IDX_86cfec8e8cca0329ef50211d13\` (\`contact_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD \`color\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`contact_file\` ADD CONSTRAINT \`FK_86cfec8e8cca0329ef50211d134\` FOREIGN KEY (\`contact_id\`) REFERENCES \`client_contacts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`contact_file\` DROP FOREIGN KEY \`FK_86cfec8e8cca0329ef50211d134\``);
        await queryRunner.query(`ALTER TABLE \`staff\` DROP COLUMN \`color\``);
        await queryRunner.query(`DROP INDEX \`IDX_86cfec8e8cca0329ef50211d13\` ON \`contact_file\``);
        await queryRunner.query(`DROP INDEX \`IDX_5170d36c5ab21114fbde862465\` ON \`contact_file\``);
        await queryRunner.query(`DROP INDEX \`IDX_37314fd95b200b27c86a58da77\` ON \`contact_file\``);
        await queryRunner.query(`DROP TABLE \`contact_file\``);
    }

}

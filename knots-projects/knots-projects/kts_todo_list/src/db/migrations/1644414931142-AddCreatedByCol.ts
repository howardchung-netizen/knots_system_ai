import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCreatedByCol1644414931142 implements MigrationInterface {
    name = 'AddCreatedByCol1644414931142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` ADD \`created_by\` int NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_7126a406a07736826b7988ae20\` ON \`task\` (\`created_by\`)`);
        await queryRunner.query(`ALTER TABLE \`task\` ADD CONSTRAINT \`FK_7126a406a07736826b7988ae207\` FOREIGN KEY (\`created_by\`) REFERENCES \`staff\`(\`uid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` DROP FOREIGN KEY \`FK_7126a406a07736826b7988ae207\``);
        await queryRunner.query(`DROP INDEX \`IDX_7126a406a07736826b7988ae20\` ON \`task\``);
        await queryRunner.query(`ALTER TABLE \`task\` DROP COLUMN \`created_by\``);
    }

}

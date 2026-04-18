import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateLogWhatsAppSent1645355831966 implements MigrationInterface {
    name = 'UpdateLogWhatsAppSent1645355831966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task_log\` ADD \`whatsAppStatus\` enum ('NA', 'PENDING', 'SENT') NOT NULL DEFAULT 'NA'`);
        await queryRunner.query(`CREATE INDEX \`IDX_4e44e334223b6660fa565a63ef\` ON \`task_log\` (\`whatsAppStatus\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_4e44e334223b6660fa565a63ef\` ON \`task_log\``);
        await queryRunner.query(`ALTER TABLE \`task_log\` DROP COLUMN \`whatsAppStatus\``);
    }

}

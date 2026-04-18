import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateUserNoticationToken1682102341084 implements MigrationInterface {
    name = 'UpdateUserNoticationToken1682102341084'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_807ebc53460ef2978a1972299e\` ON \`user_notification_token\` (\`user_id\`, \`token\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_807ebc53460ef2978a1972299e\` ON \`user_notification_token\``);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTerms1689001078204 implements MigrationInterface {
    name = 'AddTerms1689001078204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_c19b6b44a59836333e5843dfb1\` ON \`terms\` (\`name_cht\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_7a94d5196a3767029f6f055872\` ON \`terms\` (\`name_en\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_404c37a21b5a027116195d843f\` ON \`terms\` (\`sort\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_71dc1b3186a391caba56ad2775\` ON \`terms\` (\`preset\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_4a06eec4253aba9144c095280c\` ON \`terms\` (\`show\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_ae03e4667459b9a68cbbd3a67a\` ON \`terms\` (\`deleted\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_13a7d418367509342e0ed9cad8\` ON \`terms\` (\`createAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_f14ce589ec8b1b84824656007f\` ON \`terms\` (\`editAt\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_f14ce589ec8b1b84824656007f\` ON \`terms\``);
        await queryRunner.query(`DROP INDEX \`IDX_13a7d418367509342e0ed9cad8\` ON \`terms\``);
        await queryRunner.query(`DROP INDEX \`IDX_ae03e4667459b9a68cbbd3a67a\` ON \`terms\``);
        await queryRunner.query(`DROP INDEX \`IDX_4a06eec4253aba9144c095280c\` ON \`terms\``);
        await queryRunner.query(`DROP INDEX \`IDX_71dc1b3186a391caba56ad2775\` ON \`terms\``);
        await queryRunner.query(`DROP INDEX \`IDX_404c37a21b5a027116195d843f\` ON \`terms\``);
        await queryRunner.query(`DROP INDEX \`IDX_7a94d5196a3767029f6f055872\` ON \`terms\``);
        await queryRunner.query(`DROP INDEX \`IDX_c19b6b44a59836333e5843dfb1\` ON \`terms\``);
    }

}

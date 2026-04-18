import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateCurrency1693082402839 implements MigrationInterface {
    name = 'UpdateCurrency1693082402839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_723472e41cae44beb0763f4039\` ON \`currency\` (\`code\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_0f94dcf68f183b51de8ca6849f\` ON \`currency\` (\`sort\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_178bea0600240e41509d2bba66\` ON \`currency\` (\`show\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_084e8df1df974426e11399ad07\` ON \`currency\` (\`deleted\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_91368874c80efe9a57059e2480\` ON \`currency\` (\`createAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_134013a11f98e38f14d5040081\` ON \`currency\` (\`editAt\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_134013a11f98e38f14d5040081\` ON \`currency\``);
        await queryRunner.query(`DROP INDEX \`IDX_91368874c80efe9a57059e2480\` ON \`currency\``);
        await queryRunner.query(`DROP INDEX \`IDX_084e8df1df974426e11399ad07\` ON \`currency\``);
        await queryRunner.query(`DROP INDEX \`IDX_178bea0600240e41509d2bba66\` ON \`currency\``);
        await queryRunner.query(`DROP INDEX \`IDX_0f94dcf68f183b51de8ca6849f\` ON \`currency\``);
        await queryRunner.query(`DROP INDEX \`IDX_723472e41cae44beb0763f4039\` ON \`currency\``);
    }

}

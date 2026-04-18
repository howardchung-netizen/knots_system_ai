import {MigrationInterface, QueryRunner} from "typeorm";

export class AddQuotationTemplate1689163960758 implements MigrationInterface {
    name = 'AddQuotationTemplate1689163960758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`template_info\` CHANGE \`uuid\` \`uuid\` varchar(255) NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_906c54b51e608e0705e79144d2\` ON \`template_info\` (\`uuid\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_ed43f4211730f838a2f770c82a\` ON \`template_info\` (\`code\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_cb1ae8f37e129c8856091dccd6\` ON \`template_info\` (\`name\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_0fdb84f31131638c934dd13a24\` ON \`template_info\` (\`show\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2d62893b75e608e6242074951c\` ON \`template_info\` (\`delete\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_2d62893b75e608e6242074951c\` ON \`template_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_0fdb84f31131638c934dd13a24\` ON \`template_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_cb1ae8f37e129c8856091dccd6\` ON \`template_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_ed43f4211730f838a2f770c82a\` ON \`template_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_906c54b51e608e0705e79144d2\` ON \`template_info\``);
    }

}

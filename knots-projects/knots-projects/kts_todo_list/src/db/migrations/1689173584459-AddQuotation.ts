import {MigrationInterface, QueryRunner} from "typeorm";

export class AddQuotation1689173584459 implements MigrationInterface {
    name = 'AddQuotation1689173584459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_1a85ec615fe31e2a6e6d86a3f3\` ON \`quotation_info\` (\`code\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_4a052ddf7031b867f33b3147df\` ON \`quotation_info\` (\`project_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_cdbdfc8902b8f4d51ab686bc71\` ON \`quotation_info\` (\`quote_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_0ce8a6f87518125f1ee50fde27\` ON \`quotation_info\` (\`status\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b4850fb624aa161e99f5fe2aef\` ON \`quotation_info\` (\`title\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_91196641d8f6f652990b5b1a61\` ON \`quotation_info\` (\`progress\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2c93c9185cd02004ef96a8a8eb\` ON \`quotation_info\` (\`client_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_210bd05d35a3424b142a9019f8\` ON \`quotation_info\` (\`main_contacts_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_3b71849a6bda283f1f2656646f\` ON \`quotation_info\` (\`date\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_a255929c7fd1813634e1f41b36\` ON \`quotation_info\` (\`currency_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_bbfdf9bc8cd0a4633ea542ff1a\` ON \`quotation_info\` (\`currency\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_31d3d73074da0a8700d237f494\` ON \`quotation_info\` (\`totalAmount\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_8e628ef571d266315ef09f79cb\` ON \`quotation_info\` (\`deleted\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_a00d38d40b12e9f3c670158d52\` ON \`quotation_info\` (\`createAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_d1140dcb4d48b01be4ebc25e3a\` ON \`quotation_info\` (\`editAt\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_d1140dcb4d48b01be4ebc25e3a\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_a00d38d40b12e9f3c670158d52\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_8e628ef571d266315ef09f79cb\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_31d3d73074da0a8700d237f494\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_bbfdf9bc8cd0a4633ea542ff1a\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_a255929c7fd1813634e1f41b36\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_3b71849a6bda283f1f2656646f\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_210bd05d35a3424b142a9019f8\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_2c93c9185cd02004ef96a8a8eb\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_91196641d8f6f652990b5b1a61\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_b4850fb624aa161e99f5fe2aef\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_0ce8a6f87518125f1ee50fde27\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_cdbdfc8902b8f4d51ab686bc71\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_4a052ddf7031b867f33b3147df\` ON \`quotation_info\``);
        await queryRunner.query(`DROP INDEX \`IDX_1a85ec615fe31e2a6e6d86a3f3\` ON \`quotation_info\``);
    }

}

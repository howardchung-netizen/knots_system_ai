import {MigrationInterface, QueryRunner} from "typeorm";

export class AddQuotationStatus1689149616554 implements MigrationInterface {
    name = 'AddQuotationStatus1689149616554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_5e0bf9fcf8f69544f4ec485cbb\` ON \`quotation_status\` (\`code\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_d22d2235f56af67ed5f064a0c3\` ON \`quotation_status\` (\`name_cht\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_65f7b0b131b374f5117b3f0aa9\` ON \`quotation_status\` (\`name_en\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_4df4ec5fd674fe9b3a1a9465b8\` ON \`quotation_status\` (\`sort\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_8fd19170c3b3c958a23701b917\` ON \`quotation_status\` (\`show\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_279d3fdfc9ae386ffd065e20fe\` ON \`quotation_status\` (\`deleted\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b256ec996ad4546d227fc0ac15\` ON \`quotation_status\` (\`createAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b718f6e190d3cc80fdf16823a0\` ON \`quotation_status\` (\`editAt\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_b718f6e190d3cc80fdf16823a0\` ON \`quotation_status\``);
        await queryRunner.query(`DROP INDEX \`IDX_b256ec996ad4546d227fc0ac15\` ON \`quotation_status\``);
        await queryRunner.query(`DROP INDEX \`IDX_279d3fdfc9ae386ffd065e20fe\` ON \`quotation_status\``);
        await queryRunner.query(`DROP INDEX \`IDX_8fd19170c3b3c958a23701b917\` ON \`quotation_status\``);
        await queryRunner.query(`DROP INDEX \`IDX_4df4ec5fd674fe9b3a1a9465b8\` ON \`quotation_status\``);
        await queryRunner.query(`DROP INDEX \`IDX_65f7b0b131b374f5117b3f0aa9\` ON \`quotation_status\``);
        await queryRunner.query(`DROP INDEX \`IDX_d22d2235f56af67ed5f064a0c3\` ON \`quotation_status\``);
        await queryRunner.query(`DROP INDEX \`IDX_5e0bf9fcf8f69544f4ec485cbb\` ON \`quotation_status\``);
    }

}

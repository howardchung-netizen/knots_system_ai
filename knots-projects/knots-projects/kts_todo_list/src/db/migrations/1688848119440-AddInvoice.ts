import {MigrationInterface, QueryRunner} from "typeorm";

export class AddInvoice1688848119440 implements MigrationInterface {
    name = 'AddInvoice1688848119440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`date\` \`date\` varchar(256) NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`financial_year\` \`financial_year\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`year_case\` \`year_case\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`inv_id\` \`inv_id\` varchar(256) NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`status\` \`status\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`sent\` \`sent\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`quotation_no\` \`quotation_no\` varchar(256) NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`project_id\` \`project_id\` varchar(256) NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`project\` \`project\` varchar(256) NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`balance\` \`balance\` float NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`paid\` \`paid\` varchar(256) NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`submit_form\` \`submit_form\` varchar(256) NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`signed_form\` \`signed_form\` varchar(256) NULL`);
        await queryRunner.query(`ALTER TABLE \`invoice\` CHANGE \`deleted\` \`deleted\` tinyint NULL DEFAULT 0`);
        await queryRunner.query(`CREATE INDEX \`IDX_c0000d830798df6eee208fafda\` ON \`invoice\` (\`date\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b8be35d9924f22769a36fd8a3a\` ON \`invoice\` (\`financial_year\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_6cb2da4b84c09011a722e7fa0e\` ON \`invoice\` (\`year_case\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_d3b4fe633a4548304b1d3e3cfd\` ON \`invoice\` (\`inv_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b14e893339e619f51db7d6692f\` ON \`invoice\` (\`status\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_fdaeba8087f8979818c5fa43c1\` ON \`invoice\` (\`sent\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_56f52a3458e134b6183195ba0f\` ON \`invoice\` (\`quotation_no\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_d89d99227ac6231810a2153699\` ON \`invoice\` (\`project_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_d46a49ecd106329e890038fed4\` ON \`invoice\` (\`project\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2ff0b66c56c106ef51c54873e8\` ON \`invoice\` (\`paid\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_3261afdb8c1ebd76179c344773\` ON \`invoice\` (\`submit_form\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_aa12666166e1193fc768d662e4\` ON \`invoice\` (\`signed_form\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_bf81c5cc5d07f57fcaa9f94fe4\` ON \`invoice\` (\`createAt\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_bf81c5cc5d07f57fcaa9f94fe4\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_aa12666166e1193fc768d662e4\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_3261afdb8c1ebd76179c344773\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_2ff0b66c56c106ef51c54873e8\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_d46a49ecd106329e890038fed4\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_d89d99227ac6231810a2153699\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_56f52a3458e134b6183195ba0f\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_fdaeba8087f8979818c5fa43c1\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_b14e893339e619f51db7d6692f\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_d3b4fe633a4548304b1d3e3cfd\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_6cb2da4b84c09011a722e7fa0e\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_b8be35d9924f22769a36fd8a3a\` ON \`invoice\``);
        await queryRunner.query(`DROP INDEX \`IDX_c0000d830798df6eee208fafda\` ON \`invoice\``);
    }

}

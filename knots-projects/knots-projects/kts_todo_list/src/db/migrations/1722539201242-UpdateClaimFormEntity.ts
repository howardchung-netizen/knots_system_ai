import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateClaimFormEntity1722539201242 implements MigrationInterface {
    name = 'UpdateClaimFormEntity1722539201242'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`claim_form\` ADD \`project_id\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`claim_form\` ADD \`project_order_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`claim_form\` ADD UNIQUE INDEX \`IDX_5e1810bfe9f25a38a0e850e570\` (\`project_order_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_9acade98f67bf42cb351cb29d3\` ON \`claim_form\` (\`project_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_5e1810bfe9f25a38a0e850e570\` ON \`claim_form\` (\`project_order_id\`)`);
        await queryRunner.query(`ALTER TABLE \`claim_form\` ADD CONSTRAINT \`FK_26533266de147b45760b99ce8cc\` FOREIGN KEY (\`transaction_id\`) REFERENCES \`book_keeping_transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`claim_form\` ADD CONSTRAINT \`FK_5e1810bfe9f25a38a0e850e5703\` FOREIGN KEY (\`project_order_id\`) REFERENCES \`order_form\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`claim_form\` DROP FOREIGN KEY \`FK_5e1810bfe9f25a38a0e850e5703\``);
        await queryRunner.query(`ALTER TABLE \`claim_form\` DROP FOREIGN KEY \`FK_26533266de147b45760b99ce8cc\``);
        await queryRunner.query(`DROP INDEX \`REL_5e1810bfe9f25a38a0e850e570\` ON \`claim_form\``);
        await queryRunner.query(`ALTER TABLE \`claim_form\` DROP INDEX \`IDX_5e1810bfe9f25a38a0e850e570\``);
        await queryRunner.query(`ALTER TABLE \`claim_form\` DROP COLUMN \`project_order_id\``);
        await queryRunner.query(`ALTER TABLE \`claim_form\` DROP COLUMN \`project_id\``);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateCompanyIdNullable1720719832671 implements MigrationInterface {
    name = 'UpdateCompanyIdNullable1720719832671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book_keeping_account\` CHANGE \`company_id\` \`company_id\` varchar(36) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book_keeping_account\` CHANGE \`company_id\` \`company_id\` varchar(36) NOT NULL`);
    }

}

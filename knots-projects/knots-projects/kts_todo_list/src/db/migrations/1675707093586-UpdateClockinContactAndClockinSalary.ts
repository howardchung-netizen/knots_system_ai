import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateClockinContactAndClockinSalary1675707093586 implements MigrationInterface {
    name = 'UpdateClockinContactAndClockinSalary1675707093586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`clock_in_contact\` ADD \`nameEng\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clock_in_contact\` ADD \`address\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clock_in\` ADD \`clock_in_salary\` decimal(10,2) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`clock_in\` DROP COLUMN \`clock_in_salary\``);
        await queryRunner.query(`ALTER TABLE \`clock_in_contact\` DROP COLUMN \`address\``);
        await queryRunner.query(`ALTER TABLE \`clock_in_contact\` DROP COLUMN \`nameEng\``);
    }

}

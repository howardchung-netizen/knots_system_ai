import {MigrationInterface, QueryRunner} from "typeorm";

export class AddChequeBookAllocate1694707369073 implements MigrationInterface {
    name = 'AddChequeBookAllocate1694707369073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`cheque_book_allocate\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`cheque_book_id\` int NOT NULL, \`project\` varchar(255) NOT NULL, \`project_id\` varchar(255) NOT NULL, \`amount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`desc\` varchar(255) NULL, \`deleted\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_800960b503f746e3869199e74c\` (\`created_at\`), INDEX \`IDX_8181031781749d450086b68dfe\` (\`updated_at\`), INDEX \`IDX_1605b991e7706b07d57c529cef\` (\`cheque_book_id\`), INDEX \`IDX_39aab22804194917ac9d61e949\` (\`project_id\`), INDEX \`IDX_db1826d7a6cf675cba0aeb586b\` (\`deleted\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`cheque_book_allocate\` ADD CONSTRAINT \`FK_1605b991e7706b07d57c529cefd\` FOREIGN KEY (\`cheque_book_id\`) REFERENCES \`cheque_book\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cheque_book_allocate\` DROP FOREIGN KEY \`FK_1605b991e7706b07d57c529cefd\``);
        await queryRunner.query(`DROP INDEX \`IDX_db1826d7a6cf675cba0aeb586b\` ON \`cheque_book_allocate\``);
        await queryRunner.query(`DROP INDEX \`IDX_39aab22804194917ac9d61e949\` ON \`cheque_book_allocate\``);
        await queryRunner.query(`DROP INDEX \`IDX_1605b991e7706b07d57c529cef\` ON \`cheque_book_allocate\``);
        await queryRunner.query(`DROP INDEX \`IDX_8181031781749d450086b68dfe\` ON \`cheque_book_allocate\``);
        await queryRunner.query(`DROP INDEX \`IDX_800960b503f746e3869199e74c\` ON \`cheque_book_allocate\``);
        await queryRunner.query(`DROP TABLE \`cheque_book_allocate\``);
    }

}

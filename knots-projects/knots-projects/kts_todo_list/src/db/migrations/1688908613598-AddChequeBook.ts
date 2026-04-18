import {MigrationInterface, QueryRunner} from "typeorm";

export class AddChequeBook1688908613598 implements MigrationInterface {
    name = 'AddChequeBook1688908613598'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cheque_book\` CHANGE \`date\` \`date\` varchar(10) NULL`);
        await queryRunner.query(`ALTER TABLE \`cheque_book\` CHANGE \`receiver\` \`receiver\` varchar(256) NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_44b62b2b82f86c31906fc5746e\` ON \`cheque_book\` (\`cheque_no\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_ba5a91334163cd1214a7134a0e\` ON \`cheque_book\` (\`status\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_23d12db28f4b07ac7d83ba88f8\` ON \`cheque_book\` (\`confirm\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_04f89b646a0db3f860d7e2ca8c\` ON \`cheque_book\` (\`date\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_7d2c025f034d9794d2933aac32\` ON \`cheque_book\` (\`receiver\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_31874b5727d9adc8f3fea77fad\` ON \`cheque_book\` (\`amount\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_ff62f55efa732b1190c3745801\` ON \`cheque_book\` (\`createAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_cbcec984387d73caba9a242f7b\` ON \`cheque_book\` (\`editAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_d1f24730ad13900b31daa285d7\` ON \`cheque_book\` (\`cancel\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b5cae2b1ae5b6e55b7165e44f3\` ON \`cheque_book\` (\`deleted\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_b5cae2b1ae5b6e55b7165e44f3\` ON \`cheque_book\``);
        await queryRunner.query(`DROP INDEX \`IDX_d1f24730ad13900b31daa285d7\` ON \`cheque_book\``);
        await queryRunner.query(`DROP INDEX \`IDX_cbcec984387d73caba9a242f7b\` ON \`cheque_book\``);
        await queryRunner.query(`DROP INDEX \`IDX_ff62f55efa732b1190c3745801\` ON \`cheque_book\``);
        await queryRunner.query(`DROP INDEX \`IDX_31874b5727d9adc8f3fea77fad\` ON \`cheque_book\``);
        await queryRunner.query(`DROP INDEX \`IDX_7d2c025f034d9794d2933aac32\` ON \`cheque_book\``);
        await queryRunner.query(`DROP INDEX \`IDX_04f89b646a0db3f860d7e2ca8c\` ON \`cheque_book\``);
        await queryRunner.query(`DROP INDEX \`IDX_23d12db28f4b07ac7d83ba88f8\` ON \`cheque_book\``);
        await queryRunner.query(`DROP INDEX \`IDX_ba5a91334163cd1214a7134a0e\` ON \`cheque_book\``);
        await queryRunner.query(`DROP INDEX \`IDX_44b62b2b82f86c31906fc5746e\` ON \`cheque_book\``);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateClient1688468963779 implements MigrationInterface {
    name = 'UpdateClient1688468963779'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_4e5991a9acfe4c5c49d903e130\` ON \`client_contacts\` (\`uuid\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_4244c0011d7a46eb9c51dfc781\` ON \`client_contacts\` (\`appellation\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_ef5ee2331e26bbba6a66048838\` ON \`client_contacts\` (\`name_cht\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2df4712604470e317cdc338226\` ON \`client_contacts\` (\`name_en\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_8fab1b66b48db678e6602d3517\` ON \`client_contacts\` (\`email\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_939f4c711b88c9ef45a2b6c781\` ON \`client_contacts\` (\`tel\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_f545980355c76c109f747b25df\` ON \`client_contacts\` (\`whatsapp\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_613cf99d2cd30f3109a1aae20b\` ON \`client_contacts\` (\`wechat\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_00201b3c4d6d2fdd610024c616\` ON \`client_contacts\` (\`createAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_32b4c3bded7c72c046f372ccac\` ON \`client_contacts\` (\`editAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2f8b69d1226e4a6b3774b53fd2\` ON \`client_contacts\` (\`deleted\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_1877f4f250c9271781a8eb70f9\` ON \`client\` (\`uuid\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_e2ee82af46c15387a7cdda942d\` ON \`client\` (\`company_cht\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_65eed5e27b0b62b93685cbd93a\` ON \`client\` (\`company_en\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_6436cc6b79593760b9ef921ef1\` ON \`client\` (\`email\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2bd89ee79c1d3705c56cfef7e9\` ON \`client\` (\`tel\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_d35dcba0a1f50d3112dace6b83\` ON \`client\` (\`whatsapp\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_f0210fd5b329a299ef3ac814da\` ON \`client\` (\`wechat\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_3ebe34643a97703ee9f5baf3c0\` ON \`client\` (\`createAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_1076f8f5f4178f3960d41deb83\` ON \`client\` (\`editAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_e3bf0bd64ad3b1ee8bddcbafe0\` ON \`client\` (\`deleted\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_e3bf0bd64ad3b1ee8bddcbafe0\` ON \`client\``);
        await queryRunner.query(`DROP INDEX \`IDX_1076f8f5f4178f3960d41deb83\` ON \`client\``);
        await queryRunner.query(`DROP INDEX \`IDX_3ebe34643a97703ee9f5baf3c0\` ON \`client\``);
        await queryRunner.query(`DROP INDEX \`IDX_f0210fd5b329a299ef3ac814da\` ON \`client\``);
        await queryRunner.query(`DROP INDEX \`IDX_d35dcba0a1f50d3112dace6b83\` ON \`client\``);
        await queryRunner.query(`DROP INDEX \`IDX_2bd89ee79c1d3705c56cfef7e9\` ON \`client\``);
        await queryRunner.query(`DROP INDEX \`IDX_6436cc6b79593760b9ef921ef1\` ON \`client\``);
        await queryRunner.query(`DROP INDEX \`IDX_65eed5e27b0b62b93685cbd93a\` ON \`client\``);
        await queryRunner.query(`DROP INDEX \`IDX_e2ee82af46c15387a7cdda942d\` ON \`client\``);
        await queryRunner.query(`DROP INDEX \`IDX_1877f4f250c9271781a8eb70f9\` ON \`client\``);
        await queryRunner.query(`DROP INDEX \`IDX_2f8b69d1226e4a6b3774b53fd2\` ON \`client_contacts\``);
        await queryRunner.query(`DROP INDEX \`IDX_32b4c3bded7c72c046f372ccac\` ON \`client_contacts\``);
        await queryRunner.query(`DROP INDEX \`IDX_00201b3c4d6d2fdd610024c616\` ON \`client_contacts\``);
        await queryRunner.query(`DROP INDEX \`IDX_613cf99d2cd30f3109a1aae20b\` ON \`client_contacts\``);
        await queryRunner.query(`DROP INDEX \`IDX_f545980355c76c109f747b25df\` ON \`client_contacts\``);
        await queryRunner.query(`DROP INDEX \`IDX_939f4c711b88c9ef45a2b6c781\` ON \`client_contacts\``);
        await queryRunner.query(`DROP INDEX \`IDX_8fab1b66b48db678e6602d3517\` ON \`client_contacts\``);
        await queryRunner.query(`DROP INDEX \`IDX_2df4712604470e317cdc338226\` ON \`client_contacts\``);
        await queryRunner.query(`DROP INDEX \`IDX_ef5ee2331e26bbba6a66048838\` ON \`client_contacts\``);
        await queryRunner.query(`DROP INDEX \`IDX_4244c0011d7a46eb9c51dfc781\` ON \`client_contacts\``);
        await queryRunner.query(`DROP INDEX \`IDX_4e5991a9acfe4c5c49d903e130\` ON \`client_contacts\``);
    }

}

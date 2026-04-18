import {MigrationInterface, QueryRunner} from "typeorm";

export class AddHastagProjectType1688755226297 implements MigrationInterface {
    name = 'AddHastagProjectType1688755226297'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_ed1306f5957d31a32c0548dcde\` ON \`hashtag\` (\`name_en\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_57c8788340aacedfbf357001b3\` ON \`hashtag\` (\`name_cht\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_032d4ceb136efc5756168e8c9b\` ON \`hashtag\` (\`preset\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_583cf0085e41d9c8d590580f20\` ON \`hashtag\` (\`show\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_0f76d95364edd24f039114dce3\` ON \`hashtag\` (\`sort\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_33ef93fb58aa11f92fe90b0aa4\` ON \`hashtag\` (\`createAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_1dcd7def7b00962e9842190de9\` ON \`hashtag\` (\`editAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_44a67f9c1663b52036d51ab867\` ON \`hashtag\` (\`deleted\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_51adb01a08f3dccecc34c98ba4\` ON \`hashtag\` (\`deleteAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_a2a57a982e469ae425150b858a\` ON \`project_type\` (\`code\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_622fb00e1824c3b372504e1f38\` ON \`project_type\` (\`name_cht\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_da66886ba1b88c1c395afc68e9\` ON \`project_type\` (\`name_en\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_f8b8f63479e5ddcd5467847052\` ON \`project_type\` (\`sort\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_67fd270a21c5fb4d59e8e5f5a4\` ON \`project_type\` (\`hash\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_536d6c9a5300a6e00c41878fe1\` ON \`project_type\` (\`show\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2b84df4a26caa40b15e04c6252\` ON \`project_type\` (\`deleted\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_dcd0c090ae5e30b64df13ad04b\` ON \`project_type\` (\`createAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_08d79d62ebed2047b04d370689\` ON \`project_type\` (\`editAt\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_08d79d62ebed2047b04d370689\` ON \`project_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_dcd0c090ae5e30b64df13ad04b\` ON \`project_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_2b84df4a26caa40b15e04c6252\` ON \`project_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_536d6c9a5300a6e00c41878fe1\` ON \`project_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_67fd270a21c5fb4d59e8e5f5a4\` ON \`project_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_f8b8f63479e5ddcd5467847052\` ON \`project_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_da66886ba1b88c1c395afc68e9\` ON \`project_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_622fb00e1824c3b372504e1f38\` ON \`project_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_a2a57a982e469ae425150b858a\` ON \`project_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_51adb01a08f3dccecc34c98ba4\` ON \`hashtag\``);
        await queryRunner.query(`DROP INDEX \`IDX_44a67f9c1663b52036d51ab867\` ON \`hashtag\``);
        await queryRunner.query(`DROP INDEX \`IDX_1dcd7def7b00962e9842190de9\` ON \`hashtag\``);
        await queryRunner.query(`DROP INDEX \`IDX_33ef93fb58aa11f92fe90b0aa4\` ON \`hashtag\``);
        await queryRunner.query(`DROP INDEX \`IDX_0f76d95364edd24f039114dce3\` ON \`hashtag\``);
        await queryRunner.query(`DROP INDEX \`IDX_583cf0085e41d9c8d590580f20\` ON \`hashtag\``);
        await queryRunner.query(`DROP INDEX \`IDX_032d4ceb136efc5756168e8c9b\` ON \`hashtag\``);
        await queryRunner.query(`DROP INDEX \`IDX_57c8788340aacedfbf357001b3\` ON \`hashtag\``);
        await queryRunner.query(`DROP INDEX \`IDX_ed1306f5957d31a32c0548dcde\` ON \`hashtag\``);
    }

}

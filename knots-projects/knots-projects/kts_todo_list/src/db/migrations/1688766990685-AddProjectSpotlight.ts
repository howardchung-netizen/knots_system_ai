import {MigrationInterface, QueryRunner} from "typeorm";

export class AddProjectSpotlight1688766990685 implements MigrationInterface {
    name = 'AddProjectSpotlight1688766990685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_b9cd8dde7f727db9f5967aba7e\` ON \`spotlight\` (\`name_en\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_5458505ab975efce38431546b5\` ON \`spotlight\` (\`name_cht\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b78080f7c84b0f5a9b4009b498\` ON \`spotlight\` (\`hex\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_f96b8e89884a9dcbe4a928c823\` ON \`spotlight\` (\`preset\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_c451940daaf697981efd01b0ad\` ON \`spotlight\` (\`show\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_50397ef311e012268df1193070\` ON \`spotlight\` (\`sort\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_8deab507fa65d46c02bef750e6\` ON \`spotlight\` (\`createAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_a4bfbcf9a20274022187095bcf\` ON \`spotlight\` (\`editAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b97ee7ed819b9846f51f58e79a\` ON \`spotlight\` (\`deleted\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_5b53978fc1ae4025dc697be262\` ON \`spotlight\` (\`deleteAt\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_5b53978fc1ae4025dc697be262\` ON \`spotlight\``);
        await queryRunner.query(`DROP INDEX \`IDX_b97ee7ed819b9846f51f58e79a\` ON \`spotlight\``);
        await queryRunner.query(`DROP INDEX \`IDX_a4bfbcf9a20274022187095bcf\` ON \`spotlight\``);
        await queryRunner.query(`DROP INDEX \`IDX_8deab507fa65d46c02bef750e6\` ON \`spotlight\``);
        await queryRunner.query(`DROP INDEX \`IDX_50397ef311e012268df1193070\` ON \`spotlight\``);
        await queryRunner.query(`DROP INDEX \`IDX_c451940daaf697981efd01b0ad\` ON \`spotlight\``);
        await queryRunner.query(`DROP INDEX \`IDX_f96b8e89884a9dcbe4a928c823\` ON \`spotlight\``);
        await queryRunner.query(`DROP INDEX \`IDX_b78080f7c84b0f5a9b4009b498\` ON \`spotlight\``);
        await queryRunner.query(`DROP INDEX \`IDX_5458505ab975efce38431546b5\` ON \`spotlight\``);
        await queryRunner.query(`DROP INDEX \`IDX_b9cd8dde7f727db9f5967aba7e\` ON \`spotlight\``);
    }

}

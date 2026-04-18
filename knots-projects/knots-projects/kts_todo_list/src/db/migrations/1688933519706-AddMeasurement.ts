import {MigrationInterface, QueryRunner} from "typeorm";

export class AddMeasurement1688933519706 implements MigrationInterface {
    name = 'AddMeasurement1688933519706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_834854bfdd30290e1ab05ab923\` ON \`measurement\` (\`type_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_948703c5090de59d52793cc623\` ON \`measurement\` (\`name_cht\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_43327aabca28cb50b5ac77b2a6\` ON \`measurement\` (\`name_en\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_1741de1d1b3f35e4bbaed4937d\` ON \`measurement\` (\`sort\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_26e95216ba668d8c0574961897\` ON \`measurement\` (\`show\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_fbdac9d80ce6d83e5486d478d9\` ON \`measurement\` (\`deleted\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_1877b7acaa9cba7f9de8317811\` ON \`measurement\` (\`createAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_488cba9196378eddefea1de3ed\` ON \`measurement\` (\`editAt\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_488cba9196378eddefea1de3ed\` ON \`measurement\``);
        await queryRunner.query(`DROP INDEX \`IDX_1877b7acaa9cba7f9de8317811\` ON \`measurement\``);
        await queryRunner.query(`DROP INDEX \`IDX_fbdac9d80ce6d83e5486d478d9\` ON \`measurement\``);
        await queryRunner.query(`DROP INDEX \`IDX_26e95216ba668d8c0574961897\` ON \`measurement\``);
        await queryRunner.query(`DROP INDEX \`IDX_1741de1d1b3f35e4bbaed4937d\` ON \`measurement\``);
        await queryRunner.query(`DROP INDEX \`IDX_43327aabca28cb50b5ac77b2a6\` ON \`measurement\``);
        await queryRunner.query(`DROP INDEX \`IDX_948703c5090de59d52793cc623\` ON \`measurement\``);
        await queryRunner.query(`DROP INDEX \`IDX_834854bfdd30290e1ab05ab923\` ON \`measurement\``);
    }

}

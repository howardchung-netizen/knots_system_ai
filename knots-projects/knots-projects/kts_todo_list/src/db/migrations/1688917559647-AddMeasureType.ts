import {MigrationInterface, QueryRunner} from "typeorm";

export class AddMeasureType1688917559647 implements MigrationInterface {
    name = 'AddMeasureType1688917559647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_9d4a144fd523cba6126bba4e74\` ON \`measure_type\` (\`name_cht\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_5ebeac8124faf87ff1b70727a6\` ON \`measure_type\` (\`name_en\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_44bffe0cbac5d791ebd739d76b\` ON \`measure_type\` (\`sort\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_d0a317bab3f93a121c906f8357\` ON \`measure_type\` (\`show\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_8bdbb4fda184be6a446099d86b\` ON \`measure_type\` (\`deleted\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_f2a13ffda845a6703e4bfeee8f\` ON \`measure_type\` (\`createAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_f3f0073f1c6629240da1fa7559\` ON \`measure_type\` (\`editAt\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_f3f0073f1c6629240da1fa7559\` ON \`measure_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_f2a13ffda845a6703e4bfeee8f\` ON \`measure_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_8bdbb4fda184be6a446099d86b\` ON \`measure_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_d0a317bab3f93a121c906f8357\` ON \`measure_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_44bffe0cbac5d791ebd739d76b\` ON \`measure_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_5ebeac8124faf87ff1b70727a6\` ON \`measure_type\``);
        await queryRunner.query(`DROP INDEX \`IDX_9d4a144fd523cba6126bba4e74\` ON \`measure_type\``);
    }

}

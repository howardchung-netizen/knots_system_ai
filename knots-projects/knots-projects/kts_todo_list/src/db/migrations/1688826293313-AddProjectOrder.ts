import {MigrationInterface, QueryRunner} from "typeorm";

export class AddProjectOrder1688826293313 implements MigrationInterface {
    name = 'AddProjectOrder1688826293313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_form\` CHANGE \`supplier\` \`supplier\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_form\` CHANGE \`ordered\` \`ordered\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`order_form\` CHANGE \`ordered_date\` \`ordered_date\` date NULL`);
        await queryRunner.query(`UPDATE \`order_form\` SET \`ordered_date\` = NULL WHERE \`ordered_date\` = '0000-00-00'`);
        await queryRunner.query(`ALTER TABLE \`order_form\` CHANGE \`delivery\` \`delivery\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`order_form\` CHANGE \`delivery_date\` \`delivery_date\` date NULL`);
        await queryRunner.query(`UPDATE \`order_form\` SET \`delivery_date\` = NULL WHERE \`delivery_date\` = '0000-00-00'`);
        await queryRunner.query(`ALTER TABLE \`order_form\` CHANGE \`payment\` \`payment\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`order_form\` CHANGE \`cheque\` \`cheque\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_form\` CHANGE \`deleted\`  \`deleted\` tinyint NULL DEFAULT 0`);
        await queryRunner.query(`CREATE INDEX \`IDX_56c1ff1ac26d0b0db6fa18bcbc\` ON \`order_form\` (\`project_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_c8a1c78e7820cecc8c688dcb60\` ON \`order_form\` (\`status\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2b9d1df26a50d01e81ce0737f1\` ON \`order_form\` (\`supplier\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_a793bc8655604d17400d854cfa\` ON \`order_form\` (\`ordered_date\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_f9502c4273e866b4adf9391c31\` ON \`order_form\` (\`delivery\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_2904463ebb83769c8b83d98fac\` ON \`order_form\` (\`delivery_date\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_7aed301e20dfdba37f1c8f8e0c\` ON \`order_form\` (\`payment\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_7efe652690bcaa4f172291f95f\` ON \`order_form\` (\`cheque\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_8aa2888afea03bf93c6910158e\` ON \`order_form\` (\`amount\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_8aa2888afea03bf93c6910158e\` ON \`order_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_7efe652690bcaa4f172291f95f\` ON \`order_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_7aed301e20dfdba37f1c8f8e0c\` ON \`order_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_2904463ebb83769c8b83d98fac\` ON \`order_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_f9502c4273e866b4adf9391c31\` ON \`order_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_a793bc8655604d17400d854cfa\` ON \`order_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_2b9d1df26a50d01e81ce0737f1\` ON \`order_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_c8a1c78e7820cecc8c688dcb60\` ON \`order_form\``);
        await queryRunner.query(`DROP INDEX \`IDX_56c1ff1ac26d0b0db6fa18bcbc\` ON \`order_form\``);
    }

}

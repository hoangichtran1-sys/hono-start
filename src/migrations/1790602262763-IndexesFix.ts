import { MigrationInterface, QueryRunner } from "typeorm";

export class IndexesFix1790602262763 implements MigrationInterface {
    name = 'IndexesFix1790602262763'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4542dd2f38a61354a040ba9fd5"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE ("token")`);
        await queryRunner.query(`CREATE INDEX "IDX_444f2e9fbaaba23a2bfb7efd8d" ON "refresh_tokens"  ("replaced_by") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_444f2e9fbaaba23a2bfb7efd8d"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4542dd2f38a61354a040ba9fd5" ON "refresh_tokens" USING btree ("token") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" USING btree ("email") `);
    }

}

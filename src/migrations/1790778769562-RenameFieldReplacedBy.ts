import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameFieldReplacedBy1790778769562 implements MigrationInterface {
    name = 'RenameFieldReplacedBy1790778769562'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_444f2e9fbaaba23a2bfb7efd8d"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" RENAME COLUMN "replaced_by" TO "replacedBy"`);
        await queryRunner.query(`CREATE INDEX "IDX_5aeb031126998d9dff1da9d5ab" ON "refresh_tokens"  ("replacedBy") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_5aeb031126998d9dff1da9d5ab"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" RENAME COLUMN "replacedBy" TO "replaced_by"`);
        await queryRunner.query(`CREATE INDEX "IDX_444f2e9fbaaba23a2bfb7efd8d" ON "refresh_tokens" USING btree ("replaced_by") `);
    }

}

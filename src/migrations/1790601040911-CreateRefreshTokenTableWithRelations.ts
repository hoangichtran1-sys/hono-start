import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRefreshTokenTableWithRelations1790601040911 implements MigrationInterface {
    name = 'CreateRefreshTokenTableWithRelations1790601040911'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "token" text NOT NULL, "revoked" boolean NOT NULL DEFAULT false, "expiresAt" date NOT NULL, "replaced_by" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_610102b60fea1455310ccd299d" ON "refresh_tokens"  ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4542dd2f38a61354a040ba9fd5" ON "refresh_tokens"  ("token") `);
        await queryRunner.query(`CREATE INDEX "IDX_99c909ef3653dd42fd5cb2e2c3" ON "refresh_tokens"  ("revoked", "expiresAt") `);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users"  ("email") `);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99c909ef3653dd42fd5cb2e2c3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4542dd2f38a61354a040ba9fd5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_610102b60fea1455310ccd299d"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    }

}

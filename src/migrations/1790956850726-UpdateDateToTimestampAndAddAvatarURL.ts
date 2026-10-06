import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDateToTimestampAndAddAvatarURL1790956850726 implements MigrationInterface {
    name = 'UpdateDateToTimestampAndAddAvatarURL1790956850726'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "avatarUrl" text`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerifiedAt"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerifiedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99c909ef3653dd42fd5cb2e2c3"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_99c909ef3653dd42fd5cb2e2c3" ON "refresh_tokens"  ("revoked", "expiresAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_99c909ef3653dd42fd5cb2e2c3"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "expiresAt" date NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_99c909ef3653dd42fd5cb2e2c3" ON "refresh_tokens" USING btree ("expiresAt", "revoked") `);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerifiedAt"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerifiedAt" date`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarUrl"`);
    }

}

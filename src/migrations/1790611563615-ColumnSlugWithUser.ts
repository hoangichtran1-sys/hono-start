import { MigrationInterface, QueryRunner } from "typeorm";

export class ColumnSlugWithUser1790611563615 implements MigrationInterface {
    name = 'ColumnSlugWithUser1790611563615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "slug" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_bc0c27d77ee64f0a097a5c269b3" UNIQUE ("slug")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_bc0c27d77ee64f0a097a5c269b3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "slug"`);
    }

}

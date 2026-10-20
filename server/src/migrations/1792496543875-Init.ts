import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1792496543875 implements MigrationInterface {
  name = "Init1792496543875";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "word" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "word" character varying(67) NOT NULL,
                "key" character varying(255) NOT NULL,
                "count" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ad026d65e30f80b7056ca31f666" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_5427ed456ca83ac35c334fdce5" ON "word" ("key")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_0d7e98b3e60169356e32fa88bd" ON "word" ("count")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_0d7e98b3e60169356e32fa88bd"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5427ed456ca83ac35c334fdce5"
        `);
    await queryRunner.query(`
            DROP TABLE "word"
        `);
  }
}

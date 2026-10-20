import { MigrationInterface, QueryRunner } from "typeorm";

export class WordsSchema1792483052071 implements MigrationInterface {
  name = "WordsSchema1792483052071";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "word" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "word" character varying(64) NOT NULL, "count" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ad026d65e30f80b7056ca31f666" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0d7e98b3e60169356e32fa88bd" ON "word" ("count") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0d7e98b3e60169356e32fa88bd"`,
    );
    await queryRunner.query(`DROP TABLE "word"`);
  }
}

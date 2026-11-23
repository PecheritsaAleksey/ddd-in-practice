import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDelivery1795438607019 implements MigrationInterface {
  name = 'CreateDelivery1795438607019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL, "status" character varying(20) NOT NULL, "x" integer NOT NULL, "y" integer NOT NULL, "volume" integer NOT NULL, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "assignments" ("id" uuid NOT NULL, "order_id" uuid NOT NULL, "status" character varying(20) NOT NULL, "x" integer NOT NULL, "y" integer NOT NULL, "volume" integer NOT NULL, "courier_id" uuid NOT NULL, CONSTRAINT "UQ_41570990ff8a6d347775211a241" UNIQUE ("order_id"), CONSTRAINT "PK_c54ca359535e0012b04dcbd80ee" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "couriers" ("id" uuid NOT NULL, "x" integer NOT NULL, "y" integer NOT NULL, "name" character varying NOT NULL, "max_volume" integer NOT NULL, CONSTRAINT "PK_141c3ed6f70beb9ddf4ab4a0e86" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "assignments" ADD CONSTRAINT "FK_47b809cadcd4674ba9ebb5a007c" FOREIGN KEY ("courier_id") REFERENCES "couriers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "assignments" DROP CONSTRAINT "FK_47b809cadcd4674ba9ebb5a007c"`,
    );
    await queryRunner.query(`DROP TABLE "couriers"`);
    await queryRunner.query(`DROP TABLE "assignments"`);
    await queryRunner.query(`DROP TABLE "orders"`);
  }
}

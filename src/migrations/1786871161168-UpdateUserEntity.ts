import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserEntity1786871161168 implements MigrationInterface {
  name = 'UpdateUserEntity1786871161168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_7c4efc5ecbdbcb378b7a43fa011"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "keycloakId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "keycloakId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_7c4efc5ecbdbcb378b7a43fa011" UNIQUE ("keycloakId")`,
    );
  }
}

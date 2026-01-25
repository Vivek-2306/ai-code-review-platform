import { MigrationInterface, QueryRunner } from "typeorm";

export class IndexUserTable1769366147245 implements MigrationInterface {
    name = 'IndexUserTable1769366147245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "idx_users_email" ON "users" ("email")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."idx_users_email"
        `);
    }

}

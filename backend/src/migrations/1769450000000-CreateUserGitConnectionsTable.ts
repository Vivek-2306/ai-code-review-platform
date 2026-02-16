import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserGitConnectionsTable1769450000000 implements MigrationInterface {
    name = 'CreateUserGitConnectionsTable1769450000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user_git_connections" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "provider" character varying(32) NOT NULL,
                "access_token" text NOT NULL,
                "refresh_token" text,
                "expires_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user_git_connections_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_user_git_connections_user_provider" UNIQUE ("user_id", "provider"),
                CONSTRAINT "FK_user_git_connections_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_user_git_connections_user_id" ON "user_git_connections" ("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_user_git_connections_provider" ON "user_git_connections" ("provider")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "user_git_connections"`);
    }
}

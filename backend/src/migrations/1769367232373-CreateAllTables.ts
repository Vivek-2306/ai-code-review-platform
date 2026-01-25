import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAllTables1769367232373 implements MigrationInterface {
    name = 'CreateAllTables1769367232373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "resource" character varying(100) NOT NULL,
                "action" character varying(100) NOT NULL,
                CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_permissions_name" ON "permissions" ("name")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_permissions_resource_action" ON "permissions" ("resource", "action")
        `);
        await queryRunner.query(`
            CREATE TABLE "role_permissions" (
                "role_id" uuid NOT NULL,
                "permission_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY ("role_id", "permission_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_role_permissions_permission_id" ON "role_permissions" ("permission_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_role_permissions_role_id" ON "role_permissions" ("role_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "description" text,
                CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"),
                CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_roles_name" ON "roles" ("name")
        `);
        await queryRunner.query(`
            CREATE TABLE "project_members" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "project_id" uuid NOT NULL,
                "role_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_project_members_user_project_role" UNIQUE ("user_id", "project_id", "role_id"),
                CONSTRAINT "PK_0b2f46f804be4aea9234c78bcc9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_project_members_role_id" ON "project_members" ("role_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_project_members_project_id" ON "project_members" ("project_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_project_members_user_id" ON "project_members" ("user_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "projects" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "owner_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_projects_name" ON "projects" ("name")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_projects_owner_id" ON "projects" ("owner_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "user_roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "role_id" uuid NOT NULL,
                "project_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_user_roles_user_role_project" UNIQUE ("user_id", "role_id", "project_id"),
                CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_user_roles_project_id" ON "user_roles" ("project_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_user_roles_role_id" ON "user_roles" ("role_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_user_roles_user_id" ON "user_roles" ("user_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permissions"
            ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permissions"
            ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "project_members"
            ADD CONSTRAINT "FK_e89aae80e010c2faa72e6a49ce8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "project_members"
            ADD CONSTRAINT "FK_b5729113570c20c7e214cf3f58d" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "project_members"
            ADD CONSTRAINT "FK_47b9998e6fef04f3e85e1e60948" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "projects"
            ADD CONSTRAINT "FK_b1bd2fbf5d0ef67319c91acb5cf" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_78895f53dbfb0f191e26e494572" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "FK_78895f53dbfb0f191e26e494572"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"
        `);
        await queryRunner.query(`
            ALTER TABLE "projects" DROP CONSTRAINT "FK_b1bd2fbf5d0ef67319c91acb5cf"
        `);
        await queryRunner.query(`
            ALTER TABLE "project_members" DROP CONSTRAINT "FK_47b9998e6fef04f3e85e1e60948"
        `);
        await queryRunner.query(`
            ALTER TABLE "project_members" DROP CONSTRAINT "FK_b5729113570c20c7e214cf3f58d"
        `);
        await queryRunner.query(`
            ALTER TABLE "project_members" DROP CONSTRAINT "FK_e89aae80e010c2faa72e6a49ce8"
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"
        `);
        await queryRunner.query(`
            ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_user_roles_user_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_user_roles_role_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_user_roles_project_id"
        `);
        await queryRunner.query(`
            DROP TABLE "user_roles"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_projects_owner_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_projects_name"
        `);
        await queryRunner.query(`
            DROP TABLE "projects"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_project_members_user_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_project_members_project_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_project_members_role_id"
        `);
        await queryRunner.query(`
            DROP TABLE "project_members"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_roles_name"
        `);
        await queryRunner.query(`
            DROP TABLE "roles"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_role_permissions_role_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_role_permissions_permission_id"
        `);
        await queryRunner.query(`
            DROP TABLE "role_permissions"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_permissions_resource_action"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_permissions_name"
        `);
        await queryRunner.query(`
            DROP TABLE "permissions"
        `);
    }

}

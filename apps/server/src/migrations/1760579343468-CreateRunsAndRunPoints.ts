import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRunsAndRunPoints1760579343468 implements MigrationInterface {
    name = 'CreateRunsAndRunPoints1760579343468'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_USER_EMAIL"`);
        await queryRunner.query(`CREATE TABLE "run_points" ("id" BIGSERIAL NOT NULL, "run_id" uuid NOT NULL, "seq" integer NOT NULL, "recorded_at" TIMESTAMP WITH TIME ZONE NOT NULL, "loc" geometry(Point,4326) NOT NULL, "elevation_m" real, "speed_mps" real, "bearing_deg" real, "accuracy_m" real, "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9a18bf300bbca4b00d888106dd9" UNIQUE ("run_id", "seq"), CONSTRAINT "PK_c3d02ae63f8d2fa2e6991a1e820" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_606da3520b5fb0ce7bcc756863" ON "run_points" ("run_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_9a18bf300bbca4b00d888106dd" ON "run_points" ("run_id", "seq") `);
        await queryRunner.query(`CREATE TYPE "public"."runs_mode_enum" AS ENUM('course', 'free')`);
        await queryRunner.query(`CREATE TYPE "public"."runs_status_enum" AS ENUM('in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "runs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "course_id" uuid, "mode" "public"."runs_mode_enum" NOT NULL DEFAULT 'free', "status" "public"."runs_status_enum" NOT NULL DEFAULT 'in_progress', "started_at" TIMESTAMP NOT NULL DEFAULT now(), "completed_at" TIMESTAMP WITH TIME ZONE, "duration_s" integer, "distance_m" integer, "avg_pace_s_per_km" integer, "elevation_gain_m" real, "off_route_alerts" integer NOT NULL DEFAULT '0', "is_personal_record" boolean NOT NULL DEFAULT false, "poly_simplified" geometry(LineString,4326), "geojson_summary" jsonb, "converted_course_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_46d6a1e257c38ba58f1a3c30836" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_877e8bcffb46e56be6c4baa4f5" ON "runs" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5a08edc732f1ed427194e05e3f" ON "runs" ("user_id", "status", "started_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "run_points" ADD CONSTRAINT "FK_606da3520b5fb0ce7bcc7568632" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "runs" ADD CONSTRAINT "FK_877e8bcffb46e56be6c4baa4f56" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "runs" DROP CONSTRAINT "FK_877e8bcffb46e56be6c4baa4f56"`);
        await queryRunner.query(`ALTER TABLE "run_points" DROP CONSTRAINT "FK_606da3520b5fb0ce7bcc7568632"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5a08edc732f1ed427194e05e3f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_877e8bcffb46e56be6c4baa4f5"`);
        await queryRunner.query(`DROP TABLE "runs"`);
        await queryRunner.query(`DROP TYPE "public"."runs_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."runs_mode_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9a18bf300bbca4b00d888106dd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_606da3520b5fb0ce7bcc756863"`);
        await queryRunner.query(`DROP TABLE "run_points"`);
        await queryRunner.query(`CREATE INDEX "IDX_USER_EMAIL" ON "users" ("email") `);
    }

}

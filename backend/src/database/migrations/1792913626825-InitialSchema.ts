import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1792913626825 implements MigrationInterface {
    name = 'InitialSchema1792913626825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "admin_users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying(255) NOT NULL,
                "password_hash" character varying(255) NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_06744d221bb6145dc61e5dc441d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_dcd0c8a4b10af9c986e510b9ec" ON "admin_users" ("email")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."enquiry_type_enum" AS ENUM('MEDICAL', 'TOURISM')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."enquiry_status_enum" AS ENUM(
                'NEW',
                'REVIEWING',
                'CONTACTED',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELLED'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."preferred_language_enum" AS ENUM('ENGLISH', 'ARABIC')
        `);
        await queryRunner.query(`
            CREATE TABLE "enquiries" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "enquiry_number" character varying(30) NOT NULL,
                "type" "public"."enquiry_type_enum" NOT NULL,
                "status" "public"."enquiry_status_enum" NOT NULL DEFAULT 'NEW',
                "customer_name" character varying(150) NOT NULL,
                "email" character varying(255),
                "phone" character varying(30) NOT NULL,
                "country" character varying(100) NOT NULL,
                "preferred_language" "public"."preferred_language_enum" NOT NULL DEFAULT 'ENGLISH',
                "message" text,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_1516c8a887df94dc119a1db749e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_915de28b4b2108a6682f8983c3" ON "enquiries" ("enquiry_number")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_enquiries_created_at" ON "enquiries" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_enquiries_type_status" ON "enquiries" ("type", "status")
        `);
        await queryRunner.query(`
            CREATE TABLE "medical_enquiry_details" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "enquiry_id" uuid NOT NULL,
                "treatment_specialty" character varying(150) NOT NULL,
                "preferred_hospital" character varying(200),
                "preferred_appointment_date" date,
                "travel_companions" smallint,
                "additional_requirements" text,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "REL_d4de96c02827855ef86fbb95b7" UNIQUE ("enquiry_id"),
                CONSTRAINT "PK_2125e2f7ad20c82383a5444eb32" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "tourism_enquiry_details" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "enquiry_id" uuid NOT NULL,
                "preferred_destination" character varying(200) NOT NULL DEFAULT 'Kerala',
                "travel_start_date" date,
                "travel_end_date" date,
                "number_of_travelers" smallint,
                "travel_interests" text,
                "accommodation_required" boolean NOT NULL DEFAULT false,
                "additional_requirements" text,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "REL_4ef035192c44759a2b3d81bdac" UNIQUE ("enquiry_id"),
                CONSTRAINT "PK_da47f9d414e4e86f65b835992f3" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "enquiry_notes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "enquiry_id" uuid NOT NULL,
                "admin_user_id" uuid NOT NULL,
                "content" text NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_37dbe1e32053750520cfa9a472e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_enquiry_notes_enquiry_created" ON "enquiry_notes" ("enquiry_id", "created_at")
        `);
        await queryRunner.query(`
            CREATE TABLE "activity_logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "enquiry_id" uuid NOT NULL,
                "admin_user_id" uuid,
                "action" character varying(100) NOT NULL,
                "description" text NOT NULL,
                "metadata" jsonb,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_f25287b6140c5ba18d38776a796" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_activity_logs_enquiry_created" ON "activity_logs" ("enquiry_id", "created_at")
        `);
        await queryRunner.query(`
            ALTER TABLE "medical_enquiry_details"
            ADD CONSTRAINT "FK_d4de96c02827855ef86fbb95b73" FOREIGN KEY ("enquiry_id") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "tourism_enquiry_details"
            ADD CONSTRAINT "FK_4ef035192c44759a2b3d81bdac9" FOREIGN KEY ("enquiry_id") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "enquiry_notes"
            ADD CONSTRAINT "FK_7d90d3ab90a00c6da6437c7b223" FOREIGN KEY ("enquiry_id") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "enquiry_notes"
            ADD CONSTRAINT "FK_4ff66036f2147e17ac21d854bc1" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "activity_logs"
            ADD CONSTRAINT "FK_00124e15bfce5822a52138fe254" FOREIGN KEY ("enquiry_id") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "activity_logs"
            ADD CONSTRAINT "FK_99735442ec28dd77241b4075585" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_99735442ec28dd77241b4075585"
        `);
        await queryRunner.query(`
            ALTER TABLE "activity_logs" DROP CONSTRAINT "FK_00124e15bfce5822a52138fe254"
        `);
        await queryRunner.query(`
            ALTER TABLE "enquiry_notes" DROP CONSTRAINT "FK_4ff66036f2147e17ac21d854bc1"
        `);
        await queryRunner.query(`
            ALTER TABLE "enquiry_notes" DROP CONSTRAINT "FK_7d90d3ab90a00c6da6437c7b223"
        `);
        await queryRunner.query(`
            ALTER TABLE "tourism_enquiry_details" DROP CONSTRAINT "FK_4ef035192c44759a2b3d81bdac9"
        `);
        await queryRunner.query(`
            ALTER TABLE "medical_enquiry_details" DROP CONSTRAINT "FK_d4de96c02827855ef86fbb95b73"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_activity_logs_enquiry_created"
        `);
        await queryRunner.query(`
            DROP TABLE "activity_logs"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_enquiry_notes_enquiry_created"
        `);
        await queryRunner.query(`
            DROP TABLE "enquiry_notes"
        `);
        await queryRunner.query(`
            DROP TABLE "tourism_enquiry_details"
        `);
        await queryRunner.query(`
            DROP TABLE "medical_enquiry_details"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_enquiries_type_status"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_enquiries_created_at"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_915de28b4b2108a6682f8983c3"
        `);
        await queryRunner.query(`
            DROP TABLE "enquiries"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."preferred_language_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."enquiry_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."enquiry_type_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_dcd0c8a4b10af9c986e510b9ec"
        `);
        await queryRunner.query(`
            DROP TABLE "admin_users"
        `);
    }

}

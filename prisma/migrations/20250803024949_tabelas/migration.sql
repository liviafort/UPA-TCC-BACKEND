-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('ENTRADA', 'TRIAGEM', 'ATENDIMENTO');

-- CreateEnum
CREATE TYPE "public"."ClassificacaoTriagem" AS ENUM ('VERDE', 'AMARELO', 'LARANJA', 'VERMELHO', 'AZUL');

-- CreateEnum
CREATE TYPE "public"."PatientStatusEnum" AS ENUM ('WAITING_TRIAGE', 'WAITING_CARE', 'COMPLETED');

-- CreateTable
CREATE TABLE "public"."auth_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "permissions" TEXT[],
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."upas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "operating_hours" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patient_events" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "upa_id" TEXT NOT NULL,
    "event_type" "public"."EventType" NOT NULL,
    "bairro" TEXT,
    "classificacao" "public"."ClassificacaoTriagem",
    "timestamp" TIMESTAMP(3) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patient_status" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "upa_id" TEXT NOT NULL,
    "bairro" TEXT,
    "status" "public"."PatientStatusEnum" NOT NULL,
    "classificacao" "public"."ClassificacaoTriagem",
    "entrada_timestamp" TIMESTAMP(3),
    "triagem_timestamp" TIMESTAMP(3),
    "atendimento_timestamp" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_tokens_token_key" ON "public"."auth_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "upas_name_key" ON "public"."upas"("name");

-- CreateIndex
CREATE INDEX "patient_events_patient_id_event_type_upa_id_idx" ON "public"."patient_events"("patient_id", "event_type", "upa_id");

-- CreateIndex
CREATE INDEX "patient_events_upa_id_timestamp_idx" ON "public"."patient_events"("upa_id", "timestamp");

-- AddForeignKey
ALTER TABLE "public"."patient_events" ADD CONSTRAINT "patient_events_upa_id_fkey" FOREIGN KEY ("upa_id") REFERENCES "public"."upas"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

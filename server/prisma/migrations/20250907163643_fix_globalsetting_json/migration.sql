-- AlterTable
ALTER TABLE "GlobalSetting" ALTER COLUMN "value" SET DATA TYPE JSONB USING "value"::jsonb;
-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('NUTRITION', 'PROGRESS', 'MEAL_PLAN', 'ACTIVITY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'EXCEL', 'CSV');

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "clientId" TEXT,
    "type" "ReportType" NOT NULL DEFAULT 'CUSTOM',
    "format" "ReportFormat" NOT NULL DEFAULT 'PDF',
    "title" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_createdBy_idx" ON "reports"("createdBy");

-- CreateIndex
CREATE INDEX "reports_clientId_idx" ON "reports"("clientId");

-- CreateIndex
CREATE INDEX "reports_type_idx" ON "reports"("type");

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "reports"("createdAt");

-- CreateIndex
CREATE INDEX "reports_deletedAt_idx" ON "reports"("deletedAt");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

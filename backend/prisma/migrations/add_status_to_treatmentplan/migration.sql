-- Add status and completedAt to TreatmentPlan
ALTER TABLE "TreatmentPlan" 
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "completedAt" TIMESTAMP; 
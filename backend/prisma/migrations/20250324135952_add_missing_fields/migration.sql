-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "completionNote" TEXT,
ADD COLUMN     "completionReason" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "specialization" TEXT;

-- CreateTable
CREATE TABLE "TreatmentTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "variables" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "treatmentTemplateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionTreatmentTemplate" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "treatmentTemplateId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "assignedById" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionTreatmentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentEvaluation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "treatmentTemplateId" TEXT NOT NULL,
    "effectiveness" INTEGER NOT NULL,
    "patientCompliance" TEXT NOT NULL,
    "comments" TEXT,
    "evaluatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFavorite_userId_treatmentTemplateId_key" ON "UserFavorite"("userId", "treatmentTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionTreatmentTemplate_sessionId_key" ON "SessionTreatmentTemplate"("sessionId");

-- AddForeignKey
ALTER TABLE "TreatmentTemplate" ADD CONSTRAINT "TreatmentTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_treatmentTemplateId_fkey" FOREIGN KEY ("treatmentTemplateId") REFERENCES "TreatmentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTreatmentTemplate" ADD CONSTRAINT "SessionTreatmentTemplate_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTreatmentTemplate" ADD CONSTRAINT "SessionTreatmentTemplate_treatmentTemplateId_fkey" FOREIGN KEY ("treatmentTemplateId") REFERENCES "TreatmentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentEvaluation" ADD CONSTRAINT "TreatmentEvaluation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentEvaluation" ADD CONSTRAINT "TreatmentEvaluation_treatmentTemplateId_fkey" FOREIGN KEY ("treatmentTemplateId") REFERENCES "TreatmentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentEvaluation" ADD CONSTRAINT "TreatmentEvaluation_evaluatedById_fkey" FOREIGN KEY ("evaluatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

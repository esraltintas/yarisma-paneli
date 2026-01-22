-- CreateEnum
CREATE TYPE "Mode" AS ENUM ('piyade', 'keskin');

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL DEFAULT 'piyade',
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageResult" (
    "id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL DEFAULT 'piyade',
    "participantId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "valueSec" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Participant_mode_idx" ON "Participant"("mode");

-- CreateIndex
CREATE INDEX "StageResult_mode_stageId_idx" ON "StageResult"("mode", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "StageResult_mode_participantId_stageId_key" ON "StageResult"("mode", "participantId", "stageId");

-- AddForeignKey
ALTER TABLE "StageResult" ADD CONSTRAINT "StageResult_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

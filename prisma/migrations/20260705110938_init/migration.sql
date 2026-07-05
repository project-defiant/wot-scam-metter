-- CreateTable
CREATE TABLE "ReplayCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalFilename" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "replayCaseId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientFingerprint" TEXT,
    CONSTRAINT "Assessment_replayCaseId_fkey" FOREIGN KEY ("replayCaseId") REFERENCES "ReplayCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ReplayCase_createdAt_idx" ON "ReplayCase"("createdAt");

-- CreateIndex
CREATE INDEX "Assessment_replayCaseId_createdAt_idx" ON "Assessment"("replayCaseId", "createdAt");

-- CreateIndex
CREATE INDEX "Assessment_clientFingerprint_createdAt_idx" ON "Assessment"("clientFingerprint", "createdAt");

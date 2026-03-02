/*
  Warnings:

  - You are about to alter the column `communication` on the `Provider` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `flexibility` on the `Provider` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `globalRating` on the `Provider` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `professionalism` on the `Provider` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `punctuality` on the `Provider` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `serviceQuality` on the `Provider` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `valueForMoney` on the `Provider` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Provider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "providerType" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "website" TEXT,
    "zone" TEXT,
    "servicesOffered" TEXT,
    "minPrice" REAL,
    "avgPrice" REAL,
    "maxPrice" REAL,
    "specialConditions" TEXT,
    "availableDays" TEXT,
    "usualHours" TEXT,
    "setupTime" TEXT,
    "teardownTime" TEXT,
    "technicalNeeds" TEXT,
    "firstContactDate" DATETIME,
    "contactChannel" TEXT,
    "initialResponse" TEXT,
    "contractedStatus" TEXT,
    "hired" BOOLEAN NOT NULL DEFAULT false,
    "relationshipType" TEXT,
    "agreedConditions" TEXT,
    "professionalism" REAL,
    "communication" REAL,
    "punctuality" REAL,
    "serviceQuality" REAL,
    "flexibility" REAL,
    "valueForMoney" REAL,
    "globalRating" REAL,
    "repeatStatus" TEXT,
    "importantNotes" TEXT,
    "followUp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Provider" ("agreedConditions", "availableDays", "avgPrice", "businessName", "communication", "contactChannel", "contactName", "createdAt", "email", "firstContactDate", "flexibility", "followUp", "globalRating", "hired", "id", "importantNotes", "initialResponse", "instagram", "maxPrice", "minPrice", "phone", "professionalism", "providerType", "punctuality", "relationshipType", "serviceQuality", "servicesOffered", "setupTime", "specialConditions", "teardownTime", "technicalNeeds", "updatedAt", "usualHours", "valueForMoney", "website", "zone") SELECT "agreedConditions", "availableDays", "avgPrice", "businessName", "communication", "contactChannel", "contactName", "createdAt", "email", "firstContactDate", "flexibility", "followUp", "globalRating", "hired", "id", "importantNotes", "initialResponse", "instagram", "maxPrice", "minPrice", "phone", "professionalism", "providerType", "punctuality", "relationshipType", "serviceQuality", "servicesOffered", "setupTime", "specialConditions", "teardownTime", "technicalNeeds", "updatedAt", "usualHours", "valueForMoney", "website", "zone" FROM "Provider";
DROP TABLE "Provider";
ALTER TABLE "new_Provider" RENAME TO "Provider";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

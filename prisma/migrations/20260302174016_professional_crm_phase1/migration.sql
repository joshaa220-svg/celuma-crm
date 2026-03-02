-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'AGENT',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 2,
    "entityType" TEXT,
    "entityId" INTEGER,
    "createdById" INTEGER NOT NULL,
    "assignedToId" INTEGER,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "channel" TEXT,
    "contactAt" DATETIME,
    "createdById" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Note_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" INTEGER,
    "summary" TEXT,
    "beforeJson" TEXT,
    "afterJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BackupLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filePath" TEXT NOT NULL,
    "createdById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BackupLog_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "eventType" TEXT,
    "eventDate" DATETIME,
    "eventLocation" TEXT,
    "guestCount" INTEGER,
    "budgetMin" REAL,
    "budgetMax" REAL,
    "status" TEXT NOT NULL DEFAULT 'Lead',
    "source" TEXT,
    "assignedProviderType" TEXT,
    "notes" TEXT,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "documentLinks" TEXT,
    "gdprConsent" BOOLEAN NOT NULL DEFAULT false,
    "gdprConsentAt" DATETIME,
    "dataRetentionUntil" DATETIME,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Client" ("assignedProviderType", "budgetMax", "budgetMin", "createdAt", "email", "eventDate", "eventLocation", "eventType", "fullName", "guestCount", "id", "notes", "phone", "source", "status", "updatedAt") SELECT "assignedProviderType", "budgetMax", "budgetMin", "createdAt", "email", "eventDate", "eventLocation", "eventType", "fullName", "guestCount", "id", "notes", "phone", "source", "status", "updatedAt" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
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
    "documentLinks" TEXT,
    "gdprConsentForMedia" BOOLEAN NOT NULL DEFAULT false,
    "gdprConsentAt" DATETIME,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Provider" ("agreedConditions", "availableDays", "avgPrice", "businessName", "communication", "contactChannel", "contactName", "contractedStatus", "createdAt", "email", "firstContactDate", "flexibility", "followUp", "globalRating", "hired", "id", "importantNotes", "initialResponse", "instagram", "maxPrice", "minPrice", "phone", "professionalism", "providerType", "punctuality", "relationshipType", "repeatStatus", "serviceQuality", "servicesOffered", "setupTime", "specialConditions", "teardownTime", "technicalNeeds", "updatedAt", "usualHours", "valueForMoney", "website", "zone") SELECT "agreedConditions", "availableDays", "avgPrice", "businessName", "communication", "contactChannel", "contactName", "contractedStatus", "createdAt", "email", "firstContactDate", "flexibility", "followUp", "globalRating", "hired", "id", "importantNotes", "initialResponse", "instagram", "maxPrice", "minPrice", "phone", "professionalism", "providerType", "punctuality", "relationshipType", "repeatStatus", "serviceQuality", "servicesOffered", "setupTime", "specialConditions", "teardownTime", "technicalNeeds", "updatedAt", "usualHours", "valueForMoney", "website", "zone" FROM "Provider";
DROP TABLE "Provider";
ALTER TABLE "new_Provider" RENAME TO "Provider";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

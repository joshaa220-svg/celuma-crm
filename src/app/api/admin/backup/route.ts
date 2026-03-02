import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const workspace = process.cwd();
  const source = path.join(workspace, "prisma", "dev.db");
  const backupDir = path.join(workspace, "backups");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `backup-${stamp}.db`;
  const destination = path.join(backupDir, fileName);

  await mkdir(backupDir, { recursive: true });
  await copyFile(source, destination);

  const backup = await prisma.backupLog.create({
    data: {
      filePath: destination,
      createdById: user.id,
    },
  });

  await logActivity({
    userId: user.id,
    action: "BACKUP_CREATED",
    summary: destination,
    after: backup,
  });

  return NextResponse.json({ ok: true, file: destination });
}
